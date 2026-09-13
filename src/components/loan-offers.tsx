import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Info, Loader2, LocateFixed, MessageCircle, ShieldCheck, X } from "lucide-react";
import type { DemoUser } from "@/lib/groscore-data";
import { Button } from "@/components/ui/button";

export type Persona = "rejected" | "prime" | "thin" | "ntc" | "zero";
type WorkType = "Salaried" | "Self-employed" | "Student" | "";
type SalaryMode = "Bank transfer" | "Cash" | "Cheque" | "";
type Step = "intro" | "work" | "income" | "salary" | "pincode" | "dob" | "checking" | "offers";

export interface LoanJourneyState {
  step: Step;
  persona: Persona;
  work: WorkType;
  income: string;
  salaryMode: SalaryMode;
  pincode: string;
  dob: string;
  applied: string[];
}

export const createLoanJourneyState = (firstVisit: boolean): LoanJourneyState => ({
  step: firstVisit ? "intro" : "offers", persona: "rejected", work: "", income: "", salaryMode: "", pincode: "", dob: "", applied: [],
});

type Offer = {
  id: string; lender: string; product: string; initial: string; chance: 3 | 4 | 5;
  chanceLabel: "Fair" | "Good" | "High"; amount: string; rate: string; options?: string[];
};
type LockedOffer = { id: string; lender: string; product: string; initial: string; distance: string; reason: "issues" | "time" };

const AVAILABLE: Offer[] = [
  { id: "moneyview", lender: "Moneyview", product: "Personal Loan", initial: "M", chance: 5, chanceLabel: "High", amount: "₹40,000–₹60,000", rate: "14%+" },
  { id: "tez", lender: "Tez Credit", product: "Personal Loan", initial: "T", chance: 4, chanceLabel: "Good", amount: "₹30,000–₹50,000", rate: "16%+", options: ["Instant Personal Loan", "Flexi Personal Loan"] },
  { id: "ram", lender: "Ram Fincorp", product: "Personal Loan", initial: "R", chance: 4, chanceLabel: "Good", amount: "₹25,000–₹45,000", rate: "18%+" },
  { id: "kreditbee", lender: "KreditBee", product: "Personal Loan", initial: "K", chance: 3, chanceLabel: "Fair", amount: "₹20,000–₹35,000", rate: "19%+" },
  { id: "kissht", lender: "Kissht", product: "Consumer Loan", initial: "K", chance: 3, chanceLabel: "Fair", amount: "Check amount", rate: "20%+" },
  { id: "bharatpe", lender: "BharatPe", product: "Business Loan", initial: "B", chance: 3, chanceLabel: "Fair", amount: "₹35,000–₹55,000", rate: "18%+" },
  { id: "zype", lender: "Zype", product: "Personal Loan", initial: "Z", chance: 3, chanceLabel: "Fair", amount: "₹20,000–₹40,000", rate: "21%+" },
  { id: "lendingplate", lender: "Lendingplate", product: "Personal Loan", initial: "L", chance: 3, chanceLabel: "Fair", amount: "Check amount", rate: "22%+" },
  { id: "creditsea", lender: "Credit Sea", product: "Credit Line", initial: "C", chance: 3, chanceLabel: "Fair", amount: "₹15,000–₹30,000", rate: "24%+" },
];
const LOCKED_ISSUES: LockedOffer[] = [
  { id: "lock-moneyview", lender: "Moneyview", product: "Personal Loan", initial: "M", distance: "About 30 points away", reason: "issues" },
  { id: "lock-prefr", lender: "Prefr", product: "Personal Loan", initial: "P", distance: "Fix 2 credit issues", reason: "issues" },
  { id: "lock-hdfc", lender: "HDFC", product: "Personal Loan", initial: "H", distance: "About 45 points away", reason: "issues" },
  { id: "lock-kissht", lender: "Kissht", product: "Personal Loan", initial: "K", distance: "Fix 2 credit issues", reason: "issues" },
  { id: "lock-creditsea", lender: "Credit Sea", product: "Credit Line", initial: "C", distance: "About 55 points away", reason: "issues" },
];
const LOCKED_TIME: LockedOffer[] = [
  { id: "time-prefr", lender: "Prefr", product: "Personal Loan", initial: "P", distance: "May unlock in 4 months", reason: "time" },
  { id: "time-tez", lender: "Tez Credit", product: "Personal Loan", initial: "T", distance: "May unlock in 4 months", reason: "time" },
  { id: "time-hdfc", lender: "HDFC", product: "Credit Card", initial: "H", distance: "May unlock in 4 months", reason: "time" },
  { id: "time-zype", lender: "Zype", product: "Personal Loan", initial: "Z", distance: "May unlock in 4 months", reason: "time" },
];
const NTC_LENDERS = ["mPokket", "Abhiloans", "Loan112", "ClickPE", "Jupiter Rupay Card"];
const LOGOS = ["M", "T", "R", "K", "B", "H"];

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="absolute inset-0 z-50 flex items-end">
    <Button aria-label="Close sheet" variant="ghost" className="absolute inset-0 h-auto w-full rounded-none bg-foreground/40 hover:bg-foreground/40" onClick={onClose} />
    <div className="relative w-full rounded-t-2xl bg-card p-5 pb-8 shadow-2xl">
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
      <div className="flex items-start justify-between gap-4"><h3 className="font-display text-lg font-bold text-card-foreground">{title}</h3><Button aria-label="Close" size="icon" variant="ghost" onClick={onClose}><X /></Button></div>
      {children}
    </div>
  </div>;
}

function ChoiceSheet({ title, options, value, onPick, onClose }: { title: string; options: Array<{ label: string; explainer?: string }>; value: string; onPick: (value: string) => void; onClose: () => void }) {
  return <Sheet title={title} onClose={onClose}><div className="mt-3 space-y-1">{options.map((option) => <Button key={option.label} variant="ghost" onClick={() => onPick(option.label)} className="min-h-14 h-auto w-full justify-start rounded-lg px-3 text-left">
    <span className="flex-1"><span className="block font-semibold text-foreground">{option.label}</span>{option.explainer && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{option.explainer}</span>}</span>{value === option.label && <Check className="text-primary" />}
  </Button>)}</div></Sheet>;
}

function AppHeader({ progress, onBack }: { progress?: string; onBack?: () => void }) {
  return <div className="flex h-14 shrink-0 items-center gap-2 bg-primary-deep px-4 text-primary-foreground">
    {onBack && <Button aria-label="Back" size="icon" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={onBack}><ChevronLeft /></Button>}
    <h1 className="font-display flex-1 text-[17px] font-semibold">Loan / CC</h1>
    {progress && <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-bold">{progress}</span>}
  </div>;
}

function LenderLogo({ initial, muted = false }: { initial: string; muted?: boolean }) {
  return <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-sm font-extrabold text-primary-deep ${muted ? "opacity-55 grayscale" : ""}`}>{initial}</div>;
}

function ApprovalBars({ count, label }: { count: number; label: string }) {
  return <div><div className="flex gap-1" aria-label={`${label} approval chance`}>{[0,1,2,3,4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < count ? "bg-primary-deep" : "bg-border"}`} />)}</div><div className="mt-1.5 text-xs font-bold text-primary-deep">{label}</div></div>;
}

function OfferCard({ offer, rank, applied, onInfo, onApply, onUndo }: { offer: Offer; rank: number; applied: boolean; onInfo: () => void; onApply: () => void; onUndo: () => void }) {
  const [details, setDetails] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  return <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <div className="flex items-center gap-3 p-4 pb-3">
      <LenderLogo initial={offer.initial} />
      <div className="min-w-0 flex-1"><div className="font-display truncate text-[15px] font-bold text-card-foreground">{offer.lender}</div><div className="text-xs text-muted-foreground">{offer.product}</div></div>
      <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold uppercase text-primary-deep">{rank === 1 ? "Best match" : offer.chanceLabel}</span>
    </div>
    {offer.options && <Button variant="ghost" size="sm" onClick={() => setOptionsOpen(v => !v)} className="ml-[4.25rem] -mt-2 mb-2 h-7 rounded-full bg-muted px-2.5 text-[10px] text-muted-foreground">{offer.options.length} options <ChevronDown className={optionsOpen ? "rotate-180" : ""} /></Button>}
    {optionsOpen && offer.options && <div className="border-t border-border bg-muted px-4 py-2">{offer.options.map(option => <div key={option} className="py-1 text-xs text-muted-foreground">{option}</div>)}</div>}
    <div className="grid grid-cols-[1.2fr_1fr_.65fr] border-y border-border px-4 py-3.5">
      <div className="pr-3"><div className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">Eligible amount</div><div className="font-display text-[15px] font-bold text-foreground">{offer.amount}</div></div>
      <div className="border-x border-border px-3"><div className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">Approval</div><ApprovalBars count={offer.chance} label={offer.chanceLabel} /></div>
      <div className="pl-3 text-right"><div className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">Rate</div><div className="font-display text-[15px] font-bold text-foreground">{offer.rate}</div></div>
    </div>
    {details && <div className="border-b border-border bg-muted px-4 py-2.5 text-xs text-muted-foreground">Final rate and fees are confirmed by the lender.</div>}
    <div className="p-3.5">
      <Button variant="ghost" onClick={onInfo} className="mb-2 h-7 justify-start px-0 text-[11px] font-normal text-muted-foreground hover:bg-transparent"><Info /> One credit enquiry</Button>
      {applied ? <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground"><span className="font-semibold">Applied · 12 Sep</span><Button variant="link" onClick={onUndo} className="h-auto px-0 text-xs">Undo</Button></div> : <div className="grid grid-cols-[.8fr_1.2fr] gap-2"><Button variant="ghost" onClick={() => setDetails(v => !v)}>Details <ChevronDown className={details ? "rotate-180" : ""} /></Button><Button onClick={onApply} className="h-11 bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Apply now</Button></div>}
    </div>
  </article>;
}

function InAppBrowser({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  return <div className="absolute inset-0 z-[70] flex flex-col bg-background"><div className="grid h-14 shrink-0 grid-cols-[72px_1fr_72px] items-center bg-primary-deep px-3 text-primary-foreground"><Button onClick={onClose} variant="ghost" className="justify-start px-0 text-primary-foreground hover:bg-transparent">Close</Button><div className="truncate text-center text-[15px] font-bold">{offer.lender}</div><ShieldCheck className="ml-auto h-4 w-4" /></div><div className="flex-1 overflow-y-auto"><div className="bg-primary-deep px-5 pb-8 pt-9 text-center text-primary-foreground"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-card text-xl font-extrabold text-primary-deep">{offer.initial}</div><h2 className="font-display mt-4 text-2xl font-bold">{offer.product}</h2></div><div className="p-4"><div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="text-xs text-muted-foreground">Your eligible amount</div><div className="font-display mt-1 text-2xl font-bold text-foreground">{offer.amount}</div><div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Starting rate" value={offer.rate} /><Metric label="Approval chance" value={offer.chanceLabel} /></div><Button className="mt-6 h-12 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue application</Button></div></div></div></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-muted p-3"><div className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</div><div className="mt-1 font-bold text-foreground">{value}</div></div>; }

function PersonaToggle({ persona, onChange }: { persona: Persona; onChange: (p: Persona) => void }) {
  const personas: Persona[] = ["rejected", "prime", "thin", "ntc", "zero"];
  const labels: Record<Persona, string> = { rejected: "Needs work", prime: "Prime", thin: "Thin file", ntc: "New credit", zero: "No matches" };
  return <div className="absolute right-14 top-2 z-30"><Button aria-label="Change mock persona" variant="secondary" size="sm" onClick={() => onChange(personas[(personas.indexOf(persona) + 1) % personas.length])} className="h-7 bg-foreground/80 px-2 text-[10px] font-bold text-background hover:bg-foreground">{labels[persona]}</Button></div>;
}

export function LoanOffersScreen({ user, state, setState, onChat }: { user: DemoUser; state: LoanJourneyState; setState: (next: LoanJourneyState | ((current: LoanJourneyState) => LoanJourneyState)) => void; onChat: (kind: "recommend" | "issues" | "time" | "ntc", lender?: string) => void }) {
  const [choice, setChoice] = useState<"work" | "salary" | null>(null);
  const [sheet, setSheet] = useState<"amount" | "info" | "apply" | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [browserOffer, setBrowserOffer] = useState<Offer | null>(null);
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null); const scrollTop = useRef(0);
  const totalSteps = state.persona === "ntc" ? (state.work === "Salaried" ? 5 : 4) : (state.work === "Salaried" ? 4 : 3);
  const stepNumber = useMemo(() => { const order: Step[] = state.work === "Salaried" ? ["work","income","salary","pincode",...(state.persona === "ntc" ? ["dob" as Step] : [])] : ["work","income","pincode",...(state.persona === "ntc" ? ["dob" as Step] : [])]; return Math.max(1, order.indexOf(state.step) + 1); }, [state.step, state.work, state.persona]);
  useEffect(() => { if (state.step !== "checking") return; const timer = setTimeout(() => setState(s => ({ ...s, step: "offers" })), 2000); return () => clearTimeout(timer); }, [state.step, setState]);
  const update = (patch: Partial<LoanJourneyState>) => setState(s => ({ ...s, ...patch }));
  const goBack = () => { if (state.step === "work") update({ step: "intro" }); else if (state.step === "income") update({ step: "work" }); else if (state.step === "salary") update({ step: "income" }); else if (state.step === "pincode") update({ step: state.work === "Salaried" ? "salary" : "income" }); else if (state.step === "dob") update({ step: "pincode" }); };
  const completeQuestions = () => update({ step: state.persona === "ntc" ? "dob" : "checking" });
  const openApply = (offer: Offer) => { setSelectedOffer(offer); setSheet("apply"); };
  const confirmApply = () => { if (!selectedOffer) return; scrollTop.current = scrollRef.current?.scrollTop ?? 0; setSheet(null); setBrowserOffer(selectedOffer); };
  const closeBrowser = () => { if (browserOffer) update({ applied: Array.from(new Set([...state.applied, browserOffer.id])) }); setBrowserOffer(null); requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollTop.current; }); };
  const available = state.persona === "prime" ? AVAILABLE : state.persona === "thin" ? AVAILABLE.slice(0,1) : state.persona === "zero" || state.persona === "ntc" ? [] : AVAILABLE.slice(0,3);
  const locked = state.persona === "prime" || state.persona === "ntc" ? [] : state.persona === "thin" ? LOCKED_TIME : state.persona === "zero" ? LOCKED_ISSUES : LOCKED_ISSUES;
  const visibleAvailable = showAll ? available.slice(0,9) : available.slice(0,3);

  if (state.step === "intro") return <div className="relative flex min-h-0 flex-1 flex-col bg-background"><AppHeader /><PersonaToggle persona={state.persona} onChange={persona => update({ persona })} /><div className="flex-1 overflow-y-auto p-4"><div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold text-foreground">Check 55+ lenders</h2><p className="mt-1 text-sm text-muted-foreground">4 questions · 30 seconds</p></div><ShieldCheck className="h-7 w-7 text-primary" /></div><div className="my-6 flex justify-between gap-2">{LOGOS.map(logo => <LenderLogo key={logo} initial={logo} muted />)}</div><Button onClick={() => update({ step: "work" })} className="h-12 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">View my offers</Button></div></div></div>;

  if (["work","income","salary","pincode","dob"].includes(state.step)) return <div className="relative flex min-h-0 flex-1 flex-col bg-background"><AppHeader progress={`${stepNumber} of ${totalSteps}`} onBack={goBack} /><div className="flex-1 overflow-y-auto p-5">{state.step === "work" && <><h2 className="font-display text-2xl font-bold text-foreground">What do you do?</h2><Button variant="ghost" onClick={() => setChoice("work")} className="mt-8 h-14 w-full justify-between rounded-none border-b-2 border-primary px-0 text-lg"><span className={state.work ? "text-foreground" : "text-muted-foreground"}>{state.work || "Select one"}</span><ChevronDown /></Button></>}{state.step === "income" && <IncomeStep value={state.income} onChange={income => update({ income })} />}{state.step === "salary" && <><h2 className="font-display text-2xl font-bold text-foreground">How do you receive your salary?</h2><Button variant="ghost" onClick={() => setChoice("salary")} className="mt-8 h-14 w-full justify-between rounded-none border-b-2 border-primary px-0 text-lg"><span className={state.salaryMode ? "text-foreground" : "text-muted-foreground"}>{state.salaryMode || "Select one"}</span><ChevronDown /></Button></>}{state.step === "pincode" && <PincodeStep value={state.pincode} onChange={pincode => update({ pincode })} />}{state.step === "dob" && <><h2 className="font-display text-2xl font-bold text-foreground">Date of birth</h2><p className="mt-2 text-sm text-muted-foreground">Required because no credit record was found.</p><input type="date" value={state.dob} onChange={e => update({ dob: e.target.value })} className="mt-8 w-full border-b-2 border-primary bg-transparent py-3 text-lg text-foreground outline-none" /></>}</div><div className="px-5 pb-8 pt-3"><Button onClick={() => { if (state.step === "work") update({ step: "income" }); else if (state.step === "income") update({ step: state.work === "Salaried" ? "salary" : "pincode" }); else if (state.step === "salary") update({ step: "pincode" }); else if (state.step === "pincode") completeQuestions(); else update({ step: "checking" }); }} disabled={(state.step === "work" && !state.work)||(state.step === "income" && !state.income)||(state.step === "salary" && !state.salaryMode)||(state.step === "pincode" && state.pincode.length !== 6)||(state.step === "dob" && !state.dob)} className="h-12 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue</Button></div>{choice === "work" && <ChoiceSheet title="Employment type" value={state.work} onClose={() => setChoice(null)} onPick={value => { update({ work: value as WorkType, salaryMode: value === "Salaried" ? state.salaryMode : "" }); setChoice(null); }} options={[{label:"Salaried",explainer:"Fixed monthly salary"},{label:"Self-employed",explainer:"Business, shop or freelance"},{label:"Student"}]} />}{choice === "salary" && <ChoiceSheet title="Salary method" value={state.salaryMode} onClose={() => setChoice(null)} onPick={value => { update({ salaryMode: value as SalaryMode }); setChoice(null); }} options={[{label:"Bank transfer"},{label:"Cash"},{label:"Cheque"}]} />}</div>;

  if (state.step === "checking") return <div className="flex flex-1 flex-col items-center justify-center bg-background px-8 text-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /><h2 className="font-display mt-5 text-xl font-bold text-foreground">Checking 55 lenders…</h2><div className="mt-5 flex gap-2">{LOGOS.slice(0,4).map(logo => <LenderLogo key={logo} initial={logo} muted />)}</div></div>;

  return <div className="relative flex min-h-0 flex-1 flex-col bg-background"><AppHeader /><PersonaToggle persona={state.persona} onChange={persona => update({ persona, step: "offers" })} /><div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-6 pt-5">{state.persona === "ntc" ? <NTCOffers onChat={() => onChat("ntc")} /> : <><header className="mb-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-2xl font-bold text-foreground">Your best matches</h2><p className="mt-1 text-sm text-muted-foreground">Updated 12 Sep</p></div><Button variant="link" onClick={() => setSheet("amount")} className="h-auto px-0 text-xs">Change ₹1,50,000</Button></div><div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card py-3 shadow-sm"><MetricInline label="Available" value={`${available.length}`} /><MetricInline label="Best chance" value={available[0]?.chanceLabel ?? "—"} /><MetricInline label="From" value={available[0]?.rate ?? "—"} /></div></header>{available.length > 0 ? <section><div className="mb-3 flex items-end justify-between"><h3 className="font-display text-base font-bold text-foreground">Available now</h3><span className="text-[11px] text-muted-foreground">Highest match first</span></div><div className="space-y-3">{visibleAvailable.map((offer,index) => <OfferCard key={offer.id} rank={index+1} offer={offer} applied={state.applied.includes(offer.id)} onInfo={() => setSheet("info")} onApply={() => openApply(offer)} onUndo={() => update({ applied: state.applied.filter(id => id !== offer.id) })} />)}</div>{available.length > 3 && !showAll && <Button variant="link" onClick={() => setShowAll(true)} className="h-12 w-full">Show 6 more <ChevronDown /></Button>}<Button variant="outline" onClick={() => onChat("recommend")} className="mt-3 h-12 w-full justify-between rounded-xl bg-card"><span className="flex items-center gap-2"><MessageCircle className="text-primary" />Ask Arjun which offer is best</span><ArrowRight /></Button></section> : <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h3 className="font-display text-lg font-bold text-foreground">No lender matches yet</h3><p className="mt-1 text-sm text-muted-foreground">Arjun can explain what is holding you back.</p><Button onClick={() => onChat("issues", "Moneyview")} className="mt-5 h-11 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Talk to Arjun</Button></div>}{locked.length > 0 && <section className="mt-7"><div className="mb-3 flex items-end justify-between"><h3 className="font-display text-base font-bold text-foreground">Not available yet</h3><span className="text-[11px] text-muted-foreground">How close you are</span></div><div className="overflow-hidden rounded-xl border border-border bg-card">{locked.slice(0,5).map((offer,index) => <Button variant="ghost" key={offer.id} onClick={() => onChat(offer.reason, offer.lender)} className={`h-auto min-h-16 w-full justify-start rounded-none px-3 py-3 text-left ${index ? "border-t border-border" : ""}`}><LenderLogo initial={offer.initial} muted /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-foreground">{offer.lender} {offer.product}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{offer.distance}</span></span><ChevronRight className="text-muted-foreground" /></Button>)}</div></section>}</>}</div>{sheet === "amount" && <Sheet title="Change loan amount" onClose={() => setSheet(null)}><p className="mt-2 text-sm text-muted-foreground">We’ll refresh lender matches. No enquiry is added until you apply.</p><Button onClick={() => setSheet(null)} className="mt-5 h-11 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Got it</Button></Sheet>}{sheet === "info" && <Sheet title="Credit enquiry" onClose={() => setSheet(null)}><p className="mt-2 text-sm text-muted-foreground">Each application adds one enquiry to your credit report. Apply to one lender at a time.</p></Sheet>}{sheet === "apply" && selectedOffer && <Sheet title={`Apply with ${selectedOffer.lender}?`} onClose={() => setSheet(null)}><p className="mt-2 text-sm text-muted-foreground">This adds one enquiry to your credit report.</p><Button onClick={confirmApply} className="mt-5 h-11 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue to {selectedOffer.lender}</Button><Button onClick={() => setSheet(null)} variant="ghost" className="mt-2 h-11 w-full">Not now</Button></Sheet>}{browserOffer && <InAppBrowser offer={browserOffer} onClose={closeBrowser} />}</div>;
}

function MetricInline({ label, value }: { label: string; value: string }) { return <div className="px-3 text-center"><div className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</div><div className="font-display mt-1 text-sm font-bold text-foreground">{value}</div></div>; }
function IncomeStep({ value, onChange }: { value: string; onChange: (value: string) => void }) { const add = (digit: string) => onChange((value + digit).replace(/^0+/, "").slice(0,8)); return <><h2 className="font-display text-2xl font-bold text-foreground">Monthly income</h2><div className="font-display mt-10 text-center text-[32px] font-bold text-foreground">₹{Number(value || 0).toLocaleString("en-IN")}</div><div className="mx-auto mt-8 grid max-w-[280px] grid-cols-3 gap-3">{["1","2","3","4","5","6","7","8","9","00","0","⌫"].map(key => <Button variant="secondary" key={key} onClick={() => key === "⌫" ? onChange(value.slice(0,-1)) : add(key)} className="h-14 text-xl font-bold">{key}</Button>)}</div></>; }
function PincodeStep({ value, onChange }: { value: string; onChange: (value: string) => void }) { const inputRef = useRef<HTMLInputElement>(null); const digits = value.padEnd(6," ").slice(0,6).split(""); return <><h2 className="font-display text-2xl font-bold text-foreground">Your pincode</h2><Button variant="link" onClick={() => onChange("110001")} className="mt-3 px-0"><LocateFixed />Use my location</Button><button aria-label="Enter pincode" onClick={() => inputRef.current?.focus()} className="relative mt-8 block w-full"><input ref={inputRef} autoFocus inputMode="numeric" value={value} onChange={e => onChange(e.target.value.replace(/\D/g,"").slice(0,6))} className="absolute inset-0 opacity-0" /><span className="flex justify-between gap-2">{digits.map((d,i) => <span key={i} className={`flex h-14 flex-1 items-center justify-center rounded-lg border-2 text-xl font-bold text-foreground ${d.trim() ? "border-primary" : "border-border"}`}>{d}</span>)}</span></button></>; }
function NTCOffers({ onChat }: { onChat: () => void }) { return <div><header className="mb-5"><h2 className="font-display text-2xl font-bold text-foreground">No credit record yet</h2><p className="mt-1 text-sm text-muted-foreground">These lenders may still consider your application.</p></header><div className="overflow-hidden rounded-xl border border-border bg-card">{NTC_LENDERS.map((lender,index) => <div key={lender} className={`flex min-h-16 items-center gap-3 px-3 py-3 ${index ? "border-t border-border" : ""}`}><LenderLogo initial={lender[0]} /><div className="flex-1 text-sm font-bold text-foreground">{lender}</div><ChevronRight className="h-4 w-4 text-muted-foreground" /></div>)}</div><Button variant="outline" onClick={onChat} className="mt-4 h-12 w-full justify-between rounded-xl"><span>Start building your score</span><ArrowRight /></Button></div>; }

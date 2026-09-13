import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, ChevronLeft, Info, Loader2, LocateFixed, LockKeyhole, MessageCircle, ShieldCheck, X } from "lucide-react";
import type { DemoUser } from "@/lib/groscore-data";
import { Button } from "@/components/ui/button";
import moneyviewLogo from "@/assets/lenders/moneyview.png";
import tezLogo from "@/assets/lenders/tez.png";
import ramLogo from "@/assets/lenders/ram.png";
import kreditbeeLogo from "@/assets/lenders/kreditbee.png";
import kisshtLogo from "@/assets/lenders/kissht.png";
import bharatpeLogo from "@/assets/lenders/bharatpe.png";
import lendingplateLogo from "@/assets/lenders/lendingplate.png";
import creditseaLogo from "@/assets/lenders/creditsea.png";
import prefrLogo from "@/assets/lenders/prefr.png";
import hdfcLogo from "@/assets/lenders/hdfc.png";
import mpokketLogo from "@/assets/lenders/mpokket.png";
import abhiloansLogo from "@/assets/lenders/abhiloans.png";
import loan112Logo from "@/assets/lenders/loan112.png";
import clickpeLogo from "@/assets/lenders/clickpe.png";
import jupiterLogo from "@/assets/lenders/jupiter.png";

export type Persona = "rejected" | "prime" | "thin" | "ntc" | "zero";
type WorkType = "Salaried" | "Self-employed" | "Student" | "";
type SalaryMode = "Bank transfer" | "Cash" | "Cheque" | "";
type Step = "intro" | "work" | "income" | "salary" | "pincode" | "dob" | "checking" | "offers";

type LoanStateSetter = (next: LoanJourneyState | ((current: LoanJourneyState) => LoanJourneyState)) => void;

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
  step: firstVisit ? "intro" : "offers",
  persona: "rejected",
  work: "",
  income: "",
  salaryMode: "",
  pincode: "",
  dob: "",
  applied: [],
});

type Offer = {
  id: string;
  lender: string;
  product: string;
  logo?: string;
  chance: 3 | 4 | 5;
  chanceLabel: "Fair" | "Good" | "High";
  amount: string;
  rate: string;
  speed: string;
  options?: string[];
};

type LockedOffer = {
  id: string;
  lender: string;
  product: string;
  logo?: string;
  distance: string;
  progress: number;
  reason: "issues" | "time";
};

const AVAILABLE: Offer[] = [
  { id: "moneyview", lender: "Moneyview", product: "Personal loan", logo: moneyviewLogo, chance: 5, chanceLabel: "High", amount: "₹40,000–₹60,000", rate: "14% p.a.", speed: "Within 24 hours" },
  { id: "tez", lender: "Tez Credit", product: "Personal loan", logo: tezLogo, chance: 4, chanceLabel: "Good", amount: "₹30,000–₹50,000", rate: "16% p.a.", speed: "1–2 business days", options: ["Instant personal loan", "Flexi personal loan"] },
  { id: "ram", lender: "Ram Fincorp", product: "Personal loan", logo: ramLogo, chance: 4, chanceLabel: "Good", amount: "₹25,000–₹45,000", rate: "18% p.a.", speed: "Within 48 hours" },
  { id: "kreditbee", lender: "KreditBee", product: "Personal loan", logo: kreditbeeLogo, chance: 3, chanceLabel: "Fair", amount: "₹20,000–₹35,000", rate: "19% p.a.", speed: "1–2 business days" },
  { id: "kissht", lender: "Kissht", product: "Consumer loan", logo: kisshtLogo, chance: 3, chanceLabel: "Fair", amount: "Check amount", rate: "20% p.a.", speed: "Within 48 hours" },
  { id: "bharatpe", lender: "BharatPe", product: "Business loan", logo: bharatpeLogo, chance: 3, chanceLabel: "Fair", amount: "₹35,000–₹55,000", rate: "18% p.a.", speed: "2–3 business days" },
  { id: "zype", lender: "Zype", product: "Personal loan", chance: 3, chanceLabel: "Fair", amount: "₹20,000–₹40,000", rate: "21% p.a.", speed: "Within 48 hours" },
  { id: "lendingplate", lender: "Lendingplate", product: "Personal loan", logo: lendingplateLogo, chance: 3, chanceLabel: "Fair", amount: "Check amount", rate: "22% p.a.", speed: "2–3 business days" },
  { id: "creditsea", lender: "Credit Sea", product: "Credit line", logo: creditseaLogo, chance: 3, chanceLabel: "Fair", amount: "₹15,000–₹30,000", rate: "24% p.a.", speed: "Within 48 hours" },
];

const LOCKED_ISSUES: LockedOffer[] = [
  { id: "lock-moneyview", lender: "Moneyview", product: "Personal loan", logo: moneyviewLogo, distance: "30 score points needed", progress: 72, reason: "issues" },
  { id: "lock-prefr", lender: "Prefr", product: "Personal loan", logo: prefrLogo, distance: "2 credit fixes needed", progress: 58, reason: "issues" },
  { id: "lock-hdfc", lender: "HDFC Bank", product: "Personal loan", logo: hdfcLogo, distance: "45 score points needed", progress: 49, reason: "issues" },
  { id: "lock-kissht", lender: "Kissht", product: "Personal loan", logo: kisshtLogo, distance: "2 credit fixes needed", progress: 44, reason: "issues" },
  { id: "lock-creditsea", lender: "Credit Sea", product: "Credit line", logo: creditseaLogo, distance: "55 score points needed", progress: 37, reason: "issues" },
];

const LOCKED_TIME: LockedOffer[] = [
  { id: "time-prefr", lender: "Prefr", product: "Personal loan", logo: prefrLogo, distance: "4 more months of history", progress: 67, reason: "time" },
  { id: "time-tez", lender: "Tez Credit", product: "Personal loan", logo: tezLogo, distance: "4 more months of history", progress: 67, reason: "time" },
  { id: "time-hdfc", lender: "HDFC Bank", product: "Credit card", logo: hdfcLogo, distance: "4 more months of history", progress: 67, reason: "time" },
  { id: "time-zype", lender: "Zype", product: "Personal loan", distance: "4 more months of history", progress: 67, reason: "time" },
];

const INTRO_LENDERS = [
  { name: "Moneyview", logo: moneyviewLogo },
  { name: "Tez Credit", logo: tezLogo },
  { name: "Ram Fincorp", logo: ramLogo },
  { name: "KreditBee", logo: kreditbeeLogo },
  { name: "BharatPe", logo: bharatpeLogo },
  { name: "HDFC Bank", logo: hdfcLogo },
];

const NTC_LENDERS = [
  { name: "mPokket", logo: mpokketLogo },
  { name: "Abhiloans", logo: abhiloansLogo },
  { name: "Loan112", logo: loan112Logo },
  { name: "ClickPE", logo: clickpeLogo },
  { name: "Jupiter RuPay Card", logo: jupiterLogo },
];

function Sheet({ title, subtitle, children, onClose }: { title: string; subtitle?: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end">
      <Button aria-label="Close sheet" variant="ghost" className="absolute inset-0 h-auto w-full rounded-none bg-foreground/35 hover:bg-foreground/35" onClick={onClose} />
      <div className="relative max-h-[88dvh] w-full overflow-y-auto rounded-t-2xl bg-card px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3 shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-start justify-between gap-4">
          <div><h3 className="font-display text-xl font-bold text-card-foreground">{title}</h3>{subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>
          <Button aria-label="Close" size="icon" variant="ghost" onClick={onClose}><X /></Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AppHeader() {
  return <div className="flex h-14 shrink-0 items-center bg-primary-deep px-4 text-primary-foreground"><h1 className="font-display text-[17px] font-semibold">Loan / CC</h1></div>;
}

function LenderLogo({ name, logo, muted = false, size = "md" }: { name: string; logo?: string; muted?: boolean; size?: "sm" | "md" }) {
  const dimensions = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  return (
    <div className={`flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-1.5 ${muted ? "grayscale opacity-60" : ""}`}>
      {logo ? <img src={logo} alt={`${name} logo`} className="h-full w-full object-contain" /> : <span className="text-sm font-bold text-primary-deep">{name.slice(0, 1)}</span>}
    </div>
  );
}

function PersonaToggle({ persona, onChange }: { persona: Persona; onChange: (p: Persona) => void }) {
  const personas: Persona[] = ["rejected", "prime", "thin", "ntc", "zero"];
  const labels: Record<Persona, string> = { rejected: "Needs work", prime: "Prime", thin: "Thin file", ntc: "New credit", zero: "No matches" };
  return <div className="absolute right-14 top-2 z-30"><Button aria-label="Change mock persona" variant="secondary" size="sm" onClick={() => onChange(personas[(personas.indexOf(persona) + 1) % personas.length])} className="h-7 bg-foreground/80 px-2 text-[10px] font-bold text-background hover:bg-foreground">{labels[persona]}</Button></div>;
}

function IntroPage({ onStart, resume, inactive = false }: { onStart: () => void; resume: boolean; inactive?: boolean }) {
  return (
    <div aria-hidden={inactive} className={`flex-1 overflow-y-auto px-4 py-5 ${inactive ? "pointer-events-none" : ""}`}>
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="px-5 pb-5 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold text-primary">PERSONALISED MATCHES</p><h2 className="font-display mt-2 text-2xl font-bold text-foreground">Find the right loan</h2><p className="mt-1 text-sm text-muted-foreground">Compare offers from 55+ lenders.</p></div>
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {INTRO_LENDERS.map((lender) => <div key={lender.name} className="flex h-14 items-center justify-center rounded-lg border border-border bg-background px-3"><img src={lender.logo} alt={`${lender.name} logo`} className="max-h-8 max-w-full object-contain grayscale" /></div>)}
          </div>
        </div>
        <div className="border-t border-border bg-muted/50 px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm"><span className="text-muted-foreground">Takes about 30 seconds</span><span className="font-semibold text-foreground">4 details</span></div>
          <Button onClick={onStart} className="h-12 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">{resume ? "Continue" : "View my offers"}<ArrowRight /></Button>
        </div>
      </div>
    </div>
  );
}

function QuestionSheet({ state, update, onClose }: { state: LoanJourneyState; update: (patch: Partial<LoanJourneyState>) => void; onClose: () => void }) {
  const [picker, setPicker] = useState<"work" | "salary" | null>(null);
  const order = useMemo<Step[]>(() => state.work === "Salaried" ? ["work", "income", "salary", "pincode", ...(state.persona === "ntc" ? ["dob" as Step] : [])] : ["work", "income", "pincode", ...(state.persona === "ntc" ? ["dob" as Step] : [])], [state.work, state.persona]);
  const current = Math.max(0, order.indexOf(state.step));
  const isValid = (state.step === "work" && Boolean(state.work)) || (state.step === "income" && Boolean(state.income)) || (state.step === "salary" && Boolean(state.salaryMode)) || (state.step === "pincode" && state.pincode.length === 6) || (state.step === "dob" && Boolean(state.dob));
  const titles: Partial<Record<Step, string>> = { work: "What do you do?", income: "Monthly income", salary: "How do you receive your salary?", pincode: "Your pincode", dob: "Date of birth" };
  const back = () => { if (picker) return setPicker(null); if (current <= 0) return onClose(); update({ step: order[current - 1] }); };
  const next = () => { const nextStep = order[current + 1]; update({ step: nextStep ?? "checking" }); };

  return (
    <Sheet title={picker ? (picker === "work" ? "Employment type" : "Salary method") : (titles[state.step] ?? "Your details")} subtitle={picker ? undefined : `${current + 1} of ${order.length}`} onClose={onClose}>
      <div className="mt-5">
        {picker === "work" && <ChoiceList value={state.work} options={[{ label: "Salaried", note: "Fixed monthly salary" }, { label: "Self-employed", note: "Business, shop or freelance" }, { label: "Student" }]} onPick={(value) => { update({ work: value as WorkType, salaryMode: value === "Salaried" ? state.salaryMode : "" }); setPicker(null); }} />}
        {picker === "salary" && <ChoiceList value={state.salaryMode} options={[{ label: "Bank transfer" }, { label: "Cash" }, { label: "Cheque" }]} onPick={(value) => { update({ salaryMode: value as SalaryMode }); setPicker(null); }} />}
        {!picker && state.step === "work" && <SelectField value={state.work} placeholder="Select employment type" onClick={() => setPicker("work")} />}
        {!picker && state.step === "income" && <IncomeInput value={state.income} onChange={(income) => update({ income })} />}
        {!picker && state.step === "salary" && <SelectField value={state.salaryMode} placeholder="Select salary method" onClick={() => setPicker("salary")} />}
        {!picker && state.step === "pincode" && <PincodeInput value={state.pincode} onChange={(pincode) => update({ pincode })} />}
        {!picker && state.step === "dob" && <input autoFocus type="date" value={state.dob} onChange={(event) => update({ dob: event.target.value })} className="h-14 w-full rounded-lg border border-input bg-background px-4 text-lg text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />}
      </div>
      {!picker && <div className="mt-7 flex gap-2"><Button variant="outline" size="icon" aria-label="Previous question" className="h-12 w-12 shrink-0" onClick={back}><ChevronLeft /></Button><Button disabled={!isValid} onClick={next} className="h-12 flex-1 bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue</Button></div>}
    </Sheet>
  );
}

function ChoiceList({ value, options, onPick }: { value: string; options: Array<{ label: string; note?: string }>; onPick: (value: string) => void }) {
  return <div className="space-y-2">{options.map((option) => <Button key={option.label} variant="outline" onClick={() => onPick(option.label)} className="h-auto min-h-14 w-full justify-start rounded-lg px-4 text-left"><span className="flex-1"><span className="block font-semibold text-foreground">{option.label}</span>{option.note && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{option.note}</span>}</span>{value === option.label && <Check className="text-primary" />}</Button>)}</div>;
}

function SelectField({ value, placeholder, onClick }: { value: string; placeholder: string; onClick: () => void }) {
  return <Button variant="outline" onClick={onClick} className="h-14 w-full justify-between rounded-lg px-4 text-base"><span className={value ? "text-foreground" : "text-muted-foreground"}>{value || placeholder}</span><ChevronDown /></Button>;
}

function IncomeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { const timer = window.setTimeout(() => ref.current?.focus(), 180); return () => window.clearTimeout(timer); }, []);
  return <div><label htmlFor="monthly-income" className="text-sm font-medium text-muted-foreground">Amount after deductions</label><div className="mt-2 flex h-16 items-center rounded-lg border border-input bg-background px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"><span className="font-display text-2xl font-bold text-foreground">₹</span><input ref={ref} id="monthly-income" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={value ? Number(value).toLocaleString("en-IN") : ""} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="0" className="min-w-0 flex-1 bg-transparent px-2 font-display text-3xl font-bold text-foreground outline-none placeholder:text-muted-foreground/50" /></div></div>;
}

function PincodeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");
  useEffect(() => { const timer = window.setTimeout(() => ref.current?.focus(), 180); return () => window.clearTimeout(timer); }, []);
  return <div><Button variant="link" onClick={() => onChange("110001")} className="mb-4 h-auto px-0"><LocateFixed />Use my location</Button><div className="relative" onClick={() => ref.current?.focus()}><input ref={ref} aria-label="Pincode" inputMode="numeric" pattern="[0-9]*" autoComplete="postal-code" value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))} className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0" /><div className="flex gap-2">{digits.map((digit, index) => <span key={index} className={`flex h-14 flex-1 items-center justify-center rounded-lg border text-xl font-bold text-foreground ${digit.trim() ? "border-primary bg-primary-soft" : "border-input bg-background"}`}>{digit}</span>)}</div></div></div>;
}

function ApprovalBars({ count, label }: { count: number; label: string }) {
  return <div><div className="flex gap-1" aria-label={`${label} approval chance`}>{[0, 1, 2, 3, 4].map((index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index < count ? "bg-primary" : "bg-border"}`} />)}</div><div className="mt-1.5 text-xs font-semibold text-primary-deep">{label} chance</div></div>;
}

function OfferCard({ offer, featured, applied, onInfo, onApply, onUndo }: { offer: Offer; featured: boolean; applied: boolean; onInfo: () => void; onApply: () => void; onUndo: () => void }) {
  const [details, setDetails] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  return (
    <article className={`overflow-hidden rounded-lg border bg-card shadow-sm ${featured ? "border-primary/35" : "border-border"}`}>
      {featured && <div className="bg-primary-soft px-4 py-1.5 text-[11px] font-bold text-primary-deep">BEST MATCH</div>}
      <div className="flex items-center gap-3 p-4">
        <LenderLogo name={offer.lender} logo={offer.logo} />
        <div className="min-w-0 flex-1"><h4 className="font-display truncate text-base font-bold text-foreground">{offer.lender}</h4><p className="text-xs text-muted-foreground">{offer.product}</p></div>
        {offer.options && <Button variant="secondary" size="sm" onClick={() => setOptionsOpen((open) => !open)} className="h-7 px-2 text-[10px]">{offer.options.length} options<ChevronDown className={optionsOpen ? "rotate-180" : ""} /></Button>}
      </div>
      {optionsOpen && offer.options && <div className="border-y border-border bg-muted px-4 py-2">{offer.options.map((option) => <div key={option} className="py-1 text-xs text-muted-foreground">{option}</div>)}</div>}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-border bg-muted/35 px-4 py-4">
        <div><p className="text-[11px] text-muted-foreground">You may get</p><p className="font-display mt-0.5 text-lg font-bold text-foreground">{offer.amount}</p></div>
        <div><p className="text-[11px] text-muted-foreground">Interest from</p><p className="font-display mt-0.5 text-lg font-bold text-foreground">{offer.rate}</p></div>
        <div><p className="mb-1.5 text-[11px] text-muted-foreground">Approval</p><ApprovalBars count={offer.chance} label={offer.chanceLabel} /></div>
        <div><p className="text-[11px] text-muted-foreground">Disbursal</p><p className="mt-1 text-xs font-semibold text-foreground">{offer.speed}</p></div>
      </div>
      {details && <div className="border-b border-border px-4 py-3 text-xs text-muted-foreground">Final rate and fees are confirmed by the lender before you submit.</div>}
      <div className="p-4">
        <Button variant="ghost" onClick={onInfo} className="mb-2 h-7 justify-start px-0 text-[11px] font-normal text-muted-foreground hover:bg-transparent"><Info />1 credit enquiry on application</Button>
        {applied ? <div className="flex h-11 items-center justify-between rounded-lg bg-muted px-3 text-sm text-muted-foreground"><span className="font-semibold">Applied · 12 Sep</span><Button variant="link" onClick={onUndo} className="h-auto px-0 text-xs">Undo</Button></div> : <div className="grid grid-cols-[.8fr_1.2fr] gap-2"><Button variant="outline" onClick={() => setDetails((open) => !open)}>Details</Button><Button onClick={onApply} className="h-11 bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Apply now</Button></div>}
      </div>
    </article>
  );
}

function LockedCard({ offer, onClick }: { offer: LockedOffer; onClick: () => void }) {
  return <Button variant="ghost" onClick={onClick} className="h-auto w-full justify-start rounded-lg border border-border bg-card p-4 text-left shadow-none hover:bg-muted/50"><LenderLogo name={offer.lender} logo={offer.logo} muted size="sm" /><span className="ml-3 min-w-0 flex-1"><span className="flex items-center gap-1.5"><span className="truncate text-sm font-bold text-foreground">{offer.lender}</span><LockKeyhole className="h-3.5 w-3.5 text-muted-foreground" /></span><span className="block text-[11px] font-normal text-muted-foreground">{offer.product}</span><span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-border"><span className="block h-full rounded-full bg-amber" style={{ width: `${offer.progress}%` }} /></span><span className="mt-1.5 block text-xs font-semibold text-foreground">{offer.distance}</span></span><span className="text-xs font-semibold text-primary">View plan</span></Button>;
}

function InAppBrowser({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  return <div className="absolute inset-0 z-[70] flex flex-col bg-background"><div className="grid h-14 shrink-0 grid-cols-[72px_1fr_72px] items-center bg-primary-deep px-3 text-primary-foreground"><Button onClick={onClose} variant="ghost" className="justify-start px-0 text-primary-foreground hover:bg-transparent">Close</Button><div className="truncate text-center text-[15px] font-bold">{offer.lender}</div><ShieldCheck className="ml-auto h-4 w-4" /></div><div className="flex-1 overflow-y-auto"><div className="bg-primary-deep px-5 pb-8 pt-9 text-center text-primary-foreground"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-card p-2"><img src={offer.logo} alt={`${offer.lender} logo`} className="h-full w-full object-contain" /></div><h2 className="font-display mt-4 text-2xl font-bold">{offer.product}</h2></div><div className="p-4"><div className="rounded-lg border border-border bg-card p-5 shadow-sm"><div className="text-xs text-muted-foreground">Your eligible amount</div><div className="font-display mt-1 text-2xl font-bold text-foreground">{offer.amount}</div><Button className="mt-6 h-12 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue application</Button></div></div></div></div>;
}

function NTCOffers({ onChat }: { onChat: () => void }) {
  return <div><header className="mb-5"><h2 className="font-display text-2xl font-bold text-foreground">Start without a credit score</h2><p className="mt-1 text-sm text-muted-foreground">Lenders that consider new-to-credit customers.</p></header><div className="space-y-2">{NTC_LENDERS.map((lender) => <div key={lender.name} className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card px-3 py-3"><LenderLogo name={lender.name} logo={lender.logo} size="sm" /><div className="flex-1 text-sm font-bold text-foreground">{lender.name}</div><ArrowRight className="h-4 w-4 text-muted-foreground" /></div>)}</div><Button variant="outline" onClick={onChat} className="mt-4 h-12 w-full justify-between rounded-lg"><span>Build my credit score</span><ArrowRight /></Button></div>;
}

export function LoanOffersScreen({ state, setState, onChat }: { user: DemoUser; state: LoanJourneyState; setState: LoanStateSetter; onChat: (kind: "recommend" | "issues" | "time" | "ntc", lender?: string) => void }) {
  const [questionSheetOpen, setQuestionSheetOpen] = useState(!["intro", "checking", "offers"].includes(state.step));
  const [sheet, setSheet] = useState<"amount" | "info" | "apply" | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [browserOffer, setBrowserOffer] = useState<Offer | null>(null);
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTop = useRef(0);
  const update = (patch: Partial<LoanJourneyState>) => setState((current) => ({ ...current, ...patch }));

  useEffect(() => { if (state.step !== "checking") return; setQuestionSheetOpen(false); const timer = window.setTimeout(() => setState((current) => ({ ...current, step: "offers" })), 2000); return () => window.clearTimeout(timer); }, [state.step, setState]);

  const available = state.persona === "prime" ? AVAILABLE : state.persona === "thin" ? AVAILABLE.slice(0, 1) : state.persona === "zero" || state.persona === "ntc" ? [] : AVAILABLE.slice(0, 3);
  const locked = state.persona === "prime" || state.persona === "ntc" ? [] : state.persona === "thin" ? LOCKED_TIME : LOCKED_ISSUES;
  const visibleAvailable = showAll ? available.slice(0, 9) : available.slice(0, 3);
  const startQuestions = () => { if (state.step === "intro") update({ step: "work" }); setQuestionSheetOpen(true); };
  const openApply = (offer: Offer) => { setSelectedOffer(offer); setSheet("apply"); };
  const confirmApply = () => { if (!selectedOffer) return; scrollTop.current = scrollRef.current?.scrollTop ?? 0; setSheet(null); setBrowserOffer(selectedOffer); };
  const closeBrowser = () => { if (browserOffer) update({ applied: Array.from(new Set([...state.applied, browserOffer.id])) }); setBrowserOffer(null); requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollTop.current; }); };

  if (state.step === "checking") return <div className="flex flex-1 flex-col items-center justify-center bg-background px-8 text-center"><Loader2 className="h-11 w-11 animate-spin text-primary" /><h2 className="font-display mt-5 text-xl font-bold text-foreground">Checking lender matches</h2><div className="mt-5 flex gap-2">{INTRO_LENDERS.slice(0, 4).map((lender) => <LenderLogo key={lender.name} name={lender.name} logo={lender.logo} muted size="sm" />)}</div></div>;

  if (state.step !== "offers") return <div className="relative flex min-h-0 flex-1 flex-col bg-background"><AppHeader /><PersonaToggle persona={state.persona} onChange={(persona) => update({ persona })} /><IntroPage onStart={startQuestions} resume={state.step !== "intro"} inactive={questionSheetOpen} />{questionSheetOpen && <QuestionSheet state={state} update={update} onClose={() => setQuestionSheetOpen(false)} />}</div>;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <AppHeader />
      <PersonaToggle persona={state.persona} onChange={(persona) => update({ persona, step: "offers" })} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
        {state.persona === "ntc" ? <NTCOffers onChat={() => onChat("ntc")} /> : <>
          <header className="mb-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-2xl font-bold text-foreground">Loan offers for you</h2><p className="mt-1 text-sm text-muted-foreground">Updated 12 Sep</p></div><Button variant="link" onClick={() => setSheet("amount")} className="h-auto px-0 text-xs">₹50,000</Button></div></header>
          {available.length > 0 ? <section><h3 className="mb-3 font-display text-base font-bold text-foreground">Available now</h3><div className="space-y-3">{visibleAvailable.map((offer, index) => <OfferCard key={offer.id} featured={index === 0} offer={offer} applied={state.applied.includes(offer.id)} onInfo={() => setSheet("info")} onApply={() => openApply(offer)} onUndo={() => update({ applied: state.applied.filter((id) => id !== offer.id) })} />)}</div>{available.length > 3 && !showAll && <Button variant="link" onClick={() => setShowAll(true)} className="h-12 w-full">Show 6 more<ChevronDown /></Button>}<Button variant="outline" onClick={() => onChat("recommend")} className="mt-3 h-12 w-full justify-between rounded-lg bg-card"><span className="flex items-center gap-2"><MessageCircle className="text-primary" />Ask Arjun to compare</span><ArrowRight /></Button></section> : <div className="rounded-lg border border-border bg-card p-5 shadow-sm"><h3 className="font-display text-lg font-bold text-foreground">No matches right now</h3><Button onClick={() => onChat("issues", "Moneyview")} className="mt-5 h-11 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">See what to improve</Button></div>}
          {locked.length > 0 && <section className="mt-7"><h3 className="mb-3 font-display text-base font-bold text-foreground">Within reach</h3><div className="space-y-2">{locked.slice(0, 5).map((offer) => <LockedCard key={offer.id} offer={offer} onClick={() => onChat(offer.reason, offer.lender)} />)}</div></section>}
        </>}
      </div>
      {sheet === "amount" && <Sheet title="Loan amount" subtitle="Choose the amount you need" onClose={() => setSheet(null)}><div className="mt-5 grid grid-cols-3 gap-2">{["₹25,000", "₹50,000", "₹1,00,000"].map((amount) => <Button key={amount} variant={amount === "₹50,000" ? "default" : "outline"} onClick={() => setSheet(null)} className={amount === "₹50,000" ? "bg-primary-deep text-primary-foreground" : ""}>{amount}</Button>)}</div></Sheet>}
      {sheet === "info" && <Sheet title="Credit enquiry" onClose={() => setSheet(null)}><p className="mt-2 text-sm text-muted-foreground">An application adds one enquiry to your credit report.</p></Sheet>}
      {sheet === "apply" && selectedOffer && <Sheet title={`Apply with ${selectedOffer.lender}?`} subtitle="This adds one credit enquiry." onClose={() => setSheet(null)}><Button onClick={confirmApply} className="mt-5 h-11 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue to {selectedOffer.lender}</Button><Button onClick={() => setSheet(null)} variant="ghost" className="mt-2 h-11 w-full">Not now</Button></Sheet>}
      {browserOffer && <InAppBrowser offer={browserOffer} onClose={closeBrowser} />}
    </div>
  );
}

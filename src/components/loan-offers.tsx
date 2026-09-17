import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronLeft, Info, Loader2, LocateFixed, LockKeyhole, MessageCircle, ShieldCheck, X } from "lucide-react";
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
type WorkType = "Salaried" | "Self-employed" | "Student" | "Other" | "";
type SalaryMode = "Bank transfer" | "Cash" | "Cheque" | "";
type Step = "intro" | "details" | "location" | "checking" | "offers";

type LoanStateSetter = (next: LoanJourneyState | ((current: LoanJourneyState) => LoanJourneyState)) => void;

export interface LoanJourneyState {
  step: Step;
  persona: Persona;
  work: WorkType;
  income: string;
  salaryMode: SalaryMode;
  loanAmount: string;
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
  loanAmount: "",
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
  { name: "HDFC Bank", logo: hdfcLogo },
  { name: "BharatPe", logo: bharatpeLogo },
  { name: "Moneyview", logo: moneyviewLogo },
  { name: "mPokket", logo: mpokketLogo },
  { name: "Kissht", logo: kisshtLogo },
  { name: "KreditBee", logo: kreditbeeLogo },
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

function AppHeader({ onBack }: { onBack: () => void }) {
  return <header className="flex h-14 shrink-0 items-center gap-2 bg-primary-deep px-3 text-primary-foreground"><Button aria-label="Back to chat" size="icon" variant="ghost" onClick={onBack} className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><ChevronLeft /></Button><h1 className="font-display text-[18px] font-semibold">Loan</h1></header>;
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

function IntroPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-card">
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-8">
        <div className="mx-auto max-w-sm">
          <h2 className="font-display text-2xl font-bold leading-tight text-foreground">Find the right loan for you</h2>
          <div className="mt-7 grid grid-cols-3 gap-3">
            {INTRO_LENDERS.map((lender) => <div key={lender.name} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card px-2 py-3"><img src={lender.logo} alt={`${lender.name} logo`} className="h-7 max-w-full object-contain grayscale" /><span className="text-center text-[11px] font-medium leading-tight text-muted-foreground">{lender.name}</span></div>)}
          </div>
          <p className="mt-5 text-center text-sm font-medium text-muted-foreground">Compare offers from 30+ lenders</p>
        </div>
      </div>
      <div className="shrink-0 border-t border-border bg-card px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
        <Button onClick={onStart} className="h-14 w-full rounded-lg bg-primary-deep text-base font-semibold text-primary-foreground hover:bg-primary-deep/90">View my offers</Button>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <fieldset className="min-h-[72px] rounded-lg border border-input bg-card px-4 pb-3 pt-2"><legend className="px-1 text-sm font-medium text-muted-foreground">{label}</legend>{children}</fieldset>;
}

function InlineSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<{ label: string; note?: string }>; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="relative"><FormField label={label}><Button type="button" variant="ghost" onClick={() => setOpen((current) => !current)} className="h-10 w-full justify-between px-0 text-base hover:bg-transparent"><span className={value ? "text-foreground" : "text-muted-foreground"}>{value || "Select"}</span><ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} /></Button></FormField>{open && <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">{options.map((option) => <Button type="button" key={option.label} variant="ghost" onClick={() => { onChange(option.label); setOpen(false); }} className="h-auto min-h-12 w-full justify-start rounded-none border-b border-border px-4 py-2 text-left last:border-b-0"><span className="flex-1"><span className="block text-sm font-semibold text-popover-foreground">{option.label}</span>{option.note && <span className="block text-xs font-normal text-muted-foreground">{option.note}</span>}</span>{value === option.label && <Check className="h-4 w-4 text-primary" />}</Button>)}</div>}</div>;
}

function AmountField({ id, label, value, onChange, autoFocus = false }: { id: string; label: string; value: string; onChange: (value: string) => void; autoFocus?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!autoFocus) return; const timer = window.setTimeout(() => ref.current?.focus(), 180); return () => window.clearTimeout(timer); }, [autoFocus]);
  return <FormField label={label}><div className="flex h-10 items-center"><span className="font-display text-xl font-semibold text-foreground">₹</span><input ref={ref} id={id} inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={value ? Number(value).toLocaleString("en-IN") : ""} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="0" className="min-w-0 flex-1 bg-transparent px-2 font-display text-[32px] font-semibold leading-none text-foreground outline-none placeholder:text-muted-foreground/50" /></div></FormField>;
}

function DateWheel({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const initial = value.split("-");
  const yearNow = new Date().getFullYear();
  const year = initial[0] || "";
  const month = initial[1] || "";
  const day = initial[2] || "";
  const change = (part: "year" | "month" | "day", next: string) => {
    const date = { year, month, day, [part]: next };
    if (!date.year || !date.month || !date.day) { onChange(`${date.year}-${date.month}-${date.day}`); return; }
    const maxDay = new Date(Number(date.year), Number(date.month), 0).getDate();
    const safeDay = String(Math.min(Number(date.day), maxDay)).padStart(2, "0");
    onChange(`${date.year}-${date.month}-${safeDay}`);
  };
  const selectClass = "h-14 min-w-0 flex-1 appearance-none bg-card px-2 text-center text-lg font-semibold text-foreground outline-none";
  return <FormField label="Date of birth"><p className="mb-3 text-xs text-muted-foreground">Select your exact date of birth.</p><div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border bg-card"><select aria-label="Birth day" value={day} onChange={(event) => change("day", event.target.value)} className={selectClass}><option value="">DD</option>{Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0")).map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Birth month" value={month} onChange={(event) => change("month", event.target.value)} className={selectClass}><option value="">MM</option>{Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")).map((item) => <option key={item} value={item}>{item}</option>)}</select><select aria-label="Birth year" value={year} onChange={(event) => change("year", event.target.value)} className={selectClass}><option value="">YYYY</option>{Array.from({ length: 83 }, (_, index) => String(yearNow - 18 - index)).map((item) => <option key={item}>{item}</option>)}</select></div></FormField>;
}

function QuestionPage({ state, update }: { state: LoanJourneyState; update: (patch: Partial<LoanJourneyState>) => void }) {
  const detailsValid = Boolean(state.work && state.income && state.loanAmount && (state.work !== "Salaried" || state.salaryMode));
  const locationValid = state.pincode.length === 6 && /^\d{4}-\d{2}-\d{2}$/.test(state.dob);
  return <div key={state.step} className="flex min-h-0 flex-1 flex-col bg-card motion-safe:animate-[loan-page-slide_260ms_ease-out]"><div className="flex-1 overflow-y-auto px-5 pb-5 pt-6"><h2 className="font-display text-2xl font-bold text-foreground">Add your details for best offers</h2>{state.step === "details" ? <div className="mt-6 space-y-4"><InlineSelect label="Select Employment type" value={state.work} options={[{ label: "Salaried" }, { label: "Self-employed" }, { label: "Student" }, { label: "Other" }]} onChange={(work) => update({ work: work as WorkType, salaryMode: work === "Salaried" ? state.salaryMode : "" })} /><AmountField id="monthly-income" label="Monthly income" value={state.income} onChange={(income) => update({ income })} />{state.work === "Salaried" && <InlineSelect label="How do you get paid?" value={state.salaryMode} options={[{ label: "Bank transfer" }, { label: "Cash" }, { label: "Cheque" }]} onChange={(salaryMode) => update({ salaryMode: salaryMode as SalaryMode })} />}<AmountField id="loan-amount" label="Loan amount" value={state.loanAmount} onChange={(loanAmount) => update({ loanAmount })} /></div> : <div className="mt-6 space-y-5"><FormField label="Pincode"><PincodeInput value={state.pincode} onChange={(pincode) => update({ pincode })} /></FormField><DateWheel value={state.dob} onChange={(dob) => update({ dob })} /></div>}</div><div className="shrink-0 border-t border-border bg-card px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3"><Button type="button" disabled={state.step === "details" ? !detailsValid : !locationValid} onClick={() => update({ step: state.step === "details" ? "location" : "checking" })} className="h-12 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue</Button></div></div>;
}

function PincodeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");
  useEffect(() => { const timer = window.setTimeout(() => ref.current?.focus(), 180); return () => window.clearTimeout(timer); }, []);
  return <div><Button variant="link" onClick={() => onChange("110001")} className="mb-4 h-auto px-0"><LocateFixed />Use my location</Button><div className="relative" onClick={() => ref.current?.focus()}><input ref={ref} aria-label="Pincode" inputMode="numeric" pattern="[0-9]*" autoComplete="postal-code" value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))} className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0" /><div className="flex gap-2">{digits.map((digit, index) => <span key={index} className={`flex h-14 flex-1 items-center justify-center rounded-lg border text-xl font-bold text-foreground ${digit.trim() ? "border-primary bg-primary-soft" : "border-input bg-background"}`}>{digit}</span>)}</div></div></div>;
}

function ApprovalBars({ count, label }: { count: number; label: string }) {
  return <div className="flex items-center gap-2"><div className="flex flex-1 gap-1" aria-label={`${label} approval chance`}>{[0, 1, 2, 3, 4].map((index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index < count ? "bg-primary" : "bg-border"}`} />)}</div><div className="shrink-0 text-xs font-semibold text-primary-deep">{label}</div></div>;
}

function OfferCard({ offer, featured, applied, onInfo, onApply, onUndo }: { offer: Offer; featured: boolean; applied: boolean; onInfo: () => void; onApply: () => void; onUndo: () => void }) {
  const [details, setDetails] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  return (
    <article className={`relative overflow-hidden rounded-xl border bg-card shadow-sm ${featured ? "border-primary/35" : "border-border"}`}>
      <div className={`h-1 w-full ${featured ? "bg-primary" : "bg-border"}`} />
      <div className="flex items-center gap-3 px-4 py-3">
        <LenderLogo name={offer.lender} logo={offer.logo} size="sm" />
        <div className="min-w-0 flex-1"><h4 className="font-display truncate text-base font-bold text-foreground">{offer.lender}</h4><p className="text-xs text-muted-foreground">{offer.product}</p></div>
        {featured && <div className="rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold text-primary-deep">BEST MATCH</div>}
        {offer.options && <Button variant="secondary" size="sm" onClick={() => setOptionsOpen((open) => !open)} className="h-7 px-2 text-[10px]">{offer.options.length} options<ChevronDown className={optionsOpen ? "rotate-180" : ""} /></Button>}
      </div>
      {optionsOpen && offer.options && <div className="border-y border-border bg-muted px-4 py-2">{offer.options.map((option) => <div key={option} className="py-1 text-xs text-muted-foreground">{option}</div>)}</div>}
      <div className="grid grid-cols-[1.35fr_.65fr] gap-3 border-y border-border bg-muted/25 px-4 py-3">
        <div><p className="text-[11px] font-medium text-muted-foreground">You may get</p><p className="font-display mt-0.5 text-lg font-bold text-foreground">{offer.amount}</p></div>
        <div><p className="text-[11px] text-muted-foreground">Interest from</p><p className="font-display mt-0.5 text-sm font-bold text-foreground">{offer.rate}</p></div>
        <div className="col-span-2 grid grid-cols-[1.35fr_.65fr] items-end gap-3">
          <div><p className="mb-1.5 text-[11px] text-muted-foreground">Approval chance</p><ApprovalBars count={offer.chance} label={offer.chanceLabel} /></div>
          <div><p className="text-[11px] text-muted-foreground">Disbursal</p><p className="mt-0.5 text-xs font-semibold text-foreground">{offer.speed}</p></div>
        </div>
      </div>
      {details && <div className="border-b border-border px-4 py-3 text-xs text-muted-foreground">Final rate and fees are confirmed by the lender before you submit.</div>}
      <div className="px-4 py-3">
        {applied ? <div className="flex h-11 items-center justify-between rounded-lg bg-muted px-3 text-sm text-muted-foreground"><span className="font-semibold">Applied</span><Button variant="link" onClick={onUndo} className="h-auto px-0 text-xs">Undo</Button></div> : <div className="grid grid-cols-[.8fr_1.2fr] gap-2"><Button variant="outline" onClick={() => setDetails((open) => !open)}>Details</Button><Button onClick={onApply} className="h-11 bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Apply now</Button></div>}
        <Button variant="ghost" onClick={onInfo} className="mt-1 h-7 w-full justify-center px-0 text-[11px] font-normal text-muted-foreground hover:bg-transparent"><Info />1 credit enquiry on application</Button>
      </div>
    </article>
  );
}

function LockedCard({ offer, onClick }: { offer: LockedOffer; onClick: () => void }) {
  return <Button variant="ghost" onClick={onClick} className="h-auto w-full justify-start rounded-lg border border-border bg-card px-3 py-3 text-left shadow-none hover:bg-muted/50"><LenderLogo name={offer.lender} logo={offer.logo} muted size="sm" /><span className="ml-3 min-w-0 flex-1"><span className="flex items-center gap-1.5"><span className="truncate text-sm font-bold text-foreground">{offer.lender}</span><LockKeyhole className="h-3.5 w-3.5 text-muted-foreground" /></span><span className="block text-[11px] font-normal text-muted-foreground">{offer.product}</span><span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-border"><span className="block h-full rounded-full bg-amber" style={{ width: `${offer.progress}%` }} /></span><span className="mt-1 block text-[11px] font-semibold text-foreground">{offer.distance}</span></span><span className="ml-3 shrink-0 text-xs font-semibold text-primary">View plan</span></Button>;
}

function InAppBrowser({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  return <div className="absolute inset-0 z-[70] flex flex-col bg-background"><div className="grid h-14 shrink-0 grid-cols-[72px_1fr_72px] items-center bg-primary-deep px-3 text-primary-foreground"><Button onClick={onClose} variant="ghost" className="justify-start px-0 text-primary-foreground hover:bg-transparent">Close</Button><div className="truncate text-center text-[15px] font-bold">{offer.lender}</div><ShieldCheck className="ml-auto h-4 w-4" /></div><div className="flex-1 overflow-y-auto"><div className="bg-primary-deep px-5 pb-8 pt-9 text-center text-primary-foreground"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-card p-2"><img src={offer.logo} alt={`${offer.lender} logo`} className="h-full w-full object-contain" /></div><h2 className="font-display mt-4 text-2xl font-bold">{offer.product}</h2></div><div className="p-4"><div className="rounded-lg border border-border bg-card p-5 shadow-sm"><div className="text-xs text-muted-foreground">Your eligible amount</div><div className="font-display mt-1 text-2xl font-bold text-foreground">{offer.amount}</div><Button className="mt-6 h-12 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue application</Button></div></div></div></div>;
}

function NTCOffers({ onChat }: { onChat: () => void }) {
  return <div><header className="mb-5"><h2 className="font-display text-2xl font-bold text-foreground">Start without a credit score</h2><p className="mt-1 text-sm text-muted-foreground">Lenders that consider new-to-credit customers.</p></header><div className="space-y-2">{NTC_LENDERS.map((lender) => <div key={lender.name} className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card px-3 py-3"><LenderLogo name={lender.name} logo={lender.logo} size="sm" /><div className="flex-1 text-sm font-bold text-foreground">{lender.name}</div></div>)}</div><Button variant="outline" onClick={onChat} className="mt-4 h-12 w-full rounded-lg">Build my credit score</Button></div>;
}

export function LoanOffersScreen({ state, setState, onChat, onBack }: { user: DemoUser; state: LoanJourneyState; setState: LoanStateSetter; onChat: (kind: "recommend" | "issues" | "time" | "ntc", lender?: string) => void; onBack: () => void }) {
  const [sheet, setSheet] = useState<"amount" | "info" | "apply" | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [browserOffer, setBrowserOffer] = useState<Offer | null>(null);
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTop = useRef(0);
  const update = (patch: Partial<LoanJourneyState>) => setState((current) => ({ ...current, ...patch }));

  useEffect(() => { if (state.step !== "checking") return; const timer = window.setTimeout(() => setState((current) => ({ ...current, step: "offers" })), 2000); return () => window.clearTimeout(timer); }, [state.step, setState]);

  const available = state.persona === "prime" ? AVAILABLE : state.persona === "thin" ? AVAILABLE.slice(0, 1) : state.persona === "zero" || state.persona === "ntc" ? [] : AVAILABLE.slice(0, 3);
  const locked = state.persona === "prime" || state.persona === "ntc" ? [] : state.persona === "thin" ? LOCKED_TIME : LOCKED_ISSUES;
  const visibleAvailable = showAll ? available.slice(0, 9) : available.slice(0, 3);
  const startQuestions = () => update({ step: "details" });
  const openApply = (offer: Offer) => { setSelectedOffer(offer); setSheet("apply"); };
  const confirmApply = () => { if (!selectedOffer) return; scrollTop.current = scrollRef.current?.scrollTop ?? 0; setSheet(null); setBrowserOffer(selectedOffer); };
  const closeBrowser = () => { if (browserOffer) update({ applied: Array.from(new Set([...state.applied, browserOffer.id])) }); setBrowserOffer(null); requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollTop.current; }); };

  if (state.step === "checking") return <div className="flex flex-1 flex-col items-center justify-center bg-card px-8 text-center motion-safe:animate-[loan-page-slide_260ms_ease-out]"><Loader2 className="h-11 w-11 animate-spin text-primary" /><h2 className="font-display mt-5 text-xl font-bold text-foreground">Checking lender matches</h2><div className="mt-5 flex gap-2">{INTRO_LENDERS.slice(0, 4).map((lender) => <LenderLogo key={lender.name} name={lender.name} logo={lender.logo} muted size="sm" />)}</div></div>;

  if (state.step === "intro") return <div className="relative flex min-h-0 flex-1 flex-col bg-card"><AppHeader onBack={onBack} /><div className="flex min-h-0 flex-1 motion-safe:animate-[loan-page-slide_260ms_ease-out]"><IntroPage onStart={startQuestions} /></div></div>;

  if (state.step === "details" || state.step === "location") return <div className="relative flex min-h-0 flex-1 flex-col bg-card"><AppHeader onBack={() => update({ step: state.step === "location" ? "details" : "intro" })} /><QuestionPage state={state} update={update} /></div>;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-card motion-safe:animate-[loan-page-slide_260ms_ease-out]">
      <AppHeader onBack={onBack} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
        {state.persona === "ntc" ? <NTCOffers onChat={() => onChat("ntc")} /> : <>
          <header className="mb-4 flex items-start justify-between gap-3"><div><h2 className="font-display text-xl font-bold text-foreground">Loans you may be eligible for</h2><p className="mt-0.5 text-xs text-muted-foreground">Best approval chances shown first</p></div><Button variant="link" onClick={() => setSheet("amount")} className="h-auto shrink-0 px-0 text-sm font-semibold">₹50,000</Button></header>
          {available.length > 0 ? <section><div className="space-y-3">{visibleAvailable.map((offer, index) => <OfferCard key={offer.id} featured={index === 0} offer={offer} applied={state.applied.includes(offer.id)} onInfo={() => setSheet("info")} onApply={() => openApply(offer)} onUndo={() => update({ applied: state.applied.filter((id) => id !== offer.id) })} />)}</div>{available.length > 3 && !showAll && <Button variant="link" onClick={() => setShowAll(true)} className="h-12 w-full">Show 6 more<ChevronDown /></Button>}<Button variant="outline" onClick={() => onChat("recommend")} className="mt-3 h-12 w-full rounded-lg bg-card"><MessageCircle className="text-primary" />Ask Arjun to compare</Button></section> : <div className="rounded-lg border border-border bg-card p-5 shadow-sm"><h3 className="font-display text-lg font-bold text-foreground">No matches right now</h3><Button onClick={() => onChat("issues", "Moneyview")} className="mt-5 h-11 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">See what to improve</Button></div>}
          {locked.length > 0 && <section className="mt-6"><header className="mb-3"><h3 className="font-display text-lg font-bold text-foreground">Loans within reach</h3><p className="mt-0.5 text-xs text-muted-foreground">See what to improve before you apply</p></header><div className="space-y-2">{locked.slice(0, 5).map((offer) => <LockedCard key={offer.id} offer={offer} onClick={() => onChat(offer.reason, offer.lender)} />)}</div></section>}
        </>}
      </div>
      {sheet === "amount" && <Sheet title="Loan amount" subtitle="Choose the amount you need" onClose={() => setSheet(null)}><div className="mt-5 grid grid-cols-3 gap-2">{["₹25,000", "₹50,000", "₹1,00,000"].map((amount) => <Button key={amount} variant={amount === "₹50,000" ? "default" : "outline"} onClick={() => setSheet(null)} className={amount === "₹50,000" ? "bg-primary-deep text-primary-foreground" : ""}>{amount}</Button>)}</div></Sheet>}
      {sheet === "info" && <Sheet title="Credit enquiry" onClose={() => setSheet(null)}><p className="mt-2 text-sm text-muted-foreground">An application adds one enquiry to your credit report.</p></Sheet>}
      {sheet === "apply" && selectedOffer && <Sheet title={`Apply with ${selectedOffer.lender}?`} subtitle="This adds one credit enquiry." onClose={() => setSheet(null)}><Button onClick={confirmApply} className="mt-5 h-11 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue to {selectedOffer.lender}</Button><Button onClick={() => setSheet(null)} variant="ghost" className="mt-2 h-11 w-full">Not now</Button></Sheet>}
      {browserOffer && <InAppBrowser offer={browserOffer} onClose={closeBrowser} />}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronLeft, Info, Loader2, LocateFixed, LockKeyhole, MoreVertical, ShieldCheck, X } from "lucide-react";
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
  approvalTime: string;
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
  { id: "moneyview", lender: "Moneyview", product: "Personal loan", logo: moneyviewLogo, approvalTime: "Less than 24hr", amount: "up to ₹60,000", rate: "14% p.a.", speed: "Within 24 hours" },
  { id: "tez", lender: "Tez Credit", product: "Personal loan", logo: tezLogo, approvalTime: "Instantly", amount: "up to ₹50,000", rate: "16% p.a.", speed: "1–2 business days", options: ["Instant personal loan", "Flexi personal loan"] },
  { id: "ram", lender: "Ram Fincorp", product: "Personal loan", logo: ramLogo, approvalTime: "Less than 48hr", amount: "up to ₹45,000", rate: "18% p.a.", speed: "Within 48 hours" },
  { id: "kreditbee", lender: "KreditBee", product: "Personal loan", logo: kreditbeeLogo, approvalTime: "Less than 48hr", amount: "up to ₹35,000", rate: "19% p.a.", speed: "1–2 business days" },
  { id: "kissht", lender: "Kissht", product: "Consumer loan", logo: kisshtLogo, approvalTime: "Less than 48hr", amount: "up to ₹30,000", rate: "20% p.a.", speed: "Within 48 hours" },
  { id: "bharatpe", lender: "BharatPe", product: "Business loan", logo: bharatpeLogo, approvalTime: "Less than 24hr", amount: "up to ₹55,000", rate: "18% p.a.", speed: "2–3 business days" },
  { id: "zype", lender: "Zype", product: "Personal loan", approvalTime: "Instantly", amount: "up to ₹40,000", rate: "21% p.a.", speed: "Within 48 hours" },
  { id: "lendingplate", lender: "Lendingplate", product: "Personal loan", logo: lendingplateLogo, approvalTime: "Less than 48hr", amount: "up to ₹25,000", rate: "22% p.a.", speed: "2–3 business days" },
  { id: "creditsea", lender: "Credit Sea", product: "Credit line", logo: creditseaLogo, approvalTime: "Less than 24hr", amount: "up to ₹30,000", rate: "24% p.a.", speed: "Within 48 hours" },
];

const LOCKED_ISSUES: LockedOffer[] = [
  { id: "lock-prefr", lender: "Prefr", product: "Personal loan", logo: prefrLogo, distance: "Just a few points away", progress: 58, reason: "issues" },
  { id: "lock-hdfc", lender: "HDFC Bank", product: "Personal loan", logo: hdfcLogo, distance: "Just a few points away", progress: 49, reason: "issues" },
  { id: "lock-kissht", lender: "Kissht", product: "Personal loan", logo: kisshtLogo, distance: "Just a few points away", progress: 44, reason: "issues" },
  { id: "lock-creditsea", lender: "Credit Sea", product: "Credit line", logo: creditseaLogo, distance: "Just a few points away", progress: 37, reason: "issues" },
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
          <div><h3 className="font-display text-[22px] font-bold leading-[28px] text-card-foreground">{title}</h3>{subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>
          <Button aria-label="Close" size="icon" variant="ghost" onClick={onClose}><X /></Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AppHeader({ onBack, onEdit }: { onBack: () => void; onEdit?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="relative flex h-14 shrink-0 items-center gap-2 bg-primary-deep px-3 text-primary-foreground"><Button aria-label="Back" size="icon" variant="ghost" onClick={onBack} className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><ChevronLeft className="h-6 w-6" /></Button><h1 className="flex-1 text-[17px] font-semibold">Loans</h1>{onEdit && <><Button aria-label="More options" size="icon" variant="ghost" onClick={() => setMenuOpen((open) => !open)} className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><MoreVertical className="h-5 w-5" /></Button>{menuOpen && <div className="absolute right-3 top-12 z-40 min-w-44 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"><Button variant="ghost" onClick={() => { setMenuOpen(false); onEdit(); }} className="h-12 w-full justify-start rounded-none px-4 text-sm text-popover-foreground">Edit loan details</Button></div>}</>}</header>;
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
          <h2 className="font-display text-[22px] font-bold leading-[28px] text-foreground">Find the right loan for you</h2>
          <div className="mt-7 grid grid-cols-3 gap-3">
            {INTRO_LENDERS.map((lender) => <div key={lender.name} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card px-2 py-3"><img src={lender.logo} alt={`${lender.name} logo`} className="h-7 max-w-full object-contain grayscale" /><span className="text-center text-[11px] font-medium leading-tight text-muted-foreground">{lender.name}</span></div>)}
          </div>
          <p className="mt-5 text-center text-sm font-medium text-muted-foreground">Compare offers from 30+ lenders</p>
        </div>
      </div>
      <div className="shrink-0 border-t border-border bg-card px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
        <Button onClick={onStart} className="mx-auto h-[54px] w-full max-w-[361px] rounded-lg bg-primary-deep text-base font-semibold text-primary-foreground hover:bg-primary-deep/90">View my offers</Button>
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
  return <FormField label={label}><div className="flex h-10 items-center"><span className="text-base font-semibold text-foreground">₹</span><input ref={ref} id={id} inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={value ? Number(value).toLocaleString("en-IN") : ""} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="0" className="min-w-0 flex-1 bg-transparent px-2 text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground/50" /></div></FormField>;
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
  const selectClass = "h-12 min-w-0 flex-1 appearance-none bg-card px-2 text-center text-base font-semibold text-foreground outline-none";
  return <FormField label="Date of birth"><div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border bg-card"><select aria-label="Birth day" value={day} onChange={(event) => change("day", event.target.value)} className={selectClass}><option value="">DD</option>{Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0")).map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Birth month" value={month} onChange={(event) => change("month", event.target.value)} className={selectClass}><option value="">MM</option>{Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")).map((item) => <option key={item} value={item}>{item}</option>)}</select><select aria-label="Birth year" value={year} onChange={(event) => change("year", event.target.value)} className={selectClass}><option value="">YYYY</option>{Array.from({ length: 83 }, (_, index) => String(yearNow - 18 - index)).map((item) => <option key={item}>{item}</option>)}</select></div></FormField>;
}

function QuestionPage({ state, update }: { state: LoanJourneyState; update: (patch: Partial<LoanJourneyState>) => void }) {
  const detailsValid = Boolean(state.work && state.income && state.loanAmount && (state.work !== "Salaried" || state.salaryMode));
  const locationValid = state.pincode.length === 6 && /^\d{4}-\d{2}-\d{2}$/.test(state.dob);
  return <div key={state.step} className="flex min-h-0 flex-1 flex-col bg-card motion-safe:animate-[loan-page-slide_260ms_ease-out]"><div className="flex-1 overflow-y-auto px-5 pb-5 pt-6"><h2 className="font-display text-[22px] font-bold leading-[28px] text-foreground">Add your details for best offers</h2>{state.step === "details" ? <div className="mt-6 space-y-4"><InlineSelect label="Select Employment type" value={state.work} options={[{ label: "Salaried" }, { label: "Self-employed" }, { label: "Student" }, { label: "Other" }]} onChange={(work) => update({ work: work as WorkType, salaryMode: work === "Salaried" ? state.salaryMode : "" })} /><AmountField id="monthly-income" label="Monthly income" value={state.income} onChange={(income) => update({ income })} />{state.work === "Salaried" && <InlineSelect label="How do you get paid?" value={state.salaryMode} options={[{ label: "Bank transfer" }, { label: "Cash" }, { label: "Cheque" }]} onChange={(salaryMode) => update({ salaryMode: salaryMode as SalaryMode })} />}<AmountField id="loan-amount" label="Loan amount" value={state.loanAmount} onChange={(loanAmount) => update({ loanAmount })} /></div> : <div className="mt-6 space-y-5"><FormField label="Pincode"><PincodeInput value={state.pincode} onChange={(pincode) => update({ pincode })} /></FormField><DateWheel value={state.dob} onChange={(dob) => update({ dob })} /></div>}</div><div className="shrink-0 border-t border-border bg-card px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3"><Button type="button" disabled={state.step === "details" ? !detailsValid : !locationValid} onClick={() => update({ step: state.step === "details" ? "location" : "checking" })} className="mx-auto h-[54px] w-full max-w-[361px] rounded-lg bg-primary-deep text-base font-semibold text-primary-foreground hover:bg-primary-deep/90">Continue</Button></div></div>;
}

function PincodeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");
  useEffect(() => { const timer = window.setTimeout(() => ref.current?.focus(), 180); return () => window.clearTimeout(timer); }, []);
  return <div><Button variant="link" onClick={() => onChange("110001")} className="mb-4 h-auto px-0"><LocateFixed />Use my location</Button><div className="relative" onClick={() => ref.current?.focus()}><input ref={ref} aria-label="Pincode" inputMode="numeric" pattern="[0-9]*" autoComplete="postal-code" value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))} className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0" /><div className="flex gap-2">{digits.map((digit, index) => <span key={index} className={`flex h-12 flex-1 items-center justify-center rounded-lg border text-base font-semibold text-foreground ${digit.trim() ? "border-primary bg-primary-soft" : "border-input bg-background"}`}>{digit}</span>)}</div></div></div>;
}

function monthlyRate(rate: string) {
  const match = rate.match(/(\d+(?:\.\d+)?)/);
  if (!match) return rate;
  const monthly = (parseFloat(match[1]) / 12).toFixed(1);
  return `${monthly}% p.m.`;
}

function OfferCard({ offer, featured, applied, onInfo, onApply }: { offer: Offer; featured: boolean; applied: boolean; onInfo: () => void; onApply: () => void }) {
  const [details, setDetails] = useState(false);
  const [detailTab, setDetailTab] = useState<"details" | "features">("details");
  return (
    <article className={`overflow-hidden rounded-lg border bg-card ${featured ? "border-primary/40" : "border-border"}`}>
      <div className="flex min-h-16 items-center gap-3 border-b border-border px-4 py-3">
        <LenderLogo name={offer.lender} logo={offer.logo} size="sm" />
        <h4 className="min-w-0 flex-1 font-display text-base font-semibold text-foreground">{offer.lender} {offer.product}</h4>
      </div>
      <div className="grid grid-cols-2 px-4 py-4">
        <div className="min-w-0 border-r border-dashed border-border pr-3">
          <p className="text-sm text-muted-foreground">Loan amount</p>
          <p className="mt-1 text-base font-semibold leading-5 text-foreground">{offer.amount}</p>
        </div>
        <div className="min-w-0 pl-3">
          <p className="text-sm text-muted-foreground">Interest rate</p>
          <p className="mt-1 whitespace-nowrap text-base font-semibold leading-5 text-foreground">from {monthlyRate(offer.rate)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 pb-4">
        <Button variant="ghost" onClick={() => setDetails((open) => !open)} className="h-11 justify-start px-0 text-base font-semibold text-primary hover:bg-transparent hover:text-primary-deep">Offer details<ChevronDown className={`transition-transform ${details ? "rotate-180" : ""}`} /></Button>
        {applied ? <div className="flex h-11 min-w-36 items-center justify-center rounded-md bg-primary-soft px-4 text-sm font-semibold text-primary-deep">In review</div> : <Button onClick={onApply} className="h-11 min-w-36 bg-primary-deep px-5 text-base font-semibold text-primary-foreground shadow-none hover:bg-primary-deep/90">Apply now</Button>}
      </div>
      {details && <div className="border-t border-border bg-muted/40 px-4 pb-4">
        <div className="grid grid-cols-2 border-b border-border">
          <Button type="button" variant="ghost" onClick={() => setDetailTab("details")} className={`h-12 rounded-none border-b-2 text-sm hover:bg-transparent ${detailTab === "details" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Details</Button>
          <Button type="button" variant="ghost" onClick={() => setDetailTab("features")} className={`h-12 rounded-none border-b-2 text-sm hover:bg-transparent ${detailTab === "features" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Features</Button>
        </div>
        {detailTab === "details" ? <dl className="space-y-3 pt-4 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Processing fee</dt><dd className="font-semibold text-foreground">Confirmed by lender</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Loan processing time</dt><dd className="text-right font-semibold text-foreground">{offer.speed}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Loan amount</dt><dd className="text-right font-semibold text-foreground">{offer.amount}</dd></div>
          {offer.options && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Available options</dt><dd className="text-right font-semibold text-foreground">{offer.options.join(", ")}</dd></div>}
        </dl> : <ul className="space-y-3 pt-4 text-sm text-foreground"><li className="flex gap-2"><span aria-hidden="true">•</span>100% digital application</li><li className="flex gap-2"><span aria-hidden="true">•</span>No collateral required</li><li className="flex gap-2"><span aria-hidden="true">•</span>Fast lender decision</li></ul>}
        <Button variant="ghost" onClick={onInfo} className="mt-3 h-8 w-full justify-start px-0 text-xs font-normal text-muted-foreground hover:bg-transparent"><Info />1 credit enquiry on application</Button>
      </div>}
    </article>
  );
}

function LockedCard({ offer, onClick }: { offer: LockedOffer; onClick: () => void }) {
  return <Button variant="ghost" onClick={onClick} className="h-auto w-full justify-start rounded-lg border border-border bg-card px-3 py-3 text-left shadow-none hover:bg-muted/50"><LenderLogo name={offer.lender} logo={offer.logo} muted size="sm" /><span className="ml-3 min-w-0 flex-1"><span className="flex items-center gap-1.5"><span className="truncate text-sm font-bold text-foreground">{offer.lender}</span><LockKeyhole className="h-3.5 w-3.5 text-muted-foreground" /></span><span className="block text-[11px] font-normal text-muted-foreground">{offer.product}</span><span className="mt-1.5 block text-xs font-semibold text-foreground">{offer.distance}</span></span></Button>;
}

type ApplicationFilter = "All" | "In review" | "Approved" | "Disbursed";

function ApplicationsScreen({ applied, onBack, onUndo }: { applied: string[]; onBack: () => void; onUndo: (id: string) => void }) {
  const [filter, setFilter] = useState<ApplicationFilter>("All");
  const applications = AVAILABLE.filter((offer) => applied.includes(offer.id));
  const visible = filter === "All" || filter === "In review" ? applications : [];
  return <div className="relative flex min-h-0 flex-1 flex-col bg-card"><AppHeader onBack={onBack} /><div className="flex-1 overflow-y-auto px-4 pb-6 pt-5"><h2 className="font-display text-xl font-bold text-foreground">Your applications</h2><div className="mt-4 flex gap-2 overflow-x-auto pb-1">{(["All", "In review", "Approved", "Disbursed"] as ApplicationFilter[]).map((item) => <Button key={item} variant={filter === item ? "default" : "outline"} onClick={() => setFilter(item)} className={`h-9 shrink-0 rounded-full px-4 shadow-none ${filter === item ? "bg-primary-deep text-primary-foreground hover:bg-primary-deep/90" : "bg-card"}`}>{item}</Button>)}</div>{visible.length > 0 ? <div className="mt-4 space-y-3">{visible.map((offer) => <article key={offer.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"><LenderLogo name={offer.lender} logo={offer.logo} size="sm" /><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-foreground">{offer.lender}</h3><p className="text-xs text-muted-foreground">{offer.product}</p></div><div className="text-right"><p className="text-sm font-semibold text-primary-deep">In review</p><Button variant="link" onClick={() => onUndo(offer.id)} className="h-auto px-0 text-xs">Undo</Button></div></article>)}</div> : <div className="mt-8 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">No {filter === "All" ? "applications" : filter.toLowerCase() + " applications"} yet</div>}</div></div>;
}

function InAppBrowser({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  return <div className="absolute inset-0 z-[70] flex flex-col bg-background"><div className="grid h-14 shrink-0 grid-cols-[72px_1fr_72px] items-center bg-primary-deep px-3 text-primary-foreground"><Button onClick={onClose} variant="ghost" className="justify-start px-0 text-primary-foreground hover:bg-transparent">Close</Button><div className="truncate text-center text-[15px] font-bold">{offer.lender}</div><ShieldCheck className="ml-auto h-4 w-4" /></div><div className="flex-1 overflow-y-auto"><div className="bg-primary-deep px-5 pb-8 pt-9 text-center text-primary-foreground"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-card p-2"><img src={offer.logo} alt={`${offer.lender} logo`} className="h-full w-full object-contain" /></div><h2 className="font-display mt-4 text-2xl font-bold">{offer.product}</h2></div><div className="p-4"><div className="rounded-lg border border-border bg-card p-5 shadow-sm"><div className="text-xs text-muted-foreground">Your eligible amount</div><div className="font-display mt-1 text-2xl font-bold text-foreground">{offer.amount}</div><Button className="mt-6 h-12 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue application</Button></div></div></div></div>;
}

function NTCOffers({ onChat }: { onChat: () => void }) {
  return <div><header className="mb-5"><h2 className="font-display text-[22px] font-bold leading-[28px] text-foreground">Start without a credit score</h2><p className="mt-1 text-sm text-muted-foreground">Lenders that consider new-to-credit customers.</p></header><div className="space-y-2">{NTC_LENDERS.map((lender) => <div key={lender.name} className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card px-3 py-3"><LenderLogo name={lender.name} logo={lender.logo} size="sm" /><div className="flex-1 text-sm font-bold text-foreground">{lender.name}</div></div>)}</div><Button variant="outline" onClick={onChat} className="mt-4 h-12 w-full rounded-lg">Build my credit score</Button></div>;
}

export function LoanOffersScreen({ state, setState, onChat, onBack }: { user: DemoUser; state: LoanJourneyState; setState: LoanStateSetter; onChat: (kind: "recommend" | "issues" | "time" | "ntc", lender?: string) => void; onBack: () => void }) {
  const [sheet, setSheet] = useState<"amount" | "info" | "apply" | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [browserOffer, setBrowserOffer] = useState<Offer | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
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

  if (showApplications) return <ApplicationsScreen applied={state.applied} onBack={() => setShowApplications(false)} onUndo={(id) => update({ applied: state.applied.filter((appliedId) => appliedId !== id) })} />;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-card motion-safe:animate-[loan-page-slide_260ms_ease-out]">
      <AppHeader onBack={onBack} onEdit={() => update({ step: "details" })} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
        {state.persona === "ntc" ? <NTCOffers onChat={() => onChat("ntc")} /> : <>
          <header className="mb-4"><h2 className="font-display text-xl font-bold text-foreground">Loan offers for you</h2></header>
          {available.length > 0 ? <section><div className="space-y-3">{visibleAvailable.map((offer, index) => <OfferCard key={offer.id} featured={index === 0} offer={offer} applied={state.applied.includes(offer.id)} onInfo={() => setSheet("info")} onApply={() => openApply(offer)} />)}</div>{available.length > 3 && !showAll && <Button variant="link" onClick={() => setShowAll(true)} className="h-12 w-full">Show 6 more<ChevronDown /></Button>}</section> : <div className="rounded-lg border border-border bg-card p-5"><h3 className="font-display text-lg font-bold text-foreground">No matches right now</h3></div>}
          {locked.length > 0 && <section className="mt-6"><header className="mb-3"><h3 className="font-display text-lg font-bold text-foreground">Almost eligible</h3></header><div className="space-y-2">{locked.slice(0, 5).map((offer) => <LockedCard key={offer.id} offer={offer} onClick={() => onChat(offer.reason, offer.lender)} />)}</div></section>}
          <Button variant="outline" onClick={() => setShowApplications(true)} className="mt-6 h-[54px] w-full rounded-lg bg-card text-base font-semibold shadow-none">Manage applications</Button>
        </>}
      </div>
      {sheet === "amount" && <Sheet title="Loan amount" subtitle="Choose the amount you need" onClose={() => setSheet(null)}><div className="mt-5 grid grid-cols-3 gap-2">{[{ label: "₹25,000", value: "25000" }, { label: "₹50,000", value: "50000" }, { label: "₹1,00,000", value: "100000" }].map((option) => <Button key={option.label} variant={option.value === (state.loanAmount || "50000") ? "default" : "outline"} onClick={() => { update({ loanAmount: option.value }); setSheet(null); }} className={option.value === (state.loanAmount || "50000") ? "bg-primary-deep text-primary-foreground" : ""}>{option.label}</Button>)}</div></Sheet>}
      {sheet === "info" && <Sheet title="Credit enquiry" onClose={() => setSheet(null)}><p className="mt-2 text-sm text-muted-foreground">An application adds one enquiry to your credit report.</p></Sheet>}
      {sheet === "apply" && selectedOffer && <Sheet title={`Apply with ${selectedOffer.lender}?`} subtitle="This adds one credit enquiry." onClose={() => setSheet(null)}><Button onClick={confirmApply} className="mt-5 h-11 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue to {selectedOffer.lender}</Button><Button onClick={() => setSheet(null)} variant="ghost" className="mt-2 h-11 w-full">Not now</Button></Sheet>}
      {browserOffer && <InAppBrowser offer={browserOffer} onClose={closeBrowser} />}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ChevronDown, ChevronLeft, ChevronUp, CreditCard, Info, Loader2, LocateFixed, LockKeyhole, MoreVertical, ShieldCheck, X } from "lucide-react";
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
import unityCardArt from "@/assets/unity-roarbank-card.png.asset.json";

export type Persona = "rejected" | "prime" | "thin" | "ntc" | "zero";
type WorkType = "Salaried" | "Self-employed" | "Student" | "Other" | "";
type SalaryMode = "Bank transfer" | "Cash" | "Cheque" | "";
type Step = "intro" | "details" | "location" | "checking" | "offers";

type LoanStateSetter = (next: LoanJourneyState | ((current: LoanJourneyState) => LoanJourneyState)) => void;

// Lead lifecycle per offer: no lead → open → (expired | pending → approved | rejected | disbursed)
type LeadStatus = "open" | "expired" | "pending" | "approved" | "rejected" | "disbursed";

const leadButton = (status?: LeadStatus): { label: string; disabled: boolean } => {
  switch (status) {
    case "open": return { label: "Continue", disabled: false }; // same lender URL
    case "expired": return { label: "Apply again", disabled: false }; // new lead
    case "pending": return { label: "Pending", disabled: false }; // same lender URL
    case "approved": return { label: "Approved", disabled: false }; // same lender URL
    case "rejected": return { label: "Apply again", disabled: false }; // new lead
    case "disbursed": return { label: "Disbursed", disabled: true }; // frozen
    default: return { label: "Apply now", disabled: false }; // no lead → lender
  }
};

// Bureau state: hit = record pulled, no_hit = new to credit, unavailable = bureau never pulled
export type BureauState = "hit" | "no_hit" | "unavailable";
// BRE outcome: ok = lenders returned, none = valid result with 0 eligible, empty/error = no answer
export type BreOutcome = "ok" | "none" | "empty" | "error";

export interface LoanJourneyState {
  step: Step;
  persona: Persona;
  bureau: BureauState;
  bre: BreOutcome;
  lastCheckedAt: string;
  lockedContacted: string[];
  work: WorkType;
  income: string;
  salaryMode: SalaryMode;
  loanAmount: string;
  pincode: string;
  dob: string;
  applied: Record<string, LeadStatus>;
}

export const createLoanJourneyState = (firstVisit: boolean): LoanJourneyState => ({
  step: firstVisit ? "intro" : "offers",
  persona: "rejected",
  bureau: "hit",
  bre: "ok",
  lastCheckedAt: "",
  lockedContacted: [],
  work: "",
  income: "",
  salaryMode: "",
  loanAmount: "",
  pincode: "",
  dob: "",
  applied: {},
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
  channel: "App based" | "Web based";
};

type LockedOffer = {
  id: string;
  lender: string;
  product: string;
  logo?: string;
  distance: string;
  progress: number;
  reason: "issues" | "time";
  issue?: string;
  explanation?: string;
};

const AVAILABLE: Offer[] = [
  { id: "moneyview", lender: "Moneyview", product: "Personal loan", logo: moneyviewLogo, approvalTime: "Less than 24hr", amount: "up to ₹60,000", rate: "14% p.a.", speed: "Within 24 hours", channel: "App based" },
  { id: "tez", lender: "Tez Credit", product: "Personal loan", logo: tezLogo, approvalTime: "Instantly", amount: "up to ₹50,000", rate: "16% p.a.", speed: "1–2 business days", options: ["Instant personal loan", "Flexi personal loan"], channel: "Web based" },
  { id: "ram", lender: "Ram Fincorp", product: "Personal loan", logo: ramLogo, approvalTime: "Less than 48hr", amount: "up to ₹45,000", rate: "18% p.a.", speed: "Within 48 hours", channel: "Web based" },
  { id: "kreditbee", lender: "KreditBee", product: "Personal loan", logo: kreditbeeLogo, approvalTime: "Less than 48hr", amount: "up to ₹35,000", rate: "19% p.a.", speed: "1–2 business days", channel: "App based" },
  { id: "kissht", lender: "Kissht", product: "Consumer loan", logo: kisshtLogo, approvalTime: "Less than 48hr", amount: "up to ₹30,000", rate: "20% p.a.", speed: "Within 48 hours", channel: "Web based" },
  { id: "bharatpe", lender: "BharatPe", product: "Business loan", logo: bharatpeLogo, approvalTime: "Less than 24hr", amount: "up to ₹55,000", rate: "18% p.a.", speed: "2–3 business days", channel: "App based" },
  { id: "zype", lender: "Zype", product: "Personal loan", approvalTime: "Instantly", amount: "up to ₹40,000", rate: "21% p.a.", speed: "Within 48 hours", channel: "App based" },
  { id: "lendingplate", lender: "Lendingplate", product: "Personal loan", logo: lendingplateLogo, approvalTime: "Less than 48hr", amount: "up to ₹25,000", rate: "22% p.a.", speed: "2–3 business days", channel: "App based" },
  { id: "creditsea", lender: "Credit Sea", product: "Credit line", logo: creditseaLogo, approvalTime: "Less than 24hr", amount: "up to ₹30,000", rate: "24% p.a.", speed: "Within 48 hours", channel: "Web based" },
];

const LOCKED_ISSUES: LockedOffer[] = [
  { id: "lock-prefr", lender: "Prefr", product: "Personal loan", logo: prefrLogo, distance: "Tap to see how to unlock", progress: 58, reason: "issues", issue: "₹13,583 overdue with Hari & Co", explanation: "This overdue account is the highest-impact issue on your credit report." },
  { id: "lock-hdfc", lender: "HDFC Bank", product: "Personal loan", logo: hdfcLogo, distance: "Tap to see how to unlock", progress: 49, reason: "issues", issue: "Written-off account from 2023", explanation: "A written-off account is currently affecting your credit profile." },
  { id: "lock-kissht", lender: "Kissht", product: "Personal loan", logo: kisshtLogo, distance: "Tap to see how to unlock", progress: 44, reason: "issues", issue: "Credit utilisation is at 94%", explanation: "Reducing your card balance below 30% can strengthen your credit profile." },
  { id: "lock-creditsea", lender: "Credit Sea", product: "Credit line", logo: creditseaLogo, distance: "Tap to see how to unlock", progress: 37, reason: "issues", issue: "₹13,583 overdue with Hari & Co", explanation: "This overdue account is the highest-impact issue on your credit report." },
  { id: "lock-lendingplate", lender: "Lendingplate", product: "Personal loan", logo: lendingplateLogo, distance: "Tap to see how to unlock", progress: 35, reason: "issues", issue: "Written-off account from 2023", explanation: "A written-off account is currently affecting your credit profile." },
  { id: "lock-zype", lender: "Zype", product: "Personal loan", distance: "Tap to see how to unlock", progress: 42, reason: "issues", issue: "Credit utilisation is at 94%", explanation: "Reducing your card balance below 30% can strengthen your credit profile." },
];

const LOCKED_TIME: LockedOffer[] = [
  { id: "time-prefr", lender: "Prefr", product: "Personal loan", logo: prefrLogo, distance: "Tap to see how to unlock", progress: 67, reason: "time", issue: "Your credit file is still new", explanation: "Your report currently has eight months of credit history. More on-time payments will help." },
  { id: "time-tez", lender: "Tez Credit", product: "Personal loan", logo: tezLogo, distance: "Tap to see how to unlock", progress: 67, reason: "time", issue: "Your credit file is still new", explanation: "Your report currently has eight months of credit history. More on-time payments will help." },
  { id: "time-hdfc", lender: "HDFC Bank", product: "Credit card", logo: hdfcLogo, distance: "Tap to see how to unlock", progress: 67, reason: "time", issue: "Your credit file is still new", explanation: "Your report currently has eight months of credit history. More on-time payments will help." },
  { id: "time-zype", lender: "Zype", product: "Personal loan", distance: "Tap to see how to unlock", progress: 67, reason: "time", issue: "Your credit file is still new", explanation: "Your report currently has eight months of credit history. More on-time payments will help." },
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

function LenderLogo({ name, logo, size = "md" }: { name: string; logo?: string; size?: "sm" | "md" }) {
  const dimensions = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  return (
    <div className={`flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-1.5`}>
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
            {INTRO_LENDERS.map((lender) => <div key={lender.name} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card px-2 py-3 shadow-sm"><img src={lender.logo} alt={`${lender.name} logo`} className="h-7 max-w-full object-contain" /><span className="text-center text-[11px] font-medium leading-tight text-muted-foreground">{lender.name}</span></div>)}
          </div>
          <p className="mt-5 text-center text-sm font-medium text-muted-foreground">Compare offers from 30+ lenders</p>
        </div>
      </div>
      <div className="shrink-0 bg-card px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
        <Button onClick={onStart} className="mx-auto h-[54px] w-full max-w-[361px] rounded-lg bg-primary-deep text-base font-semibold text-primary-foreground hover:bg-primary-deep/90">View my offers</Button>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <fieldset className="min-h-[72px] rounded-lg border border-input bg-card px-4 pb-3 pt-2"><legend className="px-1 text-sm font-medium text-muted-foreground">{label}</legend>{children}</fieldset>;
}

function InlineSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<{ label: string; note?: string }>; onChange: (value: string) => void }) {
  return <FormField label={label}><div className="flex flex-wrap gap-2 pt-1">{options.map((option) => <Button type="button" key={option.label} variant={value === option.label ? "default" : "outline"} onClick={() => onChange(option.label)} className={`h-9 rounded-full px-4 text-sm font-semibold shadow-none ${value === option.label ? "bg-primary-deep text-primary-foreground hover:bg-primary-deep/90" : "bg-card text-foreground hover:bg-muted"}`}>{option.label}</Button>)}</div></FormField>;
}

function AmountField({ id, label, value, onChange, autoFocus = false }: { id: string; label: string; value: string; onChange: (value: string) => void; autoFocus?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!autoFocus) return; const timer = window.setTimeout(() => ref.current?.focus(), 180); return () => window.clearTimeout(timer); }, [autoFocus]);
  return <FormField label={label}><div className="flex h-10 items-center"><span className="text-base font-semibold text-foreground">₹</span><input ref={ref} id={id} inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={value ? Number(value).toLocaleString("en-IN") : ""} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="0" className="min-w-0 flex-1 bg-transparent px-2 text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground/50" /></div></FormField>;
}

function DateWheel({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const initial = value.split("-");
  const stored = initial[0]?.length === 4 ? `${initial[2] || ""}${initial[1] || ""}${initial[0]}` : "";
  const [digits, setDigits] = useState(stored);
  useEffect(() => { const timer = window.setTimeout(() => ref.current?.focus(), 180); return () => window.clearTimeout(timer); }, []);
  const emit = (raw: string) => {
    setDigits(raw);
    const day = raw.slice(0, 2), month = raw.slice(2, 4), year = raw.slice(4, 8);
    if (raw.length === 8) {
      const maxDay = new Date(Number(year), Number(month) || 1, 0).getDate();
      const safeDay = String(Math.min(Number(day), maxDay)).padStart(2, "0");
      const safeMonth = String(Math.min(Math.max(Number(month), 1), 12)).padStart(2, "0");
      onChange(`${year}-${safeMonth}-${safeDay}`);
    } else {
      onChange(`${year}-${month}-${day}`);
    }
  };
  const boxes = digits.padEnd(8, " ").slice(0, 8).split("");
  const hints = ["D", "D", "M", "M", "Y", "Y", "Y", "Y"];
  const renderBox = (index: number) => {
    const filled = boxes[index].trim();
    return <span key={index} className={`flex h-11 w-8 items-center justify-center rounded-lg border text-base font-semibold ${filled ? "border-foreground/30 bg-background text-foreground" : "border-input bg-background text-muted-foreground/40"}`}>{filled || hints[index]}</span>;
  };
  return <FormField label="Date of birth"><div className="relative" onClick={() => ref.current?.focus()}><input ref={ref} aria-label="Date of birth" inputMode="numeric" pattern="[0-9]*" autoComplete="bday" value={digits} onChange={(event) => emit(event.target.value.replace(/\D/g, "").slice(0, 8))} className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0" /><div className="flex items-center gap-1">{renderBox(0)}{renderBox(1)}<span className="pb-0.5 text-base font-medium text-muted-foreground/50">/</span>{renderBox(2)}{renderBox(3)}<span className="pb-0.5 text-base font-medium text-muted-foreground/50">/</span>{renderBox(4)}{renderBox(5)}{renderBox(6)}{renderBox(7)}</div></div></FormField>;
}

function QuestionPage({ state, update }: { state: LoanJourneyState; update: (patch: Partial<LoanJourneyState>) => void }) {
  const detailsValid = Boolean(state.work && state.income && state.loanAmount && (state.work !== "Salaried" || state.salaryMode));
  const locationValid = state.pincode.length === 6 && /^\d{4}-\d{2}-\d{2}$/.test(state.dob);
  return <div key={state.step} className="flex min-h-0 flex-1 flex-col bg-card motion-safe:animate-[loan-page-slide_260ms_ease-out]"><div className="flex-1 overflow-y-auto px-5 pb-5 pt-6"><h2 className="font-display text-[22px] font-bold leading-[28px] text-foreground">Add your details for best offers</h2>{state.step === "details" ? <div className="mt-6 space-y-4"><InlineSelect label="Select Employment type" value={state.work} options={[{ label: "Salaried" }, { label: "Self-employed" }, { label: "Student" }, { label: "Other" }]} onChange={(work) => update({ work: work as WorkType, salaryMode: work === "Salaried" ? state.salaryMode : "" })} /><AmountField id="monthly-income" label="New monthly income" value={state.income} onChange={(income) => update({ income })} />{state.work === "Salaried" && <InlineSelect label="How do you get paid?" value={state.salaryMode} options={[{ label: "Bank transfer" }, { label: "Cash" }, { label: "Cheque" }]} onChange={(salaryMode) => update({ salaryMode: salaryMode as SalaryMode })} />}<AmountField id="loan-amount" label="Loan amount" value={state.loanAmount} onChange={(loanAmount) => update({ loanAmount })} /></div> : <div className="mt-6 space-y-5"><FormField label="Pincode"><PincodeInput value={state.pincode} onChange={(pincode) => update({ pincode })} /></FormField><DateWheel value={state.dob} onChange={(dob) => update({ dob })} /></div>}</div><div className="shrink-0 bg-card px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3"><Button type="button" disabled={state.step === "details" ? !detailsValid : !locationValid} onClick={() => update({ step: state.step === "details" ? "location" : "checking" })} className="mx-auto h-[54px] w-full max-w-[361px] rounded-lg bg-primary-deep text-base font-semibold text-primary-foreground hover:bg-primary-deep/90">Continue</Button></div></div>;
}

function PincodeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");
  useEffect(() => { const timer = window.setTimeout(() => ref.current?.focus(), 180); return () => window.clearTimeout(timer); }, []);
  return <div><Button variant="link" onClick={() => onChange("110001")} className="mb-4 h-auto px-0"><LocateFixed />Use my location</Button><div className="relative" onClick={() => ref.current?.focus()}><input ref={ref} aria-label="Pincode" inputMode="numeric" pattern="[0-9]*" autoComplete="postal-code" value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))} className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0" /><div className="flex gap-2">{digits.map((digit, index) => <span key={index} className={`flex h-11 flex-1 items-center justify-center rounded-lg border text-base font-semibold text-foreground ${digit.trim() ? "border-foreground/30 bg-background" : "border-input bg-background"}`}>{digit}</span>)}</div></div></div>;
}

function monthlyRate(rate: string) {
  const match = rate.match(/(\d+(?:\.\d+)?)/);
  if (!match) return rate;
  const monthly = (parseFloat(match[1]) / 12).toFixed(1);
  return `${monthly}% p.m.`;
}

function OfferCard({ offer, featured, leadStatus, notice, onApply }: { offer: Offer; featured: boolean; leadStatus?: LeadStatus; notice?: string; onApply: () => void }) {
  const [details, setDetails] = useState(false);
  const action = leadButton(leadStatus);
  const [detailTab, setDetailTab] = useState<"details" | "features">("details");

  return (
    <article className={`overflow-hidden rounded-lg border bg-card shadow-sm ${featured ? "border-primary/40" : "border-border"}`}>
      <div className="relative flex min-h-16 items-center gap-3 border-b border-border px-4 py-3">
        <LenderLogo name={offer.lender} logo={offer.logo} size="sm" />
        <div className="min-w-0 flex-1 pr-20">
          <h4 className="font-display text-base font-semibold text-foreground">{offer.lender}</h4>
          <p className="text-xs text-muted-foreground">{offer.product}</p>
        </div>
        <span className="absolute right-4 top-3 inline-flex shrink-0 items-center rounded-full border border-border bg-transparent px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{offer.channel}</span>
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
        <Button onClick={onApply} disabled={action.disabled} className="h-11 min-w-36 bg-primary-deep px-5 text-base font-semibold text-primary-foreground shadow-none hover:bg-primary-deep/90">{action.label}</Button>
      </div>
      {notice && <p className="px-4 pb-4 -mt-2 text-xs font-medium text-destructive">{notice}</p>}

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
        
      </div>}
    </article>
  );
}

function LockedCard({ offer, onClick, contacted }: { offer: LockedOffer; onClick: () => void; contacted?: boolean }) {
  return (
    <Button variant="ghost" onClick={onClick} className={`h-auto w-full rounded-lg border px-3 py-3 text-left shadow-sm ${contacted ? "border-border bg-muted/60 hover:bg-muted/70" : "border-border bg-card hover:bg-muted/50"}`}>
      <div className="flex w-full items-start gap-3">
        <LenderLogo name={offer.lender} logo={offer.logo} size="sm" />
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <span className={`truncate text-sm font-bold ${contacted ? "text-muted-foreground" : "text-foreground"}`}>{offer.lender}</span>
          </div>
          <p className="text-[11px] font-normal text-muted-foreground">{offer.product}</p>
          <p className={`mt-1.5 text-xs font-semibold ${contacted ? "text-muted-foreground" : "text-foreground"}`}>{contacted ? "Checked — try another loan" : offer.distance}</p>
        </div>
        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
    </Button>
  );
}

type ApplicationFilter = "All" | "Pending" | "Approved" | "Disbursed" | "Rejected";

type ApplicationStatus = Exclude<ApplicationFilter, "All">;

const SAMPLE_APPLICATIONS: Array<{ offer: Offer; status: ApplicationStatus }> = [
  { offer: AVAILABLE[3], status: "Pending" },
  { offer: { id: "hdfc-approved", lender: "HDFC Bank", product: "Personal loan", logo: hdfcLogo, approvalTime: "Less than 24hr", amount: "₹50,000", rate: "15% p.a.", speed: "Within 24 hours", channel: "App based" }, status: "Approved" },
  { offer: AVAILABLE[5], status: "Approved" },
  { offer: AVAILABLE[4], status: "Disbursed" },
  { offer: AVAILABLE[7], status: "Disbursed" },
  { offer: AVAILABLE[1], status: "Rejected" },
  { offer: AVAILABLE[6], status: "Rejected" },
];

const leadToApplicationStatus = (status: LeadStatus): ApplicationStatus => status === "approved" ? "Approved" : status === "disbursed" ? "Disbursed" : status === "rejected" ? "Rejected" : "Pending";

function ApplicationsScreen({ applied, onBack }: { applied: Record<string, LeadStatus>; onBack: () => void }) {
  const [filter, setFilter] = useState<ApplicationFilter>("All");
  const liveApplications = AVAILABLE.filter((offer) => applied[offer.id]).map((offer) => ({ offer, status: leadToApplicationStatus(applied[offer.id]) }));
  const sampleApplications = SAMPLE_APPLICATIONS.filter(({ offer }) => !liveApplications.some((item) => item.offer.id === offer.id));
  const applications = [...liveApplications, ...sampleApplications];
  const visible = filter === "All" ? applications : applications.filter((item) => item.status === filter);
  return <div className="relative flex min-h-0 flex-1 flex-col bg-card"><AppHeader onBack={onBack} /><div className="flex-1 overflow-y-auto px-4 pb-6 pt-5"><h2 className="font-display text-xl font-bold text-foreground">Your applications</h2><div className="mt-4 flex gap-2 overflow-x-auto pb-1">{(["All", "Pending", "Approved", "Disbursed", "Rejected"] as ApplicationFilter[]).map((item) => <Button key={item} variant={filter === item ? "default" : "outline"} onClick={() => setFilter(item)} className={`h-9 shrink-0 rounded-full px-4 shadow-none ${filter === item ? "bg-primary-deep text-primary-foreground hover:bg-primary-deep/90" : "bg-card"}`}>{item}</Button>)}</div>{visible.length > 0 ? <div className="mt-4 space-y-3">{visible.map(({ offer, status }) => <article key={`${offer.id}-${status}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm"><LenderLogo name={offer.lender} logo={offer.logo} size="sm" /><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-foreground">{offer.lender}</h3><p className="text-xs text-muted-foreground">{offer.product} · {offer.amount}</p></div><p className={`whitespace-nowrap text-sm font-semibold ${status === "Rejected" ? "text-destructive" : "text-primary-deep"}`}>{status}</p></article>)}</div> : <div className="mt-8 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">No {filter === "All" ? "applications" : filter.toLowerCase() + " applications"} yet</div>}</div></div>;
}

function InAppBrowser({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  return <div className="absolute inset-0 z-[70] flex flex-col bg-background"><div className="grid h-14 shrink-0 grid-cols-[72px_1fr_72px] items-center bg-primary-deep px-3 text-primary-foreground"><Button onClick={onClose} variant="ghost" className="justify-start px-0 text-primary-foreground hover:bg-transparent">Close</Button><div className="truncate text-center text-[15px] font-bold">{offer.lender}</div><ShieldCheck className="ml-auto h-4 w-4" /></div><div className="flex-1 overflow-y-auto"><div className="bg-primary-deep px-5 pb-8 pt-9 text-center text-primary-foreground"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-card p-2"><img src={offer.logo} alt={`${offer.lender} logo`} className="h-full w-full object-contain" /></div><h2 className="font-display mt-4 text-2xl font-bold">{offer.product}</h2></div><div className="p-4"><div className="rounded-lg border border-border bg-card p-5 shadow-sm"><div className="text-xs text-muted-foreground">Your eligible amount</div><div className="font-display mt-1 text-2xl font-bold text-foreground">{offer.amount}</div><Button className="mt-6 h-12 w-full bg-primary-deep text-primary-foreground hover:bg-primary-deep/90">Continue application</Button></div></div></div></div>;
}

function NTCOffers({ onChat }: { onChat: () => void }) {
  return <div><header className="mb-5"><h2 className="font-display text-[22px] font-bold leading-[28px] text-foreground">Start without a credit score</h2><p className="mt-1 text-sm text-muted-foreground">Lenders that consider new-to-credit customers.</p></header><div className="space-y-2">{NTC_LENDERS.map((lender) => <div key={lender.name} className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 shadow-sm"><LenderLogo name={lender.name} logo={lender.logo} size="sm" /><div className="flex-1 text-sm font-bold text-foreground">{lender.name}</div></div>)}</div></div>;
}

const UNITY_CARD: Offer = {
  id: "card-unity-roar",
  lender: "Unity Small Finance Bank",
  product: "Roarbank UPI Credit Card",
  approvalTime: "Instant",
  amount: "Up to ₹50,000 limit",
  rate: "Lifetime free",
  speed: "Instant approval",
  channel: "App based",
};

function CreditCardOffer({ onApply, onKnowMore }: { onApply: () => void; onKnowMore: () => void }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="relative bg-primary-deep/5 px-4 pb-4 pt-4">
        <span className="inline-flex rounded-md bg-primary-deep px-2 py-1 text-[11px] font-bold text-primary-foreground">Recommended</span>
        <div className="min-h-16 pr-24"><h3 className="font-display mt-3 whitespace-nowrap text-lg font-bold leading-6 text-foreground">Roarbank UPI Credit Card</h3><p className="mt-1 text-sm text-muted-foreground">Unity Small Finance Bank</p></div>
        <div className="pointer-events-none absolute -right-14 -top-1 w-40 rotate-[-10deg]">
          <img src={unityCardArt.url} alt="Roarbank UPI Credit Card" loading="lazy" width={1024} height={656} className="w-full drop-shadow-lg" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Why this fits you</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["No credit history needed", "Zero joining fee", "Zero annual fee", "Up to 20% cashback"].map((feature) => (
            <span key={feature} className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground">{feature}</span>
          ))}
        </div>
      </div>
      <div className="px-4 pb-4 pt-3">
        <p className="text-center text-sm text-muted-foreground">High approval: <span className="font-bold text-foreground">99% new-to-credit users got this card</span></p>
        <Button onClick={onApply} className="mt-3 h-[54px] w-full rounded-lg bg-primary-deep text-base font-bold text-primary-foreground shadow-none hover:bg-primary-deep/90">Apply now</Button>
        <button type="button" onClick={onKnowMore} className="mt-3 w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground">Talk to Arjun</button>
      </div>
    </section>
  );
}

function CreditCardEmptyState({ onChat }: { onChat: () => void }) {
  return <section className="rounded-lg border border-dashed border-border bg-card px-5 py-6 text-center shadow-sm"><div className="text-3xl leading-none">😔</div><h3 className="font-display mt-3 text-lg font-bold text-foreground">Credit builder launching soon</h3><Button variant="link" onClick={onChat} className="mt-2 h-auto p-0 text-sm font-semibold text-primary-deep">Talk to Arjun</Button></section>;
}

function CreditJourneyTracker() {
  const steps = ["Get first credit line", "Repay on time for 6 months", "Loans unlock"];
  return <ol className="mb-5 grid grid-cols-3 gap-2" aria-label="Credit-building steps">{steps.map((step, index) => <li key={step} className="min-w-0"><div className={`mb-3 h-1.5 rounded-full ${index === 0 ? "bg-primary-deep" : "bg-muted"}`} /><span className={`text-[11px] font-bold uppercase ${index === 0 ? "text-primary-deep" : "text-muted-foreground"}`}>Step {index + 1}</span><p className={`mt-1 text-[13px] leading-[18px] ${index === 0 ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>{step}</p></li>)}</ol>;
}

function UnlockIssueSheet({ offer, onClose, onFix }: { offer: LockedOffer; onClose: () => void; onFix: () => void }) {
  return <Sheet title="Why this loan is locked" onClose={onClose}><div className="mt-5"><div className="flex items-center gap-3 border-b border-border pb-4"><LenderLogo name={offer.lender} logo={offer.logo} /><div className="min-w-0 flex-1"><h4 className="font-display text-lg font-bold text-foreground">{offer.lender}</h4><p className="text-sm text-muted-foreground">{offer.product}</p></div><LockKeyhole className="h-5 w-5 shrink-0 text-muted-foreground" /></div><div className="py-5"><p className="text-xs font-bold uppercase text-muted-foreground">Issue found in your report</p><div className="mt-3 flex gap-3"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" /><div><h4 className="font-display text-lg font-bold text-foreground">{offer.issue}</h4><p className="mt-2 text-sm leading-5 text-muted-foreground">{offer.explanation}</p></div></div><div className="mt-5 flex gap-2 rounded-lg bg-primary-soft p-3 text-sm text-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-deep" /><p>No lender application has been sent, so your credit score is unaffected.</p></div></div><Button onClick={onFix} className="h-[54px] w-full rounded-lg bg-primary-deep text-base font-bold text-primary-foreground hover:bg-primary-deep/90">Fix this with Arjun</Button></div></Sheet>;
}

export function LoanOffersScreen({ user, state, setState, onChat, onBack }: { user: DemoUser; state: LoanJourneyState; setState: LoanStateSetter; onChat: (kind: "recommend" | "issues" | "time" | "ntc" | "apply" | "card", lender?: string) => void; onBack: () => void }) {
  const [sheet, setSheet] = useState<"amount" | null>(null);
  const [browserOffer, setBrowserOffer] = useState<Offer | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showAllLocked, setShowAllLocked] = useState(false);
  const [blockedLender, setBlockedLender] = useState<string | null>(null);
  const [selectedLocked, setSelectedLocked] = useState<LockedOffer | null>(null);
  const [showApplications, setShowApplications] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [applyErrors, setApplyErrors] = useState<Record<string, string>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTop = useRef(0);
  const update = (patch: Partial<LoanJourneyState>) => setState((current) => ({ ...current, ...patch }));

  useEffect(() => { if (state.step !== "checking") return; const timer = window.setTimeout(() => setState((current) => ({ ...current, step: "offers" })), 2000); return () => window.clearTimeout(timer); }, [state.step, setState]);


  const noBureau = state.bureau !== "hit" || state.persona === "ntc";
  const breFailed = state.bre === "empty" || state.bre === "error";
  const hasStale = breFailed && Boolean(state.lastCheckedAt);
  const available = noBureau || (breFailed && !hasStale) || state.bre === "none" ? [] : state.persona === "prime" ? AVAILABLE : state.persona === "thin" ? AVAILABLE.slice(0, 1) : state.persona === "zero" ? [] : AVAILABLE;
  const locked = state.persona === "prime" ? [] : state.persona === "thin" ? LOCKED_TIME : LOCKED_ISSUES;
  const visibleAvailable = showAll ? available : available.slice(0, 4);
  const visibleLocked = showAllLocked ? locked : locked.slice(0, 3);
  const startQuestions = () => update({ step: "details" });
  const openApply = (offer: Offer) => {
    // Apply API failure: no lead, no enquiry — card keeps its previous state and stays live.
    if (state.applied[offer.id] === undefined && applyErrors[offer.id] === "pending-fail") {
      setApplyErrors((current) => ({ ...current, [offer.id]: "Couldn’t start this application. Please try again." }));
      return;
    }
    setApplyErrors((current) => { const next = { ...current }; delete next[offer.id]; return next; });
    scrollTop.current = scrollRef.current?.scrollTop ?? 0;
    // Lead is created here; if the lender page fails to open, the card shows Continue + Try again.
    update({ applied: { ...state.applied, [offer.id]: state.applied[offer.id] ?? "open" } });
    setBrowserOffer(offer);
  };
  const handleUnlockTap = (offer: LockedOffer) => {
    // First tap on a lender hands off to Arjun with a prefilled message; that
    // lender is then marked checked — tapping it again just shows a notice.
    if (state.lockedContacted.includes(offer.lender)) {
      setBlockedLender(offer.lender);
      return;
    }
    setBlockedLender(null);
    setSelectedLocked(offer);
  };
  const fixLockedOffer = (offer: LockedOffer) => { update({ lockedContacted: [...state.lockedContacted, offer.lender] }); setSelectedLocked(null); onChat(offer.reason, offer.lender); };
  const retryCheck = () => update({ bre: "ok", step: "checking" });

  const closeBrowser = () => { if (browserOffer) update({ applied: { ...state.applied, [browserOffer.id]: "open" } }); setBrowserOffer(null); requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollTop.current; }); };

  if (state.step === "checking") return <div className="flex flex-1 flex-col items-center justify-center bg-card px-8 text-center motion-safe:animate-[loan-page-slide_260ms_ease-out]"><Loader2 className="h-11 w-11 animate-spin text-primary" /><h2 className="font-display mt-5 text-xl font-bold text-foreground">Checking lender matches</h2><div className="mt-5 flex gap-2">{INTRO_LENDERS.slice(0, 4).map((lender) => <LenderLogo key={lender.name} name={lender.name} logo={lender.logo} size="sm" />)}</div></div>;

  if (state.step === "intro") return <div className="relative flex min-h-0 flex-1 flex-col bg-card"><AppHeader onBack={onBack} /><div className="flex min-h-0 flex-1 motion-safe:animate-[loan-page-slide_260ms_ease-out]"><IntroPage onStart={startQuestions} /></div></div>;

  if (state.step === "details" || state.step === "location") return <div className="relative flex min-h-0 flex-1 flex-col bg-card"><AppHeader onBack={() => { if (state.step === "location") { update({ step: "details" }); return; } update({ step: editingDetails ? "offers" : "intro" }); setEditingDetails(false); }} /><QuestionPage state={state} update={update} /></div>;

  if (showApplications) return <ApplicationsScreen applied={state.applied} onBack={() => setShowApplications(false)} />;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-card motion-safe:animate-[loan-page-slide_260ms_ease-out]">
      <AppHeader onBack={onBack} onEdit={() => { setEditingDetails(true); update({ step: "details" }); }} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
        {noBureau ? <>
          <header className="mb-5"><h2 className="font-display text-[22px] font-bold leading-7 text-foreground">You're new to credit.<span className="block text-lg font-medium text-muted-foreground">Here's how to get loan-ready.</span></h2></header>
          <CreditJourneyTracker />
          <div className="mb-6">{user.noCreditCardOffer ? <CreditCardEmptyState onChat={() => onChat("card")} /> : <CreditCardOffer onApply={() => setBrowserOffer(UNITY_CARD)} onKnowMore={() => onChat("card", "Roarbank UPI Credit Card")} />}</div>
          <header className="mb-3"><h3 className="font-display text-lg font-bold text-foreground">Loans you can unlock</h3></header>
          <section><div className="space-y-2">{visibleLocked.map((offer) => <LockedCard key={offer.id} offer={offer} contacted={state.lockedContacted.includes(offer.lender)} onClick={() => handleUnlockTap(offer)} />)}</div>{locked.length > 3 && <button onClick={() => setShowAllLocked(!showAllLocked)} className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-semibold text-foreground hover:text-foreground/80">{showAllLocked ? <>View less<ChevronUp className="h-4 w-4" /></> : <>View more · 30+ lenders<ChevronDown className="h-4 w-4" /></>}</button>}</section>
        </> : breFailed && !hasStale ? <div className="rounded-lg border border-border bg-card p-5 text-center shadow-sm">
          <h3 className="font-display text-lg font-bold text-foreground">We couldn’t check lenders just now</h3>
          <p className="mt-1 text-sm text-muted-foreground">Yeh network issue hai — aapki eligibility par koi asar nahi.</p>
          <Button onClick={retryCheck} className="mt-4 h-12 w-full rounded-lg bg-primary-deep text-base font-semibold text-primary-foreground hover:bg-primary-deep/90">Retry</Button>
        </div> : <>
          <header className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold text-foreground">Loan offers for you</h2><Button variant="outline" onClick={() => setShowApplications(true)} className="h-9 shrink-0 rounded-lg bg-card px-3 text-sm font-semibold shadow-none">Applications</Button></header>
          {hasStale && <div className="mb-3 rounded-lg border border-border bg-muted/40 p-3 shadow-sm"><p className="text-xs font-semibold text-foreground">We couldn’t check lenders just now — showing your results as of {state.lastCheckedAt}.</p><Button variant="link" onClick={retryCheck} className="h-auto px-0 text-xs">Retry</Button></div>}
          {available.length > 0 ? <section><div className="space-y-3">{visibleAvailable.map((offer, index) => <OfferCard key={offer.id} featured={index === 0} offer={offer} leadStatus={state.applied[offer.id]} notice={applyErrors[offer.id]} onApply={() => openApply(offer)} />)}</div>{available.length > 4 && <Button variant="outline" onClick={() => setShowAll(!showAll)} className="mt-2 h-12 w-full rounded-lg border-border bg-card text-sm font-semibold text-foreground shadow-none hover:bg-muted/50">{showAll ? <>View less<ChevronUp /></> : <>View more<ChevronDown /></>}</Button>}</section> : <div className="rounded-lg border border-border bg-card p-5 shadow-sm"><h3 className="font-display text-lg font-bold text-foreground">Nothing available right now</h3><p className="mt-1 text-sm text-muted-foreground">Your credit profile needs a little work. See what you can unlock below.</p><Button onClick={() => onChat("apply")} className="mt-4 h-[54px] w-full rounded-lg bg-primary-deep text-base font-semibold text-primary-foreground shadow-none hover:bg-primary-deep/90">Talk to Arjun</Button></div>}
          {locked.length > 0 && <section className="mt-6"><header className="mb-3"><h3 className="font-display text-lg font-bold text-foreground">Loans you can unlock</h3></header><div className="space-y-2">{visibleLocked.map((offer) => <LockedCard key={offer.id} offer={offer} contacted={state.lockedContacted.includes(offer.lender)} onClick={() => handleUnlockTap(offer)} />)}</div>{blockedLender && <p className="mt-2 rounded-lg border border-border bg-muted/60 p-3 text-xs text-foreground">We have checked with {blockedLender} — you are not eligible right now. Please try another loan or talk to Arjun.</p>}<button onClick={() => setShowAllLocked(!showAllLocked)} className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-semibold text-foreground hover:text-foreground/80">{showAllLocked ? <>View less<ChevronUp className="h-4 w-4" /></> : <>View more · 30+ lenders<ChevronDown className="h-4 w-4" /></>}</button></section>}
        </>}
      </div>
      {sheet === "amount" && <Sheet title="Loan amount" subtitle="Choose the amount you need" onClose={() => setSheet(null)}><div className="mt-5 grid grid-cols-3 gap-2">{[{ label: "₹25,000", value: "25000" }, { label: "₹50,000", value: "50000" }, { label: "₹1,00,000", value: "100000" }].map((option) => <Button key={option.label} variant={option.value === (state.loanAmount || "50000") ? "default" : "outline"} onClick={() => { update({ loanAmount: option.value }); setSheet(null); }} className={option.value === (state.loanAmount || "50000") ? "bg-primary-deep text-primary-foreground" : ""}>{option.label}</Button>)}</div></Sheet>}
      {browserOffer && <InAppBrowser offer={browserOffer} onClose={closeBrowser} />}
      {selectedLocked && <UnlockIssueSheet offer={selectedLocked} onClose={() => setSelectedLocked(null)} onFix={() => fixLockedOffer(selectedLocked)} />}
    </div>
  );
}

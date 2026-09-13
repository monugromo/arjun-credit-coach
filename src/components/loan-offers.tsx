import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Info, Loader2, LocateFixed, MessageCircle, X } from "lucide-react";
import type { DemoUser } from "@/lib/groscore-data";

const GREEN = "#075E54";
const GREEN_DARK = "#054C44";
const SOFT_GREEN = "#E8F5E9";

type Persona = "rejected" | "prime" | "thin" | "ntc" | "zero";
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
  initial: string;
  chance: 3 | 4 | 5;
  chanceLabel: "Fair" | "Good" | "High";
  amount: string;
  rate: string;
  options?: string[];
};

type LockedOffer = {
  id: string;
  lender: string;
  product: string;
  initial: string;
  distance: string;
  reason: "issues" | "time";
};

const AVAILABLE: Offer[] = [
  { id: "moneyview", lender: "Moneyview", product: "Personal Loan", initial: "M", chance: 5, chanceLabel: "High", amount: "₹40,000–₹60,000", rate: "14%+" },
  { id: "tez", lender: "Tez Credit", product: "Personal Loan", initial: "T", chance: 4, chanceLabel: "Good", amount: "₹30,000–₹50,000", rate: "16%+", options: ["Instant Personal Loan", "Flexi Personal Loan"] },
  { id: "ram", lender: "Ram Fincorp", product: "Personal Loan", initial: "R", chance: 4, chanceLabel: "Good", amount: "₹25,000–₹45,000", rate: "18%+" },
  { id: "kreditbee", lender: "KreditBee", product: "Personal Loan", initial: "K", chance: 3, chanceLabel: "Fair", amount: "₹20,000–₹35,000", rate: "19%+" },
  { id: "kissht", lender: "Kissht", product: "Consumer Loan", initial: "K", chance: 3, chanceLabel: "Fair", amount: "Amount check karein", rate: "20%+" },
  { id: "bharatpe", lender: "BharatPe", product: "Business Loan", initial: "B", chance: 3, chanceLabel: "Fair", amount: "₹35,000–₹55,000", rate: "18%+" },
  { id: "zype", lender: "Zype", product: "Personal Loan", initial: "Z", chance: 3, chanceLabel: "Fair", amount: "₹20,000–₹40,000", rate: "21%+" },
  { id: "lendingplate", lender: "Lendingplate", product: "Personal Loan", initial: "L", chance: 3, chanceLabel: "Fair", amount: "Amount check karein", rate: "22%+" },
  { id: "creditsea", lender: "Credit Sea", product: "Credit Line", initial: "C", chance: 3, chanceLabel: "Fair", amount: "₹15,000–₹30,000", rate: "24%+" },
];

const LOCKED_ISSUES: LockedOffer[] = [
  { id: "lock-moneyview", lender: "Moneyview", product: "Personal Loan", initial: "M", distance: "~30 points door", reason: "issues" },
  { id: "lock-prefr", lender: "Prefr", product: "Personal Loan", initial: "P", distance: "2 cheezein theek karni hain", reason: "issues" },
  { id: "lock-hdfc", lender: "HDFC", product: "Personal Loan", initial: "H", distance: "~45 points door", reason: "issues" },
  { id: "lock-kissht", lender: "Kissht", product: "Personal Loan", initial: "K", distance: "2 cheezein theek karni hain", reason: "issues" },
  { id: "lock-creditsea", lender: "Credit Sea", product: "Credit Line", initial: "C", distance: "~55 points door", reason: "issues" },
];

const LOCKED_TIME: LockedOffer[] = [
  { id: "time-prefr", lender: "Prefr", product: "Personal Loan", initial: "P", distance: "Lagbhag 4 mahine mein khulega", reason: "time" },
  { id: "time-tez", lender: "Tez Credit", product: "Personal Loan", initial: "T", distance: "Lagbhag 4 mahine mein khulega", reason: "time" },
  { id: "time-hdfc", lender: "HDFC", product: "Credit Card", initial: "H", distance: "Lagbhag 4 mahine mein khulega", reason: "time" },
  { id: "time-zype", lender: "Zype", product: "Personal Loan", initial: "Z", distance: "Lagbhag 4 mahine mein khulega", reason: "time" },
];

const NTC_LENDERS = ["mPokket", "Abhiloans", "Loan112", "ClickPE", "Jupiter Rupay Card"];
const LOGOS = ["M", "T", "R", "K", "B", "H"];

function ChoiceSheet({ title, options, value, onPick, onClose }: {
  title: string;
  options: Array<{ label: string; explainer?: string }>;
  value: string;
  onPick: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-end">
      <button aria-label="Close choices" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full rounded-t-2xl bg-white pb-7 shadow-2xl">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-300" />
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button aria-label="Close" onClick={onClose}><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="px-3 py-2">
          {options.map((option) => (
            <button key={option.label} onClick={() => onPick(option.label)} className="flex min-h-14 w-full items-center gap-3 rounded-lg px-3 text-left active:bg-gray-50">
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-gray-900">{option.label}</div>
                {option.explainer && <div className="mt-0.5 text-xs text-gray-500">{option.explainer}</div>}
              </div>
              {value === option.label && <Check className="h-5 w-5" style={{ color: GREEN }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end">
      <button aria-label="Close sheet" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full rounded-t-2xl bg-white p-5 pb-8 shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button aria-label="Close" onClick={onClose}><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StepHeader({ current, total, onBack }: { current: number; total: number; onBack: () => void }) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 px-3 text-white" style={{ background: GREEN }}>
      <button aria-label="Back" onClick={onBack}><ChevronLeft className="h-6 w-6" /></button>
      <h1 className="flex-1 text-[17px] font-semibold">Loan / CC</h1>
      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{current} of {total}</span>
    </div>
  );
}

function LenderLogo({ initial, muted = false }: { initial: string; muted?: boolean }) {
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-extrabold ${muted ? "opacity-55 grayscale" : ""}`} style={{ color: GREEN }}>
      {initial}
    </div>
  );
}

function ApprovalBars({ count, label }: { count: number; label: string }) {
  return (
    <div>
      <div className="flex gap-0.5" aria-label={`${label} approval chance`}>
        {[0, 1, 2, 3, 4].map((i) => <span key={i} className="h-2 w-3 rounded-[2px]" style={{ background: i < count ? GREEN : "#E5E7EB" }} />)}
      </div>
      <div className="mt-1 text-xs font-bold" style={{ color: GREEN }}>{label}</div>
    </div>
  );
}

function OfferCard({ offer, applied, onInfo, onApply, onUndo }: {
  offer: Offer;
  applied: boolean;
  onInfo: () => void;
  onApply: () => void;
  onUndo: () => void;
}) {
  const [details, setDetails] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 p-4">
        <LenderLogo initial={offer.initial} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold text-gray-900">{offer.lender} {offer.product}</div>
          {offer.options && (
            <button onClick={() => setOptionsOpen((v) => !v)} className="mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
              {offer.options.length} options <ChevronDown className={`ml-0.5 inline h-3 w-3 transition ${optionsOpen ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>
      {optionsOpen && offer.options && (
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
          {offer.options.map((option) => <div key={option} className="py-1 text-xs text-gray-600">• {option}</div>)}
        </div>
      )}
      <div className="grid grid-cols-[1fr_1.25fr_.65fr] gap-2 px-4 py-3">
        <div><div className="text-[10px] text-gray-500">Approval chance</div><ApprovalBars count={offer.chance} label={offer.chanceLabel} /></div>
        <div className="border-x border-gray-100 px-2 text-center"><div className="text-[10px] text-gray-500">Aapko mil sakta hai</div><div className="mt-1 text-[13px] font-extrabold text-gray-900">{offer.amount}</div></div>
        <div className="text-right"><div className="text-[10px] text-gray-500">Rate</div><div className="mt-1 text-[13px] font-extrabold text-gray-900">{offer.rate}</div></div>
      </div>
      {details && <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-600">Processing fee aur final rate lender verification ke baad dikhega.</div>}
      <div className="border-t border-gray-100 px-4 py-3">
        <button onClick={onInfo} className="mb-2 flex items-center gap-1 text-[11px] text-gray-500"><Info className="h-3.5 w-3.5" /> 1 enquiry add hoga</button>
        {applied ? (
          <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2.5 text-sm text-gray-600">
            <span className="font-semibold">Applied · 12 Sep</span>
            <button onClick={onUndo} className="text-xs underline">Apply nahi kiya? Undo</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDetails((v) => !v)} className="py-2.5 text-sm font-semibold text-gray-700">Offer Details <ChevronDown className={`inline h-4 w-4 ${details ? "rotate-180" : ""}`} /></button>
            <button onClick={onApply} className="rounded-lg py-2.5 text-sm font-bold text-white" style={{ background: GREEN_DARK }}>Apply Now</button>
          </div>
        )}
      </div>
    </article>
  );
}

function InAppBrowser({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-[70] flex flex-col bg-white">
      <div className="grid h-14 shrink-0 grid-cols-[72px_1fr_72px] items-center px-3 text-white" style={{ background: GREEN }}>
        <button onClick={onClose} className="text-left text-sm font-semibold">Close</button>
        <div className="truncate text-center text-[15px] font-bold">{offer.lender}</div>
        <LockMark />
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-5 pb-8 pt-10 text-center text-white" style={{ background: GREEN_DARK }}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white text-xl font-extrabold" style={{ color: GREEN }}>{offer.initial}</div>
          <h2 className="mt-4 text-2xl font-extrabold">{offer.product}</h2>
          <p className="mt-2 text-sm text-white/80">Simple application · Secure verification</p>
        </div>
        <div className="p-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">Your personalised offer</div>
            <div className="mt-1 text-2xl font-extrabold text-gray-900">{offer.amount}</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3"><div className="text-[11px] text-gray-500">Rate starts</div><div className="font-bold text-gray-900">{offer.rate}</div></div>
              <div className="rounded-lg bg-gray-50 p-3"><div className="text-[11px] text-gray-500">Approval chance</div><div className="font-bold" style={{ color: GREEN }}>{offer.chanceLabel}</div></div>
            </div>
            <div className="mt-5 space-y-3">
              {["PAN verified", "Mobile number verified", "Income details ready"].map((text) => <div key={text} className="flex items-center gap-2 text-sm text-gray-700"><Check className="h-4 w-4" style={{ color: GREEN }} />{text}</div>)}
            </div>
            <button className="mt-6 w-full rounded-lg py-3.5 font-bold text-white" style={{ background: GREEN_DARK }}>Continue application</button>
          </div>
          <p className="mt-4 text-center text-[11px] text-gray-500">Secure lender page shown inside GroScore</p>
        </div>
      </div>
    </div>
  );
}

function LockMark() {
  return <div className="text-right text-xs text-white/75">Secure</div>;
}

function PersonaToggle({ persona, onChange }: { persona: Persona; onChange: (p: Persona) => void }) {
  const personas: Persona[] = ["rejected", "prime", "thin", "ntc", "zero"];
  return (
    <div className="absolute right-16 top-2 z-30">
      <button aria-label="Change mock persona" onClick={() => onChange(personas[(personas.indexOf(persona) + 1) % personas.length])} className="rounded-md border border-white/30 bg-black/70 px-2 py-1 text-[10px] font-bold capitalize text-white">
        {persona === "thin" ? "Thin file" : persona}
      </button>
    </div>
  );
}

export function LoanOffersScreen({ user, state, setState, onChat }: {
  user: DemoUser;
  state: LoanJourneyState;
  setState: (next: LoanJourneyState | ((current: LoanJourneyState) => LoanJourneyState)) => void;
  onChat: (kind: "recommend" | "issues" | "time" | "ntc", lender?: string) => void;
}) {
  const [choice, setChoice] = useState<"work" | "salary" | null>(null);
  const [sheet, setSheet] = useState<"amount" | "info" | "apply" | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [browserOffer, setBrowserOffer] = useState<Offer | null>(null);
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTop = useRef(0);
  const firstVisit = user.loanJourney === "first";

  const totalSteps = state.persona === "ntc" ? (state.work === "Salaried" ? 5 : 4) : (state.work === "Salaried" ? 4 : 3);
  const stepNumber = useMemo(() => {
    const order: Step[] = state.work === "Salaried" ? ["work", "income", "salary", "pincode", ...(state.persona === "ntc" ? ["dob" as Step] : [])] : ["work", "income", "pincode", ...(state.persona === "ntc" ? ["dob" as Step] : [])];
    return Math.max(1, order.indexOf(state.step) + 1);
  }, [state.step, state.work, state.persona]);

  useEffect(() => {
    if (state.step !== "checking") return;
    const timer = setTimeout(() => setState((s) => ({ ...s, step: "offers" })), 2000);
    return () => clearTimeout(timer);
  }, [state.step, setState]);

  const update = (patch: Partial<LoanJourneyState>) => setState((s) => ({ ...s, ...patch }));
  const goBack = () => {
    if (state.step === "work") return update({ step: "intro" });
    if (state.step === "income") return update({ step: "work" });
    if (state.step === "salary") return update({ step: "income" });
    if (state.step === "pincode") return update({ step: state.work === "Salaried" ? "salary" : "income" });
    if (state.step === "dob") return update({ step: "pincode" });
  };
  const nextFromIncome = () => update({ step: state.work === "Salaried" ? "salary" : "pincode" });
  const completeQuestions = () => update({ step: state.persona === "ntc" ? "dob" : "checking" });
  const openApply = (offer: Offer) => { setSelectedOffer(offer); setSheet("apply"); };
  const confirmApply = () => {
    if (!selectedOffer) return;
    scrollTop.current = scrollRef.current?.scrollTop ?? 0;
    setSheet(null);
    setBrowserOffer(selectedOffer);
  };
  const closeBrowser = () => {
    if (browserOffer) update({ applied: Array.from(new Set([...state.applied, browserOffer.id])) });
    setBrowserOffer(null);
    requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollTop.current; });
  };

  const available = state.persona === "prime" ? AVAILABLE : state.persona === "thin" ? AVAILABLE.slice(0, 1) : state.persona === "zero" || state.persona === "ntc" ? [] : AVAILABLE.slice(0, 3);
  const locked = state.persona === "prime" || state.persona === "ntc" ? [] : state.persona === "thin" ? LOCKED_TIME : state.persona === "zero" ? [...LOCKED_ISSUES, { id: "lock-zype", lender: "Zype", product: "Personal Loan", initial: "Z", distance: "~60 points door", reason: "issues" as const }].slice(0, 5) : LOCKED_ISSUES;
  const visibleAvailable = showAll ? available.slice(0, 9) : available.slice(0, 3);

  if (state.step === "intro") {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col bg-gray-50">
        <div className="flex h-14 shrink-0 items-center px-4 text-white" style={{ background: GREEN }}><h1 className="text-[17px] font-semibold">Loan / CC</h1></div>
        <PersonaToggle persona={state.persona} onChange={(persona) => update({ persona })} />
        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-extrabold text-gray-900">Hum 55+ lenders check karte hain</h2>
            <div className="my-6 flex justify-between gap-2 overflow-hidden">
              {LOGOS.map((logo) => <LenderLogo key={logo} initial={logo} muted />)}
            </div>
            <p className="text-sm font-semibold text-gray-600">4 chhote sawal · 30 second</p>
            <button onClick={() => update({ step: "work" })} className="mt-6 w-full rounded-lg py-3.5 font-bold text-white" style={{ background: GREEN_DARK }}>Mere offers dikhao</button>
          </div>
        </div>
      </div>
    );
  }

  if (["work", "income", "salary", "pincode", "dob"].includes(state.step)) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col bg-white">
        <StepHeader current={stepNumber} total={totalSteps} onBack={goBack} />
        <div className="flex-1 overflow-y-auto p-5">
          {state.step === "work" && <>
            <h2 className="text-2xl font-extrabold text-gray-900">Aap kya karte hain?</h2>
            <button onClick={() => setChoice("work")} className="mt-8 flex w-full items-center justify-between border-b-2 py-3 text-left text-lg" style={{ borderColor: GREEN }}><span className={state.work ? "text-gray-900" : "text-gray-400"}>{state.work || "Choose one"}</span><ChevronDown className="h-5 w-5 text-gray-500" /></button>
          </>}
          {state.step === "income" && <IncomeStep value={state.income} onChange={(income) => update({ income })} />}
          {state.step === "salary" && <>
            <h2 className="text-2xl font-extrabold text-gray-900">Salary kaise aati hai?</h2>
            <button onClick={() => setChoice("salary")} className="mt-8 flex w-full items-center justify-between border-b-2 py-3 text-left text-lg" style={{ borderColor: GREEN }}><span className={state.salaryMode ? "text-gray-900" : "text-gray-400"}>{state.salaryMode || "Choose one"}</span><ChevronDown className="h-5 w-5 text-gray-500" /></button>
          </>}
          {state.step === "pincode" && <PincodeStep value={state.pincode} onChange={(pincode) => update({ pincode })} />}
          {state.step === "dob" && <>
            <h2 className="text-2xl font-extrabold text-gray-900">Date of birth</h2>
            <p className="mt-2 text-sm text-gray-500">Aapka credit record nahi mila, isliye ye chahiye.</p>
            <input type="date" value={state.dob} onChange={(e) => update({ dob: e.target.value })} className="mt-8 w-full border-b-2 bg-transparent py-3 text-lg outline-none" style={{ borderColor: GREEN }} />
          </>}
        </div>
        <div className="px-5 pb-8 pt-3">
          <button onClick={() => {
            if (state.step === "work") update({ step: "income" });
            else if (state.step === "income") nextFromIncome();
            else if (state.step === "salary") update({ step: "pincode" });
            else if (state.step === "pincode") completeQuestions();
            else update({ step: "checking" });
          }} disabled={(state.step === "work" && !state.work) || (state.step === "income" && !state.income) || (state.step === "salary" && !state.salaryMode) || (state.step === "pincode" && state.pincode.length !== 6) || (state.step === "dob" && !state.dob)} className="w-full rounded-lg py-3.5 font-bold text-white disabled:opacity-40" style={{ background: GREEN_DARK }}>Continue</button>
        </div>
        {choice === "work" && <ChoiceSheet title="Aap kya karte hain?" value={state.work} onClose={() => setChoice(null)} onPick={(value) => { update({ work: value as WorkType, salaryMode: value === "Salaried" ? state.salaryMode : "" }); setChoice(null); }} options={[{ label: "Salaried", explainer: "Har mahine fixed salary milti hai" }, { label: "Self-employed", explainer: "Business, dukaan ya freelance" }, { label: "Student" }]} />}
        {choice === "salary" && <ChoiceSheet title="Salary kaise aati hai?" value={state.salaryMode} onClose={() => setChoice(null)} onPick={(value) => { update({ salaryMode: value as SalaryMode }); setChoice(null); }} options={[{ label: "Bank transfer" }, { label: "Cash" }, { label: "Cheque" }]} />}
      </div>
    );
  }

  if (state.step === "checking") {
    return <div className="flex flex-1 flex-col items-center justify-center bg-white px-8 text-center"><Loader2 className="h-12 w-12 animate-spin" style={{ color: GREEN }} /><h2 className="mt-5 text-xl font-extrabold text-gray-900">55 lenders check kar rahe hain…</h2><div className="mt-5 flex gap-2">{LOGOS.slice(0, 4).map((logo, i) => <div key={logo} className="animate-pulse" style={{ animationDelay: `${i * 150}ms` }}><LenderLogo initial={logo} muted /></div>)}</div></div>;
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-gray-50">
      <div className="flex h-14 shrink-0 items-center px-4 text-white" style={{ background: GREEN }}><h1 className="text-[17px] font-semibold">Loan / CC</h1></div>
      <PersonaToggle persona={state.persona} onChange={(persona) => update({ persona, step: "offers" })} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pb-6 pt-4">
        {state.persona === "ntc" ? (
          <NTCOffers onChat={() => onChat("ntc")} />
        ) : (
          <>
            <div className="mb-5 flex items-start justify-between gap-3 px-1">
              <div><h2 className="text-xl font-extrabold text-gray-900">Aapke loan offers</h2><p className="mt-1 text-xs text-gray-500">₹1,50,000 ke liye · 12 Sep ko check kiya</p></div>
              <button onClick={() => setSheet("amount")} className="mt-1 shrink-0 text-xs font-bold" style={{ color: GREEN }}>Change amount</button>
            </div>
            {available.length > 0 ? <section>
              <h3 className="px-1 text-[17px] font-extrabold text-gray-900">Ab mil sakta hai</h3>
              <p className="mb-3 mt-1 px-1 text-xs text-gray-500">Sabse zyada chance wale upar hain.</p>
              <div className="space-y-3">{visibleAvailable.map((offer) => <OfferCard key={offer.id} offer={offer} applied={state.applied.includes(offer.id)} onInfo={() => setSheet("info")} onApply={() => openApply(offer)} onUndo={() => update({ applied: state.applied.filter((id) => id !== offer.id) })} />)}</div>
              {available.length > 3 && !showAll && <button onClick={() => setShowAll(true)} className="w-full py-4 text-center text-sm font-bold" style={{ color: GREEN }}>6 aur dikhao ↓</button>}
              <button onClick={() => onChat("recommend")} className="mt-3 flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 text-left shadow-sm"><MessageCircle className="h-5 w-5" style={{ color: GREEN }} /><span className="flex-1 text-sm font-bold text-gray-900">Kaunsa sabse sahi rahega? Arjun se poochho</span><ArrowRight className="h-4 w-4" style={{ color: GREEN }} /></button>
            </section> : <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-extrabold text-gray-900">Abhi koi lender match nahi ho raha — par reason pata hai.</h3><button onClick={() => onChat("issues", "Moneyview")} className="mt-5 w-full rounded-lg py-3 font-bold text-white" style={{ background: GREEN_DARK }}>Arjun se baat karein</button></div>}
            {locked.length > 0 && <section className="mt-7"><h3 className="px-1 text-[17px] font-extrabold text-gray-900">Abhi nahi mil raha</h3><div className="mt-3 space-y-2">{locked.slice(0, 5).map((offer) => <button key={offer.id} onClick={() => onChat(offer.reason, offer.lender)} className="flex w-full items-center gap-3 rounded-lg border border-gray-200 border-l-2 border-l-amber-300 bg-white/80 p-3 text-left"><LenderLogo initial={offer.initial} muted /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-gray-700">{offer.lender} {offer.product}</div><div className="mt-1 text-xs text-gray-500">{offer.distance}</div></div><ChevronRight className="h-4 w-4 text-gray-400" /></button>)}</div><p className="mt-3 px-1 text-xs text-gray-500">Ye lenders asli hain. Bas abhi match nahi ho raha.</p></section>}
          </>
        )}
      </div>
      {sheet === "amount" && <Sheet title="Amount badlein" onClose={() => setSheet(null)}><p className="mt-2 text-sm leading-relaxed text-gray-600">Amount badalne par hum lenders ko dobara check karenge. Nayi enquiry tabhi add hogi jab aap apply karenge.</p><button onClick={() => setSheet(null)} className="mt-5 w-full rounded-lg py-3 font-bold text-white" style={{ background: GREEN_DARK }}>Theek hai</button></Sheet>}
      {sheet === "info" && <Sheet title="Credit enquiry" onClose={() => setSheet(null)}><p className="mt-2 text-sm leading-relaxed text-gray-600">Har application aapke credit report par 1 enquiry add karti hai. Isliye hum ek baar mein ek hi bhejte hain.</p></Sheet>}
      {sheet === "apply" && selectedOffer && <Sheet title={`${selectedOffer.lender} par apply karein?`} onClose={() => setSheet(null)}><p className="mt-2 text-sm leading-relaxed text-gray-600">Isse aapke report par 1 enquiry add hogi. Aapka approval chance achha hai.</p><button onClick={confirmApply} className="mt-5 w-full rounded-lg py-3 font-bold text-white" style={{ background: GREEN_DARK }}>{selectedOffer.lender} par jayein</button><button onClick={() => setSheet(null)} className="mt-2 w-full py-3 text-sm font-semibold text-gray-600">Abhi nahi</button></Sheet>}
      {browserOffer && <InAppBrowser offer={browserOffer} onClose={closeBrowser} />}
      {!firstVisit && state.step === "offers" ? null : null}
    </div>
  );
}

function IncomeStep({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const add = (digit: string) => onChange((value + digit).replace(/^0+/, "").slice(0, 8));
  return <><h2 className="text-2xl font-extrabold text-gray-900">Mahine ki income?</h2><div className="mt-10 text-center text-[32px] font-extrabold text-gray-900">₹{Number(value || 0).toLocaleString("en-IN")}</div><div className="mx-auto mt-8 grid max-w-[280px] grid-cols-3 gap-3">{["1","2","3","4","5","6","7","8","9","00","0","⌫"].map((key) => <button key={key} onClick={() => key === "⌫" ? onChange(value.slice(0, -1)) : add(key)} className="h-14 rounded-lg bg-gray-50 text-xl font-bold text-gray-900 active:bg-gray-100">{key}</button>)}</div></>;
}

function PincodeStep({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");
  return <><h2 className="text-2xl font-extrabold text-gray-900">Aapka pincode?</h2><button onClick={() => onChange("110001")} className="mt-5 flex items-center gap-1.5 text-sm font-semibold" style={{ color: GREEN }}><LocateFixed className="h-4 w-4" /> Meri location use karein</button><button onClick={() => inputRef.current?.focus()} className="relative mt-8 block w-full"><input ref={inputRef} autoFocus inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))} className="absolute inset-0 opacity-0" /><span className="flex justify-between gap-2">{digits.map((d, i) => <span key={i} className="flex h-14 flex-1 items-center justify-center rounded-lg border-2 text-xl font-bold" style={{ borderColor: d.trim() ? GREEN : "#E5E7EB" }}>{d}</span>)}</span></button></>;
}

function NTCOffers({ onChat }: { onChat: () => void }) {
  return <div><div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-extrabold text-gray-900">Aapka credit record abhi nahi bana hai</h2><p className="mt-2 text-sm leading-relaxed text-gray-600">Koi baat nahi — matlab lenders aapko dekh nahi paa rahe. Ye bina record ke bhi kaam karte hain:</p></div><div className="mt-4 space-y-2">{NTC_LENDERS.map((lender) => <div key={lender} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"><LenderLogo initial={lender[0]} /><div className="flex-1 text-sm font-bold text-gray-900">{lender}</div><ChevronRight className="h-4 w-4 text-gray-400" /></div>)}</div><button onClick={onChat} className="mt-4 w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm"><div className="text-base font-extrabold text-gray-900">Apna score banana shuru karein</div><div className="mt-1 text-xs font-semibold" style={{ color: GREEN }}>Arjun se baat karein →</div></button></div>;
}

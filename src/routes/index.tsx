import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChevronLeft, ChevronRight, Check, CheckCheck, Loader2, Lock,
  Pencil, Phone, Search, Send, Shield, Sparkles, User, X,
} from "lucide-react";
import { DEMOS, maskPan, maskPhone, type DemoUser } from "@/lib/groscore-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GroScore — Your personal credit coach" },
      { name: "description", content: "Get loan-ready with Arjun, your personal credit coach." },
      { property: "og:title", content: "GroScore" },
      { property: "og:description", content: "Your personal credit coach." },
    ],
  }),
  component: Index,
});

const WA = {
  green: "#075E54",
  greenDark: "#054C44",
  accent: "#25D366",
  tick: "#34B7F1",
  bubbleOut: "#DCF8C6",
  chatBg: "#ECE5DD",
};

/* ============================================================
   Screen state machine — mirrors the mermaid diagram exactly
   ============================================================ */
type Screen =
  | "landing"        // 1  splash + score animation
  | "phone"          // 2  enter mobile
  | "otp"            // 3  verify OTP
  | "nameAuto"       // 5a name auto-populate
  | "nameManual"     // 5b name manual
  | "fetching"       // 6  fetching bureau
  | "validate"       // 7  validation
  | "panInput"       // 8  ask PAN
  | "hasCredit"      // 9  do you have loan/cc?
  | "askAgain"       // 10 ask PAN & name again
  | "ntc"            // NTC — no score
  | "analyzing"      // 11 analyzing report
  | "paywall9"       // 12 ₹9 value paywall
  | "paywall99"      // ₹99 restart paywall (lapsed)
  | "razorpay"       // 13 razorpay
  | "home";          // Arjun chat + score card

function Index() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState<DemoUser | null>(null);
  const [name, setName] = useState("");
  const [panInput, setPanInput] = useState("");
  const [paywallPrice, setPaywallPrice] = useState<9 | 99>(9);
  const [retryPan, setRetryPan] = useState(false);

  const go = (s: Screen) => setScreen(s);

  const reset = () => {
    setPhone(""); setUser(null); setName(""); setPanInput("");
    setPaywallPrice(9); setRetryPan(false); go("landing");
  };

  /* -------- Router after OTP (mermaid decision R) -------- */
  const routeAfterOtp = (u: DemoUser) => {
    setName(u.name);
    switch (u.key) {
      case "active":    return go("home");
      case "lapsed":    setPaywallPrice(99); return go("paywall99");
      case "unpaid":    setPaywallPrice(9); return go("paywall9");
      case "autofill":  return go("nameAuto");
      case "new":
      case "fetchFail":
      case "panMiss":
      default:          return go("nameManual");
    }
  };

  /* -------- Fetching outcome by demo user -------- */
  const routeAfterFetch = () => {
    if (!user) return;
    if (user.key === "autofill") return go("validate");     // clean hit
    return go("panInput");                                   // fetchFail / new / panMiss
  };

  /* -------- PAN outcome -------- */
  const routeAfterPan = () => {
    if (!user) return;
    // fetchFail: PAN entry finds them
    if (user.key === "fetchFail") {
      // fabricate details on the fly
      setUser({ ...user, name: name || "Amit", pan: panInput.toUpperCase(), dob: "18 / 11 / 1992", score: 668, band: "Good" });
      return go("validate");
    }
    // panMiss on first try: not found → ask has-credit
    if (user.key === "panMiss" && !retryPan) return go("hasCredit");
    // panMiss on second try (after askAgain): still not found → NTC
    if (user.key === "panMiss" && retryPan) return go("ntc");
    // new: not found → has-credit
    return go("hasCredit");
  };

  return (
    <div className="h-[100dvh] w-full bg-neutral-100 flex items-center justify-center overflow-hidden">
      <div className="relative h-full w-full sm:h-[812px] sm:w-[390px] sm:rounded-[36px] sm:overflow-hidden sm:shadow-2xl bg-white">
        {screen === "landing"    && <Landing onStart={() => go("phone")} />}
        {screen === "phone"      && <PhoneScreen phone={phone} setPhone={setPhone} onBack={reset}
            onNext={() => {
              const u = DEMOS[phone];
              if (!u) { alert("Try any of:\n9876500001 New\n9876500002 Active\n9876500003 Lapsed\n9876500004 Unpaid\n9876500005 Autofill\n9876500006 Fetch-fail\n9876500007 PAN-miss"); return; }
              setUser(u); go("otp");
            }} />}
        {screen === "otp"        && user && <OtpScreen phone={phone} onBack={() => go("phone")}
            onVerified={() => routeAfterOtp(user)} />}

        {screen === "nameAuto"   && user && <NameAutoScreen name={name} setName={setName}
            onBack={() => go("otp")} onNext={() => go("fetching")} />}
        {screen === "nameManual" && user && <NameManualScreen name={name} setName={setName}
            onBack={() => go("otp")} onNext={() => go("fetching")} />}

        {screen === "fetching"   && <FetchingScreen onDone={routeAfterFetch} />}

        {screen === "validate"   && user && <ValidateScreen user={user} name={name}
            onYes={() => go("analyzing")} onNotMe={() => { setRetryPan(false); setPanInput(""); go("panInput"); }} />}

        {screen === "panInput"   && <PanInputScreen pan={panInput} setPan={setPanInput}
            onBack={() => go(user?.key === "autofill" ? "validate" : "nameManual")}
            onNext={routeAfterPan} />}

        {screen === "hasCredit"  && <HasCreditScreen
            onYes={() => { setRetryPan(true); setPanInput(""); go("askAgain"); }}
            onNo={() => go("ntc")} />}

        {screen === "askAgain"   && <AskAgainScreen name={name} setName={setName} pan={panInput} setPan={setPanInput}
            onBack={() => go("hasCredit")} onNext={routeAfterPan} />}

        {screen === "ntc"        && <NtcScreen name={name || user?.name || "there"} onNext={() => go("analyzing")} />}

        {screen === "analyzing"  && <AnalyzingScreen onDone={() => { setPaywallPrice(9); go("paywall9"); }} />}

        {screen === "paywall9"   && <Paywall9 onPay={() => go("razorpay")} onBack={() => go("home")} />}
        {screen === "paywall99"  && <Paywall99 onPay={() => go("razorpay")} onBack={reset} />}

        {screen === "razorpay"   && <RazorpayScreen price={paywallPrice}
            onSuccess={() => go("home")}
            onFail={() => go(paywallPrice === 99 ? "paywall99" : "paywall9")}
            onBack={() => go(paywallPrice === 99 ? "paywall99" : "paywall9")} />}

        {screen === "home"       && user && <HomeChat user={user} onLogout={reset} />}
      </div>
    </div>
  );
}

/* ============================================================
   1 · Landing
   ============================================================ */
function Landing({ onStart }: { onStart: () => void }) {
  const [score, setScore] = useState(300);
  useEffect(() => {
    let raf: number; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1800, 1);
      setScore(Math.round(300 + (720 - 300) * easeOut(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="h-full w-full flex flex-col" style={{ background: `linear-gradient(160deg, ${WA.green}, ${WA.greenDark})` }}>
      <div className="flex-1 flex flex-col items-center justify-center text-white px-6">
        <div className="flex items-center gap-2 mb-8 opacity-90">
          <Sparkles size={18} />
          <span className="text-sm tracking-wide">GroScore</span>
        </div>
        <ScoreDial value={score} />
        <h1 className="mt-8 text-2xl font-semibold">Know your credit score</h1>
        <p className="mt-2 text-sm text-white/70 text-center max-w-[260px]">
          Free check. Won't affect your score.
        </p>
      </div>
      <div className="p-6 pb-10">
        <button onClick={onStart}
          className="w-full h-12 rounded-full font-medium text-white flex items-center justify-center gap-2"
          style={{ background: WA.accent }}>
          Start now <ChevronRight size={18} />
        </button>
        <p className="text-[11px] text-white/60 text-center mt-3">
          Secure · RBI-registered bureau · No spam
        </p>
      </div>
    </div>
  );
}
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function ScoreDial({ value }: { value: number }) {
  const pct = (value - 300) / (900 - 300);
  const dash = 440 * pct;
  return (
    <div className="relative w-[220px] h-[220px]">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r="70" stroke="rgba(255,255,255,0.15)" strokeWidth="12" fill="none" />
        <circle cx="100" cy="100" r="70" stroke={WA.accent} strokeWidth="12" fill="none"
          strokeLinecap="round" strokeDasharray="440" strokeDashoffset={440 - dash} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold text-white tabular-nums">{value}</div>
        <div className="text-xs text-white/60 mt-1">of 900</div>
      </div>
    </div>
  );
}

/* ============================================================
   Shared chrome
   ============================================================ */
function WAHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="h-14 flex items-center px-2 gap-2 text-white shrink-0" style={{ background: WA.green }}>
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-1"><ChevronLeft size={22} /></button>
      )}
      <div className="text-[17px] font-medium">{title}</div>
    </div>
  );
}
function Bubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
        style={{ background: WA.green }}>G</div>
      <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-md px-3.5 py-2.5 shadow-sm text-[14px] leading-snug">
        {children}
      </div>
    </div>
  );
}
function PrimaryBtn({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick?: () => void }) {
  return (
    <button disabled={disabled} onClick={onClick}
      className="w-full h-12 rounded-full font-medium text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-[0.98]"
      style={{ background: WA.accent }}>
      {children}
    </button>
  );
}

/* ============================================================
   2 · Phone
   ============================================================ */
function PhoneScreen({ phone, setPhone, onBack, onNext }:
  { phone: string; setPhone: (v: string) => void; onBack: () => void; onNext: () => void }) {
  const valid = /^\d{10}$/.test(phone);
  return (
    <div className="h-full flex flex-col bg-[#F7F8FA]">
      <WAHeader title="Verify your number" onBack={onBack} />
      <div className="flex-1 px-5 pt-6 space-y-4">
        <Bubble>Enter your mobile number to continue</Bubble>
        <div className="pt-4">
          <label className="text-[11px] uppercase tracking-wider text-neutral-500">Mobile number</label>
          <div className="mt-2 flex items-center gap-2 border-b-2 pb-2" style={{ borderColor: WA.green }}>
            <span className="text-lg font-medium">+91</span>
            <input
              autoFocus type="tel" inputMode="numeric" maxLength={10}
              value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="flex-1 bg-transparent outline-none text-lg tracking-wider"
              placeholder="98765 43210"
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-3 flex items-center gap-1.5">
            <Shield size={12} /> We'll send a 4-digit OTP. Won't affect your score.
          </p>
        </div>
      </div>
      <div className="p-5 pb-8">
        <PrimaryBtn disabled={!valid} onClick={onNext}>Continue <ChevronRight size={18} /></PrimaryBtn>
      </div>
    </div>
  );
}

/* ============================================================
   3 · OTP
   ============================================================ */
function OtpScreen({ phone, onBack, onVerified }:
  { phone: string; onBack: () => void; onVerified: () => void }) {
  const [otp, setOtp] = useState("");
  useEffect(() => {
    const t1 = setTimeout(() => setOtp("1"), 500);
    const t2 = setTimeout(() => setOtp("12"), 800);
    const t3 = setTimeout(() => setOtp("123"), 1100);
    const t4 = setTimeout(() => setOtp("1234"), 1400);
    const t5 = setTimeout(onVerified, 2000);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onVerified]);
  return (
    <div className="h-full flex flex-col bg-[#F7F8FA]">
      <WAHeader title="Verifying" onBack={onBack} />
      <div className="flex-1 px-5 pt-6 space-y-4">
        <Bubble>Auto-detecting OTP sent to <b>+91 {phone.slice(0,5)} {phone.slice(5)}</b></Bubble>
        <div className="pt-8 flex gap-3 justify-center">
          {[0,1,2,3].map((i) => (
            <div key={i}
              className="w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-semibold transition-all"
              style={{ borderColor: otp[i] ? WA.green : "#e5e7eb", background: otp[i] ? "#fff" : "transparent" }}>
              {otp[i] || ""}
            </div>
          ))}
        </div>
        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <Loader2 size={12} className="animate-spin" /> Reading SMS…
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   5a · Name auto-populate  /  5b · Name manual
   ============================================================ */
function NameAutoScreen({ name, setName, onBack, onNext }:
  { name: string; setName: (v: string) => void; onBack: () => void; onNext: () => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="h-full flex flex-col bg-[#F7F8FA]">
      <WAHeader title="Confirm your name" onBack={onBack} />
      <div className="flex-1 px-5 pt-6 space-y-4">
        <Bubble>We found your name on record. Is this correct?</Bubble>
        <div className="pt-6 bg-white rounded-2xl p-5 shadow-sm border border-neutral-100">
          <div className="text-[11px] uppercase tracking-wider text-neutral-500">Full name (as on PAN)</div>
          {editing ? (
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 text-xl font-semibold bg-transparent outline-none border-b pb-1" style={{ borderColor: WA.green }}/>
          ) : (
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xl font-semibold">{name}</div>
              <button onClick={() => setEditing(true)} className="p-2 text-neutral-500"><Pencil size={16}/></button>
            </div>
          )}
        </div>
        <p className="text-[11px] text-neutral-500 pl-2 flex items-center gap-1.5">
          <Lock size={11}/> Encrypted. Used to fetch your bureau report.
        </p>
      </div>
      <div className="p-5 pb-8">
        <PrimaryBtn disabled={!name.trim()} onClick={onNext}>Fetch my report <ChevronRight size={18} /></PrimaryBtn>
      </div>
    </div>
  );
}
function NameManualScreen({ name, setName, onBack, onNext }:
  { name: string; setName: (v: string) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div className="h-full flex flex-col bg-[#F7F8FA]">
      <WAHeader title="Your name" onBack={onBack} />
      <div className="flex-1 px-5 pt-6 space-y-4">
        <Bubble>What's your full name — exactly as on your PAN?</Bubble>
        <div className="pt-6">
          <label className="text-[11px] uppercase tracking-wider text-neutral-500">Full name</label>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Rahul Sharma"
            className="w-full mt-2 text-xl font-semibold bg-transparent outline-none border-b-2 pb-2"
            style={{ borderColor: WA.green }}/>
          <p className="text-[11px] text-neutral-500 mt-3 flex items-center gap-1.5">
            <Lock size={11}/> Encrypted · used only for bureau lookup
          </p>
        </div>
      </div>
      <div className="p-5 pb-8">
        <PrimaryBtn disabled={!name.trim() || name.trim().length < 3} onClick={onNext}>
          Continue <ChevronRight size={18} />
        </PrimaryBtn>
      </div>
    </div>
  );
}

/* ============================================================
   6 · Fetching
   ============================================================ */
function FetchingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${WA.accent}1A` }}>
        <Search size={32} style={{ color: WA.green }} className="animate-pulse" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">Fetching your credit report</h2>
      <p className="mt-2 text-sm text-neutral-500">Connecting securely to Equifax…</p>
      <div className="mt-8 w-40 h-1 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full animate-[grow_2.4s_ease-in-out_forwards]" style={{ background: WA.accent }} />
      </div>
      <style>{`@keyframes grow{0%{width:0}100%{width:100%}}`}</style>
    </div>
  );
}

/* ============================================================
   7 · Validation
   ============================================================ */
function ValidateScreen({ user, name, onYes, onNotMe }:
  { user: DemoUser; name: string; onYes: () => void; onNotMe: () => void }) {
  return (
    <div className="h-full flex flex-col bg-[#F7F8FA]">
      <WAHeader title="Is this you?" />
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4 space-y-4">
        <Bubble>We found a match. Confirm it's you 👇</Bubble>
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="p-5 flex items-center gap-4 border-b border-neutral-100">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold" style={{ background: WA.green }}>
              {(name || user.name).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-semibold truncate">{name || user.name}</div>
              <div className="text-xs text-neutral-500">Verified from Equifax</div>
            </div>
          </div>
          <Row label="Mobile" value={maskPhone(user.phone)} />
          <Row label="PAN" value={maskPan(user.pan)} />
          <Row label="Date of birth" value={user.dob} last />
        </div>
        <p className="text-[11px] text-neutral-500 pl-2 flex items-center gap-1.5">
          <Lock size={11}/> Details masked for your safety
        </p>
      </div>
      <div className="p-5 pb-6 space-y-2.5 bg-[#F7F8FA]">
        <PrimaryBtn onClick={onYes}><Check size={18}/> Yes, that's me</PrimaryBtn>
        <button onClick={onNotMe} className="w-full h-11 rounded-full text-sm font-medium text-neutral-600">
          Not me — enter PAN manually
        </button>
      </div>
    </div>
  );
}
function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`px-5 py-3.5 flex items-center justify-between ${last ? "" : "border-b border-neutral-100"}`}>
      <div className="text-[13px] text-neutral-500">{label}</div>
      <div className="text-[14px] font-medium tabular-nums">{value}</div>
    </div>
  );
}

/* ============================================================
   8 · PAN input
   ============================================================ */
function PanInputScreen({ pan, setPan, onBack, onNext }:
  { pan: string; setPan: (v: string) => void; onBack: () => void; onNext: () => void }) {
  const [checking, setChecking] = useState(false);
  const valid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
  const submit = () => { setChecking(true); setTimeout(() => { setChecking(false); onNext(); }, 1400); };
  return (
    <div className="h-full flex flex-col bg-[#F7F8FA]">
      <WAHeader title="Enter your PAN" onBack={onBack} />
      <div className="flex-1 px-5 pt-6 space-y-4">
        <Bubble>Type your PAN — 10 characters (5 letters, 4 digits, 1 letter)</Bubble>
        <div className="pt-6">
          <label className="text-[11px] uppercase tracking-wider text-neutral-500">PAN number</label>
          <input autoFocus value={pan.toUpperCase()} onChange={(e) => setPan(e.target.value.toUpperCase().slice(0,10))}
            placeholder="ABCDE1234F"
            className="w-full mt-2 text-2xl font-mono tracking-[0.2em] bg-transparent outline-none border-b-2 pb-2 uppercase"
            style={{ borderColor: WA.green }}/>
          <p className="text-[11px] text-neutral-500 mt-3 flex items-center gap-1.5">
            <Lock size={11}/> Only used to look up your bureau record
          </p>
        </div>
      </div>
      <div className="p-5 pb-8">
        <PrimaryBtn disabled={!valid || checking} onClick={submit}>
          {checking ? <><Loader2 size={16} className="animate-spin"/> Looking up…</> : <>Continue <ChevronRight size={18}/></>}
        </PrimaryBtn>
      </div>
    </div>
  );
}

/* ============================================================
   9 · Has credit?
   ============================================================ */
function HasCreditScreen({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="h-full flex flex-col bg-[#F7F8FA]">
      <WAHeader title="Quick question" />
      <div className="flex-1 px-5 pt-6 space-y-4">
        <Bubble>Do you have any active loan or credit card?</Bubble>
        <div className="pt-4 space-y-3">
          <OptionCard title="Yes, I do" desc="Loan, credit card, EMI, BNPL" onClick={onYes} />
          <OptionCard title="No, not yet" desc="I'm new to credit" onClick={onNo} />
        </div>
      </div>
    </div>
  );
}
function OptionCard({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex items-center justify-between text-left hover:border-neutral-300 active:scale-[0.99] transition-all">
      <div>
        <div className="font-semibold text-[15px]">{title}</div>
        <div className="text-xs text-neutral-500 mt-0.5">{desc}</div>
      </div>
      <ChevronRight size={20} className="text-neutral-400"/>
    </button>
  );
}

/* ============================================================
   10 · Ask PAN & name again
   ============================================================ */
function AskAgainScreen({ name, setName, pan, setPan, onBack, onNext }:
  { name: string; setName: (v: string) => void; pan: string; setPan: (v: string) => void;
    onBack: () => void; onNext: () => void }) {
  const [checking, setChecking] = useState(false);
  const valid = name.trim().length >= 3 && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
  const submit = () => { setChecking(true); setTimeout(() => { setChecking(false); onNext(); }, 1400); };
  return (
    <div className="h-full flex flex-col bg-[#F7F8FA]">
      <WAHeader title="Let's try again" onBack={onBack} />
      <div className="flex-1 px-5 pt-6 space-y-4">
        <Bubble>Double-check your name & PAN — bureaus are strict about the spelling.</Bubble>
        <div className="pt-4 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-neutral-500">Full name (as on PAN)</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 text-lg font-semibold bg-transparent outline-none border-b-2 pb-2"
              style={{ borderColor: WA.green }}/>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-neutral-500">PAN number</label>
            <input value={pan.toUpperCase()} onChange={(e) => setPan(e.target.value.toUpperCase().slice(0,10))}
              placeholder="ABCDE1234F"
              className="w-full mt-2 text-xl font-mono tracking-[0.2em] bg-transparent outline-none border-b-2 pb-2 uppercase"
              style={{ borderColor: WA.green }}/>
          </div>
        </div>
      </div>
      <div className="p-5 pb-8">
        <PrimaryBtn disabled={!valid || checking} onClick={submit}>
          {checking ? <><Loader2 size={16} className="animate-spin"/> Re-checking…</> : <>Re-fetch <ChevronRight size={18}/></>}
        </PrimaryBtn>
      </div>
    </div>
  );
}

/* ============================================================
   NTC · No score found
   ============================================================ */
function NtcScreen({ name, onNext }: { name: string; onNext: () => void }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <WAHeader title="You're new to credit" />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl" style={{ background: `${WA.accent}1A` }}>🌱</div>
        <h2 className="mt-6 text-2xl font-semibold">No score yet — that's OK, {name}</h2>
        <p className="mt-3 text-sm text-neutral-500 max-w-[280px]">
          You don't have credit history yet. Arjun will help you build one from scratch.
        </p>
      </div>
      <div className="p-5 pb-8">
        <PrimaryBtn onClick={onNext}>Build my score <ChevronRight size={18}/></PrimaryBtn>
      </div>
    </div>
  );
}

/* ============================================================
   11 · Analyzing
   ============================================================ */
function AnalyzingScreen({ onDone }: { onDone: () => void }) {
  const steps = ["Fetching report", "Detecting issues", "Building your plan", "Arjun getting ready"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length) { const t = setTimeout(onDone, 500); return () => clearTimeout(t); }
    const t = setTimeout(() => setI(i + 1), 900);
    return () => clearTimeout(t);
  }, [i, onDone]);
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 flex flex-col justify-center px-8">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 rounded-full items-center justify-center" style={{ background: `${WA.accent}1A` }}>
            <Sparkles size={28} style={{ color: WA.green }} />
          </div>
          <h2 className="mt-5 text-xl font-semibold">Analyzing your report</h2>
          <p className="mt-1 text-sm text-neutral-500">Just a moment…</p>
        </div>
        <div className="space-y-4">
          {steps.map((s, idx) => (
            <div key={s} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: idx < i ? WA.accent : idx === i ? `${WA.accent}33` : "#f1f5f9" }}>
                {idx < i ? <Check size={14} className="text-white"/> :
                 idx === i ? <Loader2 size={12} className="animate-spin" style={{ color: WA.green }}/> :
                 <div className="w-2 h-2 rounded-full bg-neutral-300"/>}
              </div>
              <div className={`text-[15px] ${idx < i ? "text-neutral-400 line-through" : idx === i ? "font-medium" : "text-neutral-500"}`}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   12 · Paywall ₹9
   ============================================================ */
function Paywall9({ onPay, onBack }: { onPay: () => void; onBack: () => void }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <WAHeader title="Unlock your plan" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4 space-y-4">
        <div className="text-center py-4">
          <div className="text-xs uppercase tracking-widest text-neutral-500">Your report is ready</div>
          <div className="mt-2 text-5xl font-bold" style={{ color: WA.green }}>+147 pts</div>
          <div className="text-sm text-neutral-500 mt-1">projected in 90 days</div>
        </div>
        <div className="bg-[#F7F8FA] rounded-2xl p-5 space-y-3">
          <ValueRow icon="✅" title="Full credit report" desc="From Equifax · always fresh" />
          <ValueRow icon="🎯" title="Top 3 personalised tasks" desc="Fix disputes, EMIs, utilisation" />
          <ValueRow icon="💬" title="Arjun — your coach" desc="Chat + call anytime, in your language" />
        </div>
        <div className="border-2 border-dashed rounded-2xl p-4 text-center" style={{ borderColor: WA.accent }}>
          <div className="text-[11px] uppercase tracking-widest" style={{ color: WA.greenDark }}>Auto-renew every month</div>
          <div className="mt-1 text-3xl font-bold">₹9<span className="text-sm font-normal text-neutral-500">/month</span></div>
          <div className="text-[11px] text-neutral-500 mt-1">Cancel anytime · UPI mandate</div>
        </div>
      </div>
      <div className="p-5 pb-8">
        <PrimaryBtn onClick={onPay}>Pay ₹9 & unlock <ChevronRight size={18}/></PrimaryBtn>
        <p className="text-[10px] text-neutral-400 text-center mt-3">By continuing you agree to Terms & Autopay mandate</p>
      </div>
    </div>
  );
}
function Paywall99({ onPay, onBack }: { onPay: () => void; onBack: () => void }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <WAHeader title="Welcome back" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4 space-y-4">
        <div className="text-center py-2">
          <div className="text-xs uppercase tracking-widest text-neutral-500">Your subscription lapsed</div>
          <h2 className="mt-2 text-2xl font-semibold">Restart in one tap</h2>
          <p className="text-sm text-neutral-500 mt-2 max-w-[280px] mx-auto">
            Pick up where you left off — Arjun still has your plan.
          </p>
        </div>
        <div className="bg-[#F7F8FA] rounded-2xl p-5 space-y-3">
          <ValueRow icon="🔄" title="Reactivate immediately" desc="All tasks & progress restored" />
          <ValueRow icon="📈" title="Refreshed report" desc="Latest score from Equifax" />
          <ValueRow icon="💬" title="Arjun back on your side" desc="Full chat + call access" />
        </div>
        <div className="border-2 border-dashed rounded-2xl p-4 text-center" style={{ borderColor: WA.accent }}>
          <div className="text-[11px] uppercase tracking-widest" style={{ color: WA.greenDark }}>Restart subscription</div>
          <div className="mt-1 text-3xl font-bold">₹99<span className="text-sm font-normal text-neutral-500">/quarter</span></div>
          <div className="text-[11px] text-neutral-500 mt-1">Auto-renew · Cancel anytime</div>
        </div>
      </div>
      <div className="p-5 pb-8">
        <PrimaryBtn onClick={onPay}>Restart for ₹99 <ChevronRight size={18}/></PrimaryBtn>
      </div>
    </div>
  );
}
function ValueRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-lg leading-none pt-0.5">{icon}</div>
      <div>
        <div className="text-[14px] font-medium">{title}</div>
        <div className="text-xs text-neutral-500">{desc}</div>
      </div>
    </div>
  );
}

/* ============================================================
   13 · Razorpay
   ============================================================ */
function RazorpayScreen({ price, onSuccess, onFail, onBack }:
  { price: 9 | 99; onSuccess: () => void; onFail: () => void; onBack: () => void }) {
  const [state, setState] = useState<"picking" | "processing" | "success">("picking");
  const pay = () => { setState("processing"); setTimeout(() => setState("success"), 1600); setTimeout(onSuccess, 3000); };
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-14 flex items-center px-3 gap-2 shrink-0 border-b bg-[#3395FF] text-white">
        <button onClick={onBack} className="p-2 -ml-1"><ChevronLeft size={22}/></button>
        <div className="font-semibold">Razorpay</div>
        <div className="ml-auto text-sm">₹{price}.00</div>
      </div>
      {state === "picking" && (
        <div className="flex-1 flex flex-col">
          <div className="p-5 border-b">
            <div className="text-xs text-neutral-500">Paying to</div>
            <div className="font-semibold">GroScore Technologies</div>
            <div className="text-xs text-neutral-500 mt-1">₹{price}.00 · Autopay mandate</div>
          </div>
          <div className="p-5 space-y-2 flex-1">
            <div className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Recommended</div>
            <PayMethod name="UPI" desc="Pay via any UPI app" onClick={pay} highlight />
            <PayMethod name="Cards" desc="Credit / Debit" onClick={pay} />
            <PayMethod name="Net Banking" desc="All major banks" onClick={pay} />
            <PayMethod name="Wallets" desc="Paytm, PhonePe & more" onClick={pay} />
          </div>
        </div>
      )}
      {state === "processing" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <Loader2 size={40} className="animate-spin text-[#3395FF]"/>
          <div className="mt-5 font-medium">Processing payment…</div>
          <div className="text-xs text-neutral-500 mt-1">Do not close or press back</div>
        </div>
      )}
      {state === "success" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: WA.accent }}>
            <Check size={40} className="text-white" strokeWidth={3}/>
          </div>
          <div className="mt-5 text-lg font-semibold">Payment successful</div>
          <div className="text-sm text-neutral-500 mt-1">₹{price}.00 paid to GroScore</div>
        </div>
      )}
    </div>
  );
}
function PayMethod({ name, desc, onClick, highlight }:
  { name: string; desc: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button onClick={onClick}
      className="w-full p-3.5 rounded-xl border flex items-center justify-between text-left hover:border-[#3395FF] active:scale-[0.99] transition-all"
      style={{ borderColor: highlight ? "#3395FF" : "#e5e7eb", background: highlight ? "#F0F7FF" : "#fff" }}>
      <div>
        <div className="font-medium text-[14px]">{name}</div>
        <div className="text-xs text-neutral-500">{desc}</div>
      </div>
      <ChevronRight size={18} className="text-neutral-400"/>
    </button>
  );
}

/* ============================================================
   Home · Arjun chat + score summary card
   ============================================================ */
function HomeChat({ user, onLogout }: { user: DemoUser; onLogout: () => void }) {
  const [msgs, setMsgs] = useState<{ id: string; from: "coach" | "user"; text: string; time: string }[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const time = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  useEffect(() => {
    const script = user.score
      ? [
          `Welcome ${user.name} 👋 I'm Arjun, your credit coach.`,
          `Your score is ${user.score} (${user.band}). I've got a plan ready for you.`,
          `Type "start" whenever you're ready 💚`,
        ]
      : [
          `Hey ${user.name || "there"} 👋 I'm Arjun.`,
          `No credit history yet — we'll fix that together. Step 1: a secured card.`,
          `Type "start" whenever you're ready 💚`,
        ];
    let i = 0;
    const tick = () => {
      if (i >= script.length) return;
      setMsgs((m) => [...m, { id: `c${i}${Date.now()}`, from: "coach", text: script[i], time: time() }]);
      i++; if (i < script.length) setTimeout(tick, 900);
    };
    setTimeout(tick, 400);
  }, [user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs((m) => [...m, { id: `u${Date.now()}`, from: "user", text: input, time: time() }]);
    setInput("");
    setTimeout(() => {
      setMsgs((m) => [...m, { id: `c${Date.now()}`, from: "coach", text: "Got it — let me pull that up for you 💚", time: time() }]);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: WA.chatBg }}>
      {/* header */}
      <div className="h-14 flex items-center px-3 gap-3 text-white shrink-0" style={{ background: WA.green }}>
        <button onClick={onLogout} className="p-1"><ChevronLeft size={22}/></button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold bg-white/20">A</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium leading-tight">Arjun</div>
          <div className="text-[11px] opacity-80">Your credit coach · online</div>
        </div>
        <Phone size={18}/>
      </div>

      {/* score summary card pinned */}
      {user.score && (
        <div className="mx-3 mt-3 rounded-2xl p-4 text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${WA.green}, ${WA.greenDark})` }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider opacity-70">Credit score</div>
              <div className="text-4xl font-bold mt-1 tabular-nums">{user.score}</div>
              <div className="text-xs opacity-80 mt-0.5">{user.band}</div>
            </div>
            <div className="text-right text-xs opacity-80">
              <div>Updated today</div>
              <div className="mt-1">Equifax</div>
            </div>
          </div>
        </div>
      )}

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[78%] rounded-2xl px-3 py-2 text-[14px] shadow-sm"
              style={{ background: m.from === "user" ? WA.bubbleOut : "#fff",
                       borderTopRightRadius: m.from === "user" ? 4 : undefined,
                       borderTopLeftRadius: m.from === "coach" ? 4 : undefined }}>
              {m.text}
              <div className="text-[10px] text-neutral-500 text-right mt-1 flex items-center gap-1 justify-end">
                {m.time} {m.from === "user" && <CheckCheck size={12} style={{ color: WA.tick }}/>}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef}/>
      </div>

      {/* composer */}
      <div className="p-2 flex items-center gap-2 shrink-0" style={{ background: WA.chatBg }}>
        <div className="flex-1 bg-white rounded-full px-4 py-2.5 flex items-center gap-2 shadow-sm">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Message" className="flex-1 bg-transparent outline-none text-[15px]"/>
        </div>
        <button onClick={send} className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ background: WA.accent }}>
          <Send size={18}/>
        </button>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ChevronLeft, Check, Lock, ShieldCheck, Sparkles, TrendingUp,
  AlertTriangle, Loader2, X, Phone as PhoneIcon, Zap, BellRing,
  FileText, Bot, Sprout,
} from "lucide-react";
import { DEMOS, distressedTasks, maskPan, type DemoUser } from "@/lib/groscore-data";

/* =====================================================================
   DESIGN TOKENS — "Fintech Trust"
   Navy + electric blue, generous whitespace, geometric.
   ===================================================================== */
export const T = {
  navy:    "#0B1B3B",  // headers / primary dark
  blue:    "#1F5AF6",  // primary action
  blueSoft:"#EEF2FF",
  bg:      "#F5F7FB",  // app background
  ink:     "#111827",
  sub:     "#6B7280",
  line:    "#E5E7EB",
  card:    "#FFFFFF",
  green:   "#0EAD69",
  greenSoft:"#E7F8EF",
  amber:   "#F59E0B",
  danger:  "#DC2626",
  dangerSoft:"#FEE2E2",
};

/* =====================================================================
   CHROME
   ===================================================================== */
export function Phone({ children, bg = T.card }: { children: ReactNode; bg?: string }) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ minHeight: 700, background: bg }}>
      {children}
    </div>
  );
}

export function TopBar({ title, onBack, right, dark = true }: { title: string; onBack?: () => void; right?: ReactNode; dark?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-4 h-14"
      style={{ background: dark ? T.navy : T.card, color: dark ? "#fff" : T.ink, borderBottom: dark ? "none" : `1px solid ${T.line}` }}
    >
      {onBack ? (
        <button onClick={onBack} className="p-1 -ml-1"><ChevronLeft className="w-6 h-6" /></button>
      ) : <div className="w-6" />}
      <div className="flex-1 font-semibold text-[16px] truncate">{title}</div>
      {right}
    </div>
  );
}

export function PrimaryBtn({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-white font-semibold text-[15px] py-3.5 rounded-xl disabled:opacity-40 transition active:scale-[0.99]"
      style={{ background: T.blue, boxShadow: disabled ? "none" : "0 8px 24px -8px rgba(31,90,246,0.45)" }}
    >
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full font-medium text-[14px] py-3 rounded-xl border transition active:scale-[0.99]"
      style={{ borderColor: T.line, color: T.ink, background: T.card }}
    >
      {children}
    </button>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ color: T.sub }}>{label}</div>
      <div className="mt-2">{children}</div>
      {hint && <div className="mt-1.5 text-[11px]" style={{ color: T.sub }}>{hint}</div>}
    </label>
  );
}

/* =====================================================================
   1. SPLASH / LANDING
   ===================================================================== */
export function Landing({ onStart }: { onStart: () => void }) {
  const [score, setScore] = useState(420);
  useEffect(() => {
    let v = 420;
    const id = setInterval(() => {
      v = Math.min(v + 12, 762);
      setScore(v);
      if (v >= 762) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, []);
  const pct = Math.min(1, Math.max(0, (score - 300) / 600));
  const color = score < 500 ? T.danger : score < 650 ? T.amber : T.green;

  return (
    <Phone bg={T.card}>
      <div className="flex-1 flex flex-col px-6 pt-12 pb-8">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.navy }}>
            <div className="w-3.5 h-3.5 rounded-sm" style={{ background: T.blue }} />
          </div>
          <div className="text-[13px] font-bold tracking-[0.2em]" style={{ color: T.navy }}>GROSCORE</div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-10">
          <div>
            <h1 className="text-[34px] leading-[1.05] font-bold tracking-tight" style={{ color: T.navy }}>
              Your personal<br/>credit coach.
            </h1>
            <p className="mt-3 text-[15px]" style={{ color: T.sub }}>
              See your score, fix what's hurting it, and grow it — with a coach in your pocket.
            </p>
          </div>

          {/* Animated score dial */}
          <div className="rounded-2xl p-5 border" style={{ borderColor: T.line, background: T.bg }}>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: T.sub }}>Live demo</span>
              <span className="text-[42px] font-bold tabular-nums leading-none" style={{ color }}>{score}</span>
            </div>
            <div className="mt-3 h-2.5 rounded-full overflow-hidden" style={{ background: "#E4E8F1" }}>
              <div className="h-full transition-all duration-75" style={{ width: `${pct * 100}%`, background: color }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-medium" style={{ color: T.sub }}>
              <span>300</span><span>Poor · Fair · Good · Excellent</span><span>900</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <PrimaryBtn onClick={onStart}>Start now</PrimaryBtn>
          <p className="text-center text-[11px] flex items-center justify-center gap-1.5" style={{ color: T.sub }}>
            <Lock className="w-3 h-3" /> Checking here won't affect your score
          </p>
          <p className="text-center text-[10px]" style={{ color: T.sub }}>
            Powered by Equifax · ISO 27001 · RBI compliant
          </p>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   2. PHONE
   ===================================================================== */
export function PhoneEntry({ onNext, onBack, initial = "" }: { onNext: (p: string) => void; onBack: () => void; initial?: string }) {
  const [phone, setPhone] = useState(initial);
  const [consent, setConsent] = useState(true);
  const ok = /^\d{10}$/.test(phone) && consent;
  return (
    <Phone bg={T.bg}>
      <TopBar title="Sign in" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-7 pb-6">
        <h2 className="text-[22px] font-bold" style={{ color: T.navy }}>Enter your mobile</h2>
        <p className="mt-1.5 text-[14px]" style={{ color: T.sub }}>We'll send a 4-digit OTP to verify.</p>

        <div className="mt-6">
          <Field label="Mobile number">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-3 bg-white border-2 transition"
              style={{ borderColor: /^\d{10}$/.test(phone) ? T.blue : T.line }}
            >
              <span className="text-[15px] font-semibold" style={{ color: T.ink }}>+91</span>
              <div className="w-px h-5" style={{ background: T.line }} />
              <input
                autoFocus
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="98765 43210"
                className="flex-1 text-[16px] font-medium outline-none tabular-nums bg-transparent"
              />
            </div>
          </Field>
        </div>

        <label className="mt-5 flex items-start gap-2.5 text-[12px] cursor-pointer" style={{ color: T.sub }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5"
            style={{ accentColor: T.blue }}
          />
          <span>
            Fetch my credit report from Equifax — <b style={{ color: T.ink }}>soft check</b>, won't affect my score.
          </span>
        </label>

        <div
          className="mt-5 rounded-xl px-3 py-2.5 flex items-center gap-2 text-[11px]"
          style={{ background: T.blueSoft, color: T.navy }}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: T.blue }} />
          <span>Your data is encrypted end-to-end. We never share it.</span>
        </div>

        <div className="mt-auto pt-6">
          <PrimaryBtn onClick={() => ok && onNext(phone)} disabled={!ok}>Send OTP</PrimaryBtn>
          <p className="mt-3 text-center text-[10px]" style={{ color: T.sub }}>
            By continuing you agree to our Terms & Privacy.
          </p>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   3. OTP
   ===================================================================== */
export function OtpEntry({ phone, onNext, onBack, onChangeNumber }: { phone: string; onNext: () => void; onBack: () => void; onChangeNumber: () => void }) {
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { if (timer <= 0) return; const t = setTimeout(() => setTimer(timer - 1), 1000); return () => clearTimeout(t); }, [timer]);
  const locked = attempts >= 5;

  function submit(v: string) {
    setOtp(v);
    if (v.length !== 4) return;
    if (v === "0000") {
      setError("Wrong code. Try again.");
      setAttempts((a) => a + 1);
      setTimeout(() => setOtp(""), 350);
    } else {
      setError(null);
      onNext();
    }
  }

  return (
    <Phone bg={T.bg}>
      <TopBar title="Verify OTP" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-7 pb-6">
        <h2 className="text-[22px] font-bold" style={{ color: T.navy }}>Enter the code</h2>
        <p className="mt-1.5 text-[14px]" style={{ color: T.sub }}>
          Sent to +91 {phone.slice(0, 2)}xxxxxx{phone.slice(-2)} ·{" "}
          <button onClick={onChangeNumber} className="underline font-medium" style={{ color: T.blue }}>change</button>
        </p>

        <div className="mt-8 relative">
          <input
            ref={inputRef}
            value={otp}
            onChange={(e) => !locked && submit(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            className="absolute inset-0 opacity-0"
            disabled={locked}
          />
          <div className="flex gap-3 justify-center">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-14 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold tabular-nums transition"
                style={{
                  borderColor: error ? T.danger : otp[i] ? T.blue : T.line,
                  background: locked ? "#F3F4F6" : T.card,
                  color: T.navy,
                }}
              >
                {otp[i] ?? ""}
              </div>
            ))}
          </div>
        </div>

        {error && !locked && (
          <p className="mt-4 text-center text-[13px] font-medium" style={{ color: T.danger }}>
            {error} · {5 - attempts} attempts left
          </p>
        )}
        {locked && (
          <div className="mt-4 p-3 rounded-xl text-[13px] text-center" style={{ background: T.dangerSoft, color: T.danger }}>
            Too many wrong tries. Come back in 15 minutes.
          </div>
        )}

        <p className="mt-6 text-center text-[11px] flex items-center justify-center gap-1.5" style={{ color: T.sub }}>
          <Lock className="w-3 h-3" /> This is a soft enquiry. Your score is not affected.
        </p>

        <div className="mt-auto pt-6 text-center text-[13px]">
          {timer > 0 ? (
            <span style={{ color: T.sub }}>Resend code in 0:{timer.toString().padStart(2, "0")}</span>
          ) : (
            <button
              onClick={() => { setTimer(30); setAttempts(0); setError(null); }}
              className="underline font-semibold"
              style={{ color: T.blue }}
            >
              Resend code
            </button>
          )}
          <div className="mt-3 text-[10px]" style={{ color: T.sub }}>Any 4 digits work · use 0000 to force error</div>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   4. NAME (autofill for known users, manual for new)
   ===================================================================== */
export function NameEntry({
  onNext, onBack, initial = "", autofilled = false,
}: {
  onNext: (n: string) => void; onBack: () => void; initial?: string; autofilled?: boolean;
}) {
  const [name, setName] = useState(initial);
  const ok = name.trim().length >= 2;
  return (
    <Phone bg={T.bg}>
      <TopBar title="Your name" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-7 pb-6">
        <h2 className="text-[22px] font-bold" style={{ color: T.navy }}>What's your name?</h2>
        <p className="mt-1.5 text-[14px]" style={{ color: T.sub }}>
          {autofilled ? "We found this on your profile — edit if needed." : "Exactly as printed on your PAN card."}
        </p>

        <div className="mt-6">
          <Field label="Full name" hint="Middle names matter — match your PAN.">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="RAHUL KUMAR SHARMA"
              className="w-full text-[16px] font-semibold rounded-xl px-3 py-3 bg-white border-2 outline-none tracking-wide"
              style={{ borderColor: ok ? T.blue : T.line, color: T.ink }}
            />
          </Field>
        </div>

        {/* PAN card illustration */}
        <div className="mt-6 rounded-xl border p-4 flex gap-3" style={{ borderColor: T.line, background: T.card }}>
          <div
            className="w-20 h-12 rounded-md flex flex-col justify-between p-1.5 shrink-0"
            style={{ background: "linear-gradient(135deg, #E4E8F1, #F5F7FB)", border: `1px solid ${T.line}` }}
          >
            <div className="text-[7px] font-bold" style={{ color: T.navy }}>INCOME TAX</div>
            <div className="text-[6px] font-mono" style={{ color: T.sub }}>ABCPX•••••F</div>
            <div className="text-[7px] font-bold tracking-wide" style={{ color: T.ink }}>YOUR NAME</div>
          </div>
          <div className="text-[12px] leading-relaxed" style={{ color: T.sub }}>
            Bureau matches name letter-for-letter with PAN. Typos here mean a wrong report.
          </div>
        </div>

        <div className="mt-auto pt-6">
          <PrimaryBtn onClick={() => ok && onNext(name.trim())} disabled={!ok}>Continue</PrimaryBtn>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   5. FETCHING
   ===================================================================== */
export function Fetching({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1500); return () => clearTimeout(t); }, [onDone]);
  return (
    <Phone bg={T.card}>
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.blueSoft }}>
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: T.blue }} />
        </div>
        <div className="text-center">
          <div className="text-[15px] font-semibold" style={{ color: T.navy }}>Fetching your details</div>
          <div className="mt-1 text-[13px]" style={{ color: T.sub }}>Talking to Equifax… this takes ~5 seconds.</div>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   6. CONFIRM IDENTITY (with "use my saved name" toggle)
   ===================================================================== */
export function ConfirmIdentity({
  user, name, savedName, onYes, onEditName, onChangeNumber, onNotMe,
}: {
  user: DemoUser; name: string; savedName?: string;
  onYes: (finalName: string) => void; onEditName: () => void; onChangeNumber: () => void; onNotMe: () => void;
}) {
  const dobMap: Record<string, string> = { ntc: "14 Aug 1998", distressed: "02 Mar 1989", expired: "27 Nov 1985" };
  const [useSaved, setUseSaved] = useState(false);
  const bureauName = (name || user.name).toUpperCase();
  const cmsName = (savedName || "").toUpperCase();
  const displayName = useSaved && cmsName ? cmsName : bureauName;

  return (
    <Phone bg={T.bg}>
      <TopBar title="Confirm your identity" />
      <div className="flex-1 flex flex-col px-5 pt-6 pb-6">
        <h2 className="text-[22px] font-bold" style={{ color: T.navy }}>Is this you?</h2>
        <p className="mt-1.5 text-[14px]" style={{ color: T.sub }}>Details fetched from the credit bureau.</p>

        {/* Receipt card */}
        <div className="mt-5 rounded-2xl bg-white overflow-hidden border" style={{ borderColor: T.line }}>
          <Row
            label="Name"
            value={<span className="font-semibold tracking-wide" style={{ color: T.ink }}>{displayName}</span>}
            action="Edit"
            onAction={onEditName}
          />
          {cmsName && cmsName !== bureauName && (
            <div className="px-4 pb-3 -mt-1">
              <label className="flex items-center gap-2 text-[12px] cursor-pointer" style={{ color: T.sub }}>
                <input
                  type="checkbox"
                  checked={useSaved}
                  onChange={(e) => setUseSaved(e.target.checked)}
                  style={{ accentColor: T.blue }}
                />
                Use my saved name ({cmsName})
              </label>
            </div>
          )}
          <Row
            label="Mobile"
            value={<span className="font-mono" style={{ color: T.ink }}>+91 {user.phone.slice(0, 2)}xxxxxx{user.phone.slice(-2)}</span>}
            action="Change"
            onAction={onChangeNumber}
          />
          <Row
            label="PAN"
            value={<span className="font-mono tracking-widest" style={{ color: T.ink }}>{maskPan(user.pan)}</span>}
          />
          <Row
            label="Date of birth"
            value={<span style={{ color: T.ink }}>{dobMap[user.key] ?? "—"}</span>}
            last
          />
        </div>

        <button
          onClick={onNotMe}
          className="mt-4 text-[12px] underline self-center"
          style={{ color: T.sub }}
        >
          Not you? Enter PAN manually
        </button>

        <div className="mt-auto pt-6 space-y-2">
          <PrimaryBtn onClick={() => onYes(displayName)}>Yes, that's me</PrimaryBtn>
          <p className="text-[11px] text-center" style={{ color: T.sub }}>Soft check only — won't affect your score.</p>
        </div>
      </div>
    </Phone>
  );
}

function Row({ label, value, action, onAction, last }: { label: string; value: ReactNode; action?: string; onAction?: () => void; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: last ? "none" : `1px solid ${T.line}` }}
    >
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: T.sub }}>{label}</div>
        <div className="mt-1 text-[15px] truncate">{value}</div>
      </div>
      {action && (
        <button onClick={onAction} className="text-[12px] font-semibold" style={{ color: T.blue }}>
          {action}
        </button>
      )}
    </div>
  );
}

/* =====================================================================
   7. PAN FALLBACK
   ===================================================================== */
export function PanFallback({ onNext, onBack }: { onNext: (p: string) => void; onBack: () => void }) {
  const [pan, setPan] = useState("");
  const ok = /^[A-Z]{5}\d{4}[A-Z]$/.test(pan);
  const showErr = pan.length === 10 && !ok;
  return (
    <Phone bg={T.bg}>
      <TopBar title="Enter your PAN" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-7 pb-6">
        <h2 className="text-[22px] font-bold" style={{ color: T.navy }}>Enter your PAN</h2>
        <p className="mt-1.5 text-[14px]" style={{ color: T.sub }}>
          We couldn't find you with mobile + name. Your PAN is a guaranteed match.
        </p>

        <div className="mt-6">
          <Field label="PAN number" hint="10 characters · e.g. ABCPX1234F">
            <input
              autoFocus
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
              placeholder="ABCPX1234F"
              className="w-full text-[18px] font-mono tracking-[0.2em] rounded-xl px-3 py-3 bg-white border-2 outline-none"
              style={{ borderColor: showErr ? T.danger : ok ? T.blue : T.line, color: T.ink }}
            />
          </Field>
          {showErr && <p className="mt-2 text-[12px]" style={{ color: T.danger }}>Invalid PAN format.</p>}
        </div>

        <div
          className="mt-5 rounded-xl px-3 py-2.5 flex items-center gap-2 text-[11px]"
          style={{ background: T.blueSoft, color: T.navy }}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: T.blue }} />
          <span>Encrypted at rest. Only used to fetch your credit report.</span>
        </div>

        <div className="mt-auto pt-6">
          <PrimaryBtn onClick={() => ok && onNext(pan)} disabled={!ok}>Continue</PrimaryBtn>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   8. ANALYZING (with no-score branch)
   ===================================================================== */
export function Analyzing({ user, onDone }: { user: DemoUser; onDone: () => void }) {
  const steps = user.hasScore
    ? ["Fetching report", `Analyzing ${distressedTasks.length} issues`, "Preparing dispute plan", "Arjun is ready"]
    : ["Checking bureau", "No history found — you're new to credit", "Shortlisting starter cards", "Arjun is ready"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length) { const t = setTimeout(onDone, 500); return () => clearTimeout(t); }
    const t = setTimeout(() => setI(i + 1), 650);
    return () => clearTimeout(t);
  }, [i, steps.length, onDone]);
  return (
    <Phone bg={T.bg}>
      <div className="flex-1 flex flex-col justify-center px-8">
        <div className="text-center mb-8">
          <div className="text-[10px] font-bold tracking-[0.3em]" style={{ color: T.blue }}>ANALYZING</div>
          <h2 className="mt-2 text-[24px] font-bold" style={{ color: T.navy }}>
            {user.hasScore ? "Building your plan" : "Setting up your profile"}
          </h2>
        </div>
        <div className="space-y-2.5">
          {steps.map((s, idx) => {
            const done = idx < i;
            const active = idx === i;
            return (
              <div
                key={s}
                className="flex items-center gap-3 text-[14px] rounded-xl p-3 border transition"
                style={{
                  background: done ? T.greenSoft : active ? T.blueSoft : T.card,
                  borderColor: done ? T.green : active ? T.blue : T.line,
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: done ? T.green : active ? T.blue : "#EEF0F5" }}
                >
                  {done ? <Check className="w-3.5 h-3.5 text-white" /> :
                   active ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : null}
                </div>
                <span className={done ? "font-medium" : active ? "font-semibold" : ""} style={{ color: done || active ? T.ink : T.sub }}>
                  {s}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-10 text-center text-[11px]" style={{ color: T.sub }}>Joined by 2,14,000+ Indians this month.</p>
      </div>
    </Phone>
  );
}

/* =====================================================================
   9. PAYWALL (adaptive)
   ===================================================================== */
export function Paywall({ user, onPay, onBack }: { user: DemoUser; onPay: () => void; onBack: () => void }) {
  const isNTC = !user.hasScore;
  const current = user.score ?? 0;
  const target = 750;
  const tasksCount = isNTC ? 0 : distressedTasks.length;
  const topGain = distressedTasks.slice(0, 3).reduce((a, b) => a + b.impact, 0);

  const hero = isNTC
    ? { line: "Zero se 750+ — first card, first score.", left: "NTC", right: "750+", leftColor: T.sub }
    : tasksCount >= 3
      ? { line: `+${topGain} points possible from your top 3 fixes`, left: `${current}`, right: `${target}+`, leftColor: current < 550 ? T.danger : T.amber }
      : { line: "Protect and grow your score", left: `${current}`, right: `${target}+`, leftColor: T.amber };

  const heroPct = isNTC ? 0.05 : Math.max(0.05, Math.min(1, (current - 300) / 600));

  return (
    <Phone bg={T.bg}>
      <TopBar title="Unlock your plan" onBack={onBack} />
      <div className="flex-1 flex flex-col px-5 pt-5 pb-5 overflow-y-auto">
        {/* Score hero */}
        <div className="rounded-2xl p-5 border" style={{ background: T.card, borderColor: T.line }}>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: T.sub }}>Today</div>
              <div className="text-[36px] font-bold leading-none tabular-nums" style={{ color: hero.leftColor }}>{hero.left}</div>
            </div>
            <TrendingUp className="w-5 h-5" style={{ color: T.sub }} />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: T.sub }}>Target</div>
              <div className="text-[36px] font-bold leading-none tabular-nums" style={{ color: T.green }}>{hero.right}</div>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: "#E4E8F1" }}>
            <div className="h-full" style={{ width: `${heroPct * 100}%`, background: T.green }} />
          </div>
          <div className="mt-3 text-[13px] font-semibold" style={{ color: T.navy }}>{hero.line}</div>
        </div>

        {/* Task module — only when tasks > 0 */}
        {tasksCount > 0 && (
          <div className="mt-4 rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.line }}>
            <div className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: T.sub }}>
              Fix these first
            </div>
            {distressedTasks.slice(0, 3).map((t, idx) => (
              <div
                key={t.id}
                className="flex items-start justify-between px-4 py-3"
                style={{ borderTop: idx === 0 ? "none" : `1px solid ${T.line}` }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold" style={{ color: T.ink }}>{t.title}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: T.sub }}>{t.desc}</div>
                </div>
                <div className="ml-3 shrink-0 px-2 py-0.5 rounded-md text-[12px] font-bold" style={{ background: T.greenSoft, color: T.green }}>
                  +{t.impact}
                </div>
              </div>
            ))}
            {tasksCount > 3 && (
              <div className="px-4 py-2.5 text-[12px] font-medium" style={{ borderTop: `1px solid ${T.line}`, color: T.sub }}>
                and {tasksCount - 3} more inside
              </div>
            )}
          </div>
        )}

        {/* Value stack */}
        <div className="mt-4 rounded-2xl p-4 border" style={{ background: T.card, borderColor: T.line }}>
          <div className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-2" style={{ color: T.sub }}>What you get</div>
          {[
            { icon: Bot, t: "Arjun, your credit coach, 24×7" },
            { icon: TrendingUp, t: "Monthly score tracking" },
            { icon: BellRing, t: "Enquiry, error & fraud alerts" },
            { icon: FileText, t: "Dispute help + full report" },
          ].map(({ icon: Ic, t }) => (
            <div key={t} className="flex items-center gap-3 py-1.5 text-[14px]" style={{ color: T.ink }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.blueSoft }}>
                <Ic className="w-3.5 h-3.5" style={{ color: T.blue }} />
              </div>
              {t}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-5 space-y-2 sticky bottom-0 pt-2" style={{ background: T.bg }}>
          <PrimaryBtn onClick={onPay}>
            {isNTC ? "Start building for ₹9" : "Fix these for ₹9"}
          </PrimaryBtn>
          <p className="text-[11px] text-center leading-snug" style={{ color: T.sub }}>
            <b style={{ color: T.ink }}>₹9 today</b> · ₹99/month starts in 3 days · reminder 1 day before · cancel anytime
          </p>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   10. LAPSED ₹99 WALL
   ===================================================================== */
export function LapsedWall({ user, onPay, onBack }: { user: DemoUser; onPay: () => void; onBack: () => void }) {
  return (
    <Phone bg={T.bg}>
      <TopBar title="Restart subscription" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-7 pb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#FEF3C7" }}>
          <AlertTriangle className="w-6 h-6" style={{ color: T.amber }} />
        </div>
        <h2 className="mt-4 text-[22px] font-bold" style={{ color: T.navy }}>Welcome back, {user.name}</h2>
        <p className="mt-1.5 text-[14px]" style={{ color: T.sub }}>
          Your subscription ended. Restart to unlock your coach and see today's score.
        </p>

        <div className="mt-6 rounded-2xl border p-5" style={{ background: T.card, borderColor: T.line }}>
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] font-medium" style={{ color: T.ink }}>Monthly plan</span>
            <span className="text-[32px] font-bold" style={{ color: T.navy }}>
              ₹99<span className="text-[12px] font-normal" style={{ color: T.sub }}>/mo</span>
            </span>
          </div>
          <div className="mt-4 space-y-2 text-[13px]" style={{ color: T.ink }}>
            {["Fresh report + updated score", "Coach, alerts, disputes", "Cancel anytime"].map((v) => (
              <div key={v} className="flex items-center gap-2.5">
                <Check className="w-4 h-4" style={{ color: T.green }} /> {v}
              </div>
            ))}
          </div>
        </div>

        {user.score && (
          <div className="mt-4 rounded-xl p-3 flex items-center justify-between" style={{ background: T.blueSoft }}>
            <span className="text-[12px]" style={{ color: T.navy }}>Last known score</span>
            <span className="text-[18px] font-bold" style={{ color: T.navy }}>{user.score}</span>
          </div>
        )}

        <div className="mt-auto pt-6 space-y-2">
          <PrimaryBtn onClick={onPay}>Restart for ₹99</PrimaryBtn>
          <p className="text-[11px] text-center" style={{ color: T.sub }}>You'll be charged today. Cancel anytime.</p>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   11. RAZORPAY MOCK
   ===================================================================== */
export function RazorpayMock({ amount, onSuccess, onBack }: { amount: number; onSuccess: () => void; onBack: () => void }) {
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState("upi-gpay");
  const methods = [
    { id: "upi-gpay", t: "UPI · Google Pay" },
    { id: "upi-phonepe", t: "UPI · PhonePe" },
    { id: "card", t: "Card ending 4242" },
    { id: "nb", t: "Netbanking · HDFC" },
  ];
  return (
    <Phone bg={T.bg}>
      <TopBar title="Razorpay" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-7 pb-6">
        <div className="rounded-2xl p-5 text-center" style={{ background: T.navy, color: "#fff" }}>
          <div className="text-[11px] uppercase tracking-widest opacity-70">Total payable</div>
          <div className="mt-1 text-[42px] font-bold">₹{amount}</div>
          {amount === 9 && <div className="text-[11px] opacity-80 mt-1">₹99/mo starts in 3 days</div>}
        </div>
        <div className="mt-6 text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ color: T.sub }}>
          Payment method
        </div>
        <div className="mt-2 space-y-2">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className="w-full text-left p-3.5 rounded-xl border-2 flex items-center gap-3 transition"
              style={{ borderColor: method === m.id ? T.blue : T.line, background: T.card }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: method === m.id ? T.blue : T.line }}
              >
                {method === m.id && <div className="w-2 h-2 rounded-full" style={{ background: T.blue }} />}
              </div>
              <span className="text-[14px] font-medium" style={{ color: T.ink }}>{m.t}</span>
            </button>
          ))}
        </div>
        <div className="mt-auto pt-6">
          <PrimaryBtn onClick={() => { setBusy(true); setTimeout(onSuccess, 900); }} disabled={busy}>
            {busy ? "Processing…" : `Pay ₹${amount}`}
          </PrimaryBtn>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   12. SUCCESS
   ===================================================================== */
export function PaySuccess({ onHome }: { onHome: () => void }) {
  useEffect(() => { const t = setTimeout(onHome, 1400); return () => clearTimeout(t); }, [onHome]);
  return (
    <Phone bg={T.card}>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: T.green }}>
          <Check className="w-8 h-8 text-white" />
        </div>
        <div className="text-[18px] font-bold" style={{ color: T.navy }}>Payment successful</div>
        <div className="text-[13px]" style={{ color: T.sub }}>Setting up your coach…</div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   13. HOME STUB
   ===================================================================== */
export function HomeStub({ user, onRestart }: { user: DemoUser; onRestart: () => void }) {
  return (
    <Phone bg={T.bg}>
      <TopBar title="Arjun · your coach" right={<Sparkles className="w-5 h-5" />} />
      <div className="flex-1 flex flex-col p-5 gap-4">
        <div className="rounded-2xl p-5 border" style={{ background: T.card, borderColor: T.line }}>
          <div className="text-[11px] uppercase tracking-[0.14em] font-semibold" style={{ color: T.sub }}>Welcome</div>
          <div className="text-[18px] font-bold" style={{ color: T.navy }}>{user.name}</div>
          {user.hasScore ? (
            <div className="mt-2 text-[34px] font-bold leading-none" style={{ color: T.green }}>
              {user.score}<span className="text-[13px] font-normal ml-1" style={{ color: T.sub }}>/ 900</span>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2 text-[13px]" style={{ color: T.sub }}>
              <Sprout className="w-4 h-4" style={{ color: T.green }} /> No score yet — let's build one.
            </div>
          )}
        </div>
        <div className="rounded-2xl p-4 text-[13px] border" style={{ background: T.card, borderColor: T.line, color: T.sub }}>
          Placeholder home. The rich chat UI lives at <code className="text-[11px]" style={{ color: T.navy }}>/</code>.
        </div>
        <div className="mt-auto">
          <SecondaryBtn onClick={onRestart}>Restart flow</SecondaryBtn>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   14. ERRORS
   ===================================================================== */
export function GenericError({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <Phone bg={T.bg}>
      <TopBar title="Something went wrong" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: T.dangerSoft }}>
          <X className="w-6 h-6" style={{ color: T.danger }} />
        </div>
        <div className="font-bold text-[16px]" style={{ color: T.navy }}>{msg}</div>
        <button
          onClick={onRetry}
          className="mt-2 px-5 py-2.5 rounded-xl text-white text-[14px] font-semibold"
          style={{ background: T.blue }}
        >
          Retry
        </button>
      </div>
    </Phone>
  );
}

/* Suppress unused-import lint for icons kept for future variants */
const _unused = { Zap, PhoneIcon, useMemo };
export default _unused;

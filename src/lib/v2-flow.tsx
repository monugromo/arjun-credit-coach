import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, Check, Lock, ShieldCheck, Sparkles, TrendingUp, AlertTriangle, Loader2, X } from "lucide-react";
import { DEMOS, distressedTasks, maskPan, type DemoUser } from "@/lib/groscore-data";

/* ---------- Tokens (reuse WhatsApp green from existing app) ---------- */
export const WA = {
  green: "#075E54",
  accent: "#25D366",
  cream: "#F7F3EA",
  ink: "#111827",
  sub: "#6B7280",
  line: "#E5E7EB",
  danger: "#DC2626",
};

/* ---------- Shared chrome ---------- */
export function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden" style={{ minHeight: 700 }}>
      {children}
    </div>
  );
}

export function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-3 h-14 text-white" style={{ background: WA.green }}>
      {onBack ? (
        <button onClick={onBack} className="p-1 -ml-1"><ChevronLeft className="w-6 h-6" /></button>
      ) : <div className="w-6" />}
      <div className="flex-1 font-semibold text-[17px] truncate">{title}</div>
      {right}
    </div>
  );
}

export function PrimaryBtn({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-white font-bold py-3.5 rounded-full disabled:opacity-40 transition"
      style={{ background: WA.accent }}
    >
      {children}
    </button>
  );
}

/* =====================================================================
   SCREENS
   ===================================================================== */

/* 1. Landing ---------------------------------------------------------- */
export function Landing({ onStart }: { onStart: () => void }) {
  const [score, setScore] = useState(413);
  useEffect(() => {
    let v = 413;
    const id = setInterval(() => {
      v = Math.min(v + 14, 762);
      setScore(v);
      if (v >= 762) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, []);
  const pct = Math.min(1, (score - 300) / 600);
  const color = score < 500 ? "#DC2626" : score < 650 ? "#F59E0B" : "#16A34A";
  return (
    <Phone>
      <div className="flex-1 flex flex-col px-6 pt-14 pb-8" style={{ background: WA.cream }}>
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-[13px] font-bold tracking-[0.3em] text-gray-500">GROSCORE</div>
            <h1 className="mt-3 text-3xl font-bold leading-tight" style={{ color: WA.ink }}>
              Your personal<br />credit coach
            </h1>
          </div>
          <div className="w-full max-w-xs">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs text-gray-500">Your score</span>
              <span className="text-4xl font-bold tabular-nums" style={{ color }}>{score}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full transition-all duration-100" style={{ width: `${pct * 100}%`, background: color }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
              <span>300</span><span>750+</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <PrimaryBtn onClick={onStart}>Start now</PrimaryBtn>
          <p className="text-center text-[11px] text-gray-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Checking here won't affect your score
          </p>
        </div>
      </div>
    </Phone>
  );
}

/* 2. Phone ------------------------------------------------------------ */
export function PhoneEntry({ onNext, onBack, initial = "" }: { onNext: (p: string) => void; onBack: () => void; initial?: string }) {
  const [phone, setPhone] = useState(initial);
  const ok = /^\d{10}$/.test(phone);
  const isDemo = DEMOS[phone];
  return (
    <Phone>
      <TopBar title="Enter mobile number" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        <h2 className="text-xl font-bold">We'll send you a code</h2>
        <p className="mt-1 text-sm text-gray-500">Used to fetch your credit report — soft check only.</p>
        <div className="mt-6 flex items-center gap-2 border-b-2 pb-2" style={{ borderColor: ok ? WA.accent : WA.line }}>
          <span className="text-lg font-medium">+91</span>
          <input
            autoFocus
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit mobile"
            className="flex-1 text-lg font-medium outline-none tabular-nums"
          />
        </div>
        {isDemo && <p className="mt-2 text-xs" style={{ color: WA.accent }}>Demo: {isDemo.key} account</p>}
        <label className="mt-6 flex items-start gap-2 text-[12px] text-gray-600">
          <input type="checkbox" defaultChecked className="mt-0.5 accent-current" style={{ accentColor: WA.accent }} />
          <span>Fetch my credit report — soft check, won't affect my score.</span>
        </label>
        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-[11px] text-gray-500 leading-relaxed">
          <div className="font-semibold text-gray-700 mb-1">Try demo:</div>
          <button onClick={() => setPhone("9876500001")} className="block underline">9876500001 — new user (NTC)</button>
          <button onClick={() => setPhone("9876500002")} className="block underline">9876500002 — distressed</button>
          <button onClick={() => setPhone("9876500003")} className="block underline">9876500003 — lapsed</button>
        </div>
        <div className="mt-auto pt-6">
          <PrimaryBtn onClick={() => ok && onNext(phone)} disabled={!ok}>Send code</PrimaryBtn>
        </div>
      </div>
    </Phone>
  );
}

/* 3. OTP -------------------------------------------------------------- */
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
    if (v.length === 4) {
      // any 4 digits work in demo; use "0000" to force wrong
      if (v === "0000") {
        setError("Wrong code. Try again.");
        setAttempts((a) => a + 1);
        setTimeout(() => setOtp(""), 400);
      } else {
        onNext();
      }
    }
  }

  return (
    <Phone>
      <TopBar title="Verify OTP" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        <h2 className="text-xl font-bold">Enter the 4-digit code</h2>
        <p className="mt-1 text-sm text-gray-500">
          Sent to +91 {phone.slice(0, 2)}xxxxxx{phone.slice(-2)} · <button onClick={onChangeNumber} className="underline">change</button>
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
              <div key={i} className="w-14 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold tabular-nums"
                style={{ borderColor: otp[i] ? WA.accent : WA.line, background: locked ? "#F3F4F6" : "white" }}>
                {otp[i] ?? ""}
              </div>
            ))}
          </div>
        </div>

        {error && !locked && <p className="mt-4 text-center text-sm" style={{ color: WA.danger }}>{error} ({5 - attempts} left)</p>}
        {locked && (
          <div className="mt-4 p-3 rounded-lg border text-sm text-center" style={{ borderColor: WA.danger, color: WA.danger }}>
            Too many attempts. Try again in 15 minutes.
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" /> This is a soft enquiry — score is not affected.
        </p>

        <div className="mt-auto pt-6 text-center text-sm">
          {timer > 0 ? (
            <span className="text-gray-400">Resend code in 0:{timer.toString().padStart(2, "0")}</span>
          ) : (
            <button onClick={() => { setTimer(30); setAttempts(0); setError(null); }} className="underline font-medium" style={{ color: WA.green }}>
              Resend code
            </button>
          )}
          <div className="mt-3 text-[11px] text-gray-400">Hint: enter any 4 digits (0000 = wrong)</div>
        </div>
      </div>
    </Phone>
  );
}

/* 4. Name ------------------------------------------------------------- */
export function NameEntry({ onNext, onBack, initial = "" }: { onNext: (n: string) => void; onBack: () => void; initial?: string }) {
  const [name, setName] = useState(initial);
  const ok = name.trim().length >= 2;
  return (
    <Phone>
      <TopBar title="What's your name?" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        <h2 className="text-xl font-bold">Your full name</h2>
        <p className="mt-1 text-sm text-gray-500">Exactly as printed on your PAN card.</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rahul Kumar Sharma"
          className="mt-6 text-lg font-medium border-b-2 pb-2 outline-none uppercase"
          style={{ borderColor: ok ? WA.accent : WA.line }}
        />
        <div className="mt-6 rounded-xl border p-4 flex gap-3" style={{ borderColor: WA.line, background: "#FAFAFA" }}>
          <div className="w-16 h-10 rounded bg-white border flex items-center justify-center text-[10px] font-bold text-gray-400" style={{ borderColor: WA.line }}>
            PAN
          </div>
          <div className="text-[12px] text-gray-600 leading-relaxed">
            Match the name letter-for-letter with your PAN. Middle names matter.
          </div>
        </div>
        <div className="mt-auto pt-6">
          <PrimaryBtn onClick={() => ok && onNext(name.trim())} disabled={!ok}>Continue</PrimaryBtn>
        </div>
      </div>
    </Phone>
  );
}

/* 5. Fetching --------------------------------------------------------- */
export function Fetching({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1600); return () => clearTimeout(t); }, [onDone]);
  return (
    <Phone>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: WA.green }} />
        <p className="text-sm text-gray-600">Checking your details…</p>
      </div>
    </Phone>
  );
}

/* 6. Confirm identity ------------------------------------------------- */
export function ConfirmIdentity({
  user, name, onYes, onEditName, onChangeNumber, onNotMe,
}: {
  user: DemoUser; name: string;
  onYes: () => void; onEditName: () => void; onChangeNumber: () => void; onNotMe: () => void;
}) {
  const dobMap: Record<string, string> = { ntc: "14 Aug 1998", distressed: "02 Mar 1989", expired: "27 Nov 1985" };
  const displayName = (name || user.name).toUpperCase();
  return (
    <Phone>
      <TopBar title="Confirm identity" />
      <div className="flex-1 flex flex-col px-5 pt-6 pb-6">
        <h2 className="text-[22px] font-bold">Is this you?</h2>
        <p className="mt-1 text-sm text-gray-500">Fetched from the credit bureau.</p>
        <div className="mt-5 rounded-2xl border overflow-hidden" style={{ borderColor: WA.line }}>
          <Row label="Name" value={<span className="font-semibold">{displayName}</span>} action="Edit" onAction={onEditName} />
          <Row label="Mobile" value={<span className="font-mono">+91 {user.phone.slice(0, 2)}xxxxxx{user.phone.slice(-2)}</span>} action="Change" onAction={onChangeNumber} />
          <Row label="PAN" value={<span className="font-mono tracking-wider">{maskPan(user.pan)}</span>} />
          <Row label="Date of birth" value={dobMap[user.key] ?? "—"} last />
        </div>
        <button onClick={onNotMe} className="mt-4 text-[13px] text-gray-500 underline self-center">
          Not you? Enter PAN manually
        </button>
        <div className="mt-auto pt-6 space-y-2">
          <PrimaryBtn onClick={onYes}>Yes, that's me</PrimaryBtn>
          <p className="text-[11px] text-center text-gray-400">Soft check only — won't affect your score.</p>
        </div>
      </div>
    </Phone>
  );
}

function Row({ label, value, action, onAction, last }: { label: string; value: ReactNode; action?: string; onAction?: () => void; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${last ? "" : "border-b"}`} style={{ borderColor: WA.line }}>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-gray-400">{label}</div>
        <div className="mt-0.5 text-[15px] text-gray-900 truncate">{value}</div>
      </div>
      {action && <button onClick={onAction} className="text-[12px] font-semibold" style={{ color: WA.green }}>{action}</button>}
    </div>
  );
}

/* 7. PAN input (fallback) --------------------------------------------- */
export function PanFallback({ onNext, onBack }: { onNext: (p: string) => void; onBack: () => void }) {
  const [pan, setPan] = useState("");
  const ok = /^[A-Z]{5}\d{4}[A-Z]$/.test(pan);
  return (
    <Phone>
      <TopBar title="Enter your PAN" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        <h2 className="text-xl font-bold">Enter your PAN</h2>
        <p className="mt-1 text-sm text-gray-500">10 characters, exactly as on your card.</p>
        <input
          autoFocus
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
          placeholder="ABCPX1234F"
          className="mt-6 text-lg font-mono tracking-widest border-b-2 pb-2 outline-none"
          style={{ borderColor: ok ? WA.accent : WA.line }}
        />
        {pan.length === 10 && !ok && <p className="mt-2 text-xs" style={{ color: WA.danger }}>Invalid PAN format.</p>}
        <p className="mt-6 text-[11px] text-gray-500 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Encrypted — only used to fetch your report.
        </p>
        <div className="mt-auto pt-6">
          <PrimaryBtn onClick={() => ok && onNext(pan)} disabled={!ok}>Continue</PrimaryBtn>
        </div>
      </div>
    </Phone>
  );
}

/* 8. Analyzing -------------------------------------------------------- */
export function Analyzing({ user, onDone }: { user: DemoUser; onDone: () => void }) {
  const steps = user.hasScore
    ? ["Fetching report", `Analyzing ${distressedTasks.length} issues`, "Preparing dispute plan", "Arjun is ready"]
    : ["Checking bureau", "No history found — that's ok", "Shortlisting starter cards", "Arjun is ready"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length) { const t = setTimeout(onDone, 400); return () => clearTimeout(t); }
    const t = setTimeout(() => setI(i + 1), 700);
    return () => clearTimeout(t);
  }, [i, steps.length, onDone]);
  return (
    <Phone>
      <div className="flex-1 flex flex-col justify-center px-8 bg-white">
        <div className="text-center mb-8">
          <div className="text-xs font-bold tracking-[0.3em] text-gray-400">ANALYZING</div>
          <h2 className="mt-2 text-2xl font-bold">Building your plan</h2>
        </div>
        <div className="space-y-3">
          {steps.map((s, idx) => {
            const done = idx < i;
            const active = idx === i;
            return (
              <div key={s} className="flex items-center gap-3 text-[15px]">
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: done ? WA.accent : active ? "#FEF3C7" : "#F3F4F6" }}>
                  {done ? <Check className="w-4 h-4 text-white" /> : active ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" /> : null}
                </div>
                <span className={done ? "text-gray-900" : active ? "text-gray-900 font-medium" : "text-gray-400"}>{s}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-10 text-center text-[11px] text-gray-400">Joined by 2,14,000+ Indians this month.</p>
      </div>
    </Phone>
  );
}

/* 9. Paywall (adaptive) ---------------------------------------------- */
export function Paywall({ user, onPay, onBack }: { user: DemoUser; onPay: () => void; onBack: () => void }) {
  const isNTC = !user.hasScore;
  const current = user.score ?? 0;
  const target = 750;
  const tasksCount = isNTC ? 0 : distressedTasks.length;
  const topGain = distressedTasks.slice(0, 3).reduce((a, b) => a + b.impact, 0);

  const hero = isNTC
    ? { line: "Zero se 750+ tak", left: "NTC", right: "750+" }
    : tasksCount >= 3
      ? { line: `+${topGain} pts possible`, left: `${current}`, right: `${target}+` }
      : { line: "Protect & grow your score", left: `${current}`, right: `${target}+` };

  return (
    <Phone>
      <TopBar title="Unlock your plan" onBack={onBack} />
      <div className="flex-1 flex flex-col px-5 pt-5 pb-5" style={{ background: WA.cream }}>
        {/* Hero */}
        <div className="rounded-2xl bg-white p-4 border" style={{ borderColor: WA.line }}>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-gray-400">Your score</div>
              <div className="text-3xl font-bold" style={{ color: isNTC ? "#6B7280" : current < 550 ? WA.danger : "#F59E0B" }}>
                {hero.left}
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wide text-gray-400">Target</div>
              <div className="text-3xl font-bold" style={{ color: WA.accent }}>{hero.right}</div>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full" style={{ width: isNTC ? "8%" : `${((current - 300) / 600) * 100}%`, background: WA.accent }} />
          </div>
          <div className="mt-2 text-[13px] font-semibold" style={{ color: WA.green }}>{hero.line}</div>
        </div>

        {/* Task module */}
        {tasksCount > 0 && (
          <div className="mt-4 rounded-2xl bg-white p-4 border" style={{ borderColor: WA.line }}>
            <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Fix these first</div>
            {distressedTasks.slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: WA.line }}>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-gray-900 truncate">{t.title}</div>
                  <div className="text-[12px] text-gray-500 truncate">{t.desc}</div>
                </div>
                <div className="ml-3 text-[13px] font-bold" style={{ color: WA.accent }}>+{t.impact}</div>
              </div>
            ))}
            {tasksCount > 3 && (
              <div className="mt-2 text-[12px] text-gray-500">and {tasksCount - 3} more</div>
            )}
          </div>
        )}

        {/* Value stack */}
        <div className="mt-4 rounded-2xl bg-white p-4 border" style={{ borderColor: WA.line }}>
          {[
            "Arjun, your coach, 24×7",
            "Monthly score tracking",
            "Enquiry, error & fraud alerts",
            "Dispute help + full report",
          ].map((v) => (
            <div key={v} className="flex items-center gap-2 py-1.5 text-[14px]">
              <Check className="w-4 h-4" style={{ color: WA.accent }} /> {v}
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 space-y-2">
          <PrimaryBtn onClick={onPay}>
            {isNTC ? "Start building for ₹9" : `Fix these for ₹9`}
          </PrimaryBtn>
          <p className="text-[11px] text-center text-gray-500 leading-snug">
            ₹9 today · ₹99/month after 3 days · reminder 1 day before · cancel anytime.
          </p>
        </div>
      </div>
    </Phone>
  );
}

/* 10. Lapsed ₹99 wall ------------------------------------------------- */
export function LapsedWall({ user, onPay, onBack }: { user: DemoUser; onPay: () => void; onBack: () => void }) {
  return (
    <Phone>
      <TopBar title="Restart subscription" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#FEF3C7" }}>
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Welcome back, {user.name}</h2>
        <p className="mt-1 text-sm text-gray-500">Your subscription ended. Restart to unlock your coach and latest score.</p>
        <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: WA.line }}>
          <div className="flex items-baseline justify-between">
            <span className="text-sm">Monthly plan</span>
            <span className="text-2xl font-bold">₹99<span className="text-xs font-normal text-gray-500">/mo</span></span>
          </div>
          <div className="mt-3 space-y-1 text-[13px] text-gray-600">
            <div className="flex items-center gap-2"><Check className="w-4 h-4" style={{ color: WA.accent }} /> Fresh report + updated score</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4" style={{ color: WA.accent }} /> Coach, alerts, disputes</div>
          </div>
        </div>
        <div className="mt-auto pt-6 space-y-2">
          <PrimaryBtn onClick={onPay}>Restart for ₹99</PrimaryBtn>
          <p className="text-[11px] text-center text-gray-400">Cancel anytime.</p>
        </div>
      </div>
    </Phone>
  );
}

/* 11. Razorpay mock --------------------------------------------------- */
export function RazorpayMock({ amount, onSuccess, onBack }: { amount: number; onSuccess: () => void; onBack: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <Phone>
      <TopBar title="Razorpay" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        <div className="text-center">
          <div className="text-xs text-gray-400">Total</div>
          <div className="text-4xl font-bold">₹{amount}</div>
        </div>
        <div className="mt-6 space-y-2">
          {["UPI · GPay", "UPI · PhonePe", "Card ending 4242", "Netbanking"].map((m) => (
            <button key={m} className="w-full text-left p-3 rounded-xl border" style={{ borderColor: WA.line }}>{m}</button>
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

/* 12. Success --------------------------------------------------------- */
export function PaySuccess({ onHome }: { onHome: () => void }) {
  useEffect(() => { const t = setTimeout(onHome, 1400); return () => clearTimeout(t); }, [onHome]);
  return (
    <Phone>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: WA.accent }}>
          <Check className="w-8 h-8 text-white" />
        </div>
        <div className="text-lg font-bold">Payment successful</div>
        <div className="text-sm text-gray-500">Setting up your coach…</div>
      </div>
    </Phone>
  );
}

/* 13. Home stub ------------------------------------------------------- */
export function HomeStub({ user, onRestart }: { user: DemoUser; onRestart: () => void }) {
  return (
    <Phone>
      <TopBar title="Arjun · your coach" right={<Sparkles className="w-5 h-5" />} />
      <div className="flex-1 flex flex-col p-5 gap-4" style={{ background: WA.cream }}>
        <div className="rounded-2xl bg-white p-4 border" style={{ borderColor: WA.line }}>
          <div className="text-xs text-gray-400">Welcome</div>
          <div className="text-lg font-bold">{user.name}</div>
          {user.hasScore ? (
            <div className="mt-2 text-3xl font-bold" style={{ color: WA.green }}>{user.score}<span className="text-sm text-gray-400 ml-1">/ 900</span></div>
          ) : (
            <div className="mt-2 text-sm text-gray-500">No score yet — let's build one.</div>
          )}
        </div>
        <div className="rounded-2xl bg-white p-4 border text-sm text-gray-600" style={{ borderColor: WA.line }}>
          This is the placeholder home. The existing chat UI lives at <code className="text-xs">/</code>.
        </div>
        <div className="mt-auto">
          <button onClick={onRestart} className="w-full py-3 rounded-full border text-sm font-medium" style={{ borderColor: WA.line }}>
            Restart flow
          </button>
        </div>
      </div>
    </Phone>
  );
}

/* Error / edge screens ------------------------------------------------ */
export function GenericError({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <Phone>
      <TopBar title="Something went wrong" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#FEE2E2" }}>
          <X className="w-6 h-6" style={{ color: WA.danger }} />
        </div>
        <div className="font-bold">{msg}</div>
        <button onClick={onRetry} className="mt-2 px-5 py-2 rounded-full text-white text-sm font-semibold" style={{ background: WA.green }}>
          Retry
        </button>
      </div>
    </Phone>
  );
}

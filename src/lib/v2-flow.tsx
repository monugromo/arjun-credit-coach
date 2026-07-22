import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft, Check, CheckCheck, ChevronDown, Loader2, MoreVertical,
  Search, Camera, MessageCircle, AlertTriangle, X, Lock,
  TrendingUp, BellRing, FileText, Bot, Sprout,
} from "lucide-react";
import { DEMOS, distressedTasks, maskPan, type DemoUser } from "@/lib/groscore-data";

/* =====================================================================
   DESIGN TOKENS — WhatsApp
   ===================================================================== */
export const T = {
  // WhatsApp palette
  navy:     "#128C7E",  // header teal (kept name for API compat)
  teal:     "#128C7E",
  tealDark: "#075E54",
  green:    "#25D366",  // brand green / CTA
  greenDeep:"#128C7E",
  bubbleOut:"#DCF8C6",  // outgoing bubble
  wallpaper:"#ECE5DD",  // chat bg
  bg:       "#FFFFFF",
  card:     "#FFFFFF",
  ink:      "#111B21",
  sub:      "#667781",
  subLight: "#8696A0",
  line:     "#E9EDEF",
  divider:  "#F0F2F5",
  blue:     "#25D366",  // alias so Paywall CTA reads green (API compat)
  blueSoft: "#E7FBEE",
  greenSoft:"#E7FBEE",
  amber:    "#F5A524",
  danger:   "#EA4335",
  dangerSoft:"#FDE7E5",
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

/** WhatsApp status/top bar — teal, white text, back arrow, title, kebab */
export function WaBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-4 h-14 shrink-0" style={{ background: T.tealDark, color: "#fff" }}>
      {onBack ? (
        <button onClick={onBack} className="-ml-1 p-1"><ArrowLeft className="w-6 h-6" /></button>
      ) : <div className="w-6" />}
      <div className="flex-1 font-medium text-[19px] tracking-tight">{title}</div>
      {right ?? <button className="p-1 -mr-1"><MoreVertical className="w-5 h-5" /></button>}
    </div>
  );
}
// alias for compat with any external caller
export const TopBar = WaBar;

/** WhatsApp primary pill (green, uppercase-ish) */
export function PrimaryBtn({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-white font-medium text-[15px] px-6 py-3 rounded-full disabled:opacity-40 transition active:scale-[0.98] shadow-sm"
      style={{ background: T.green }}
    >
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-medium text-[14px] px-6 py-2.5 rounded-full transition active:scale-[0.98]"
      style={{ color: T.teal, background: "transparent" }}
    >
      {children}
    </button>
  );
}

/* Small text link, WA green */
function Link({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} className="font-medium underline" style={{ color: T.teal }}>{children}</button>;
}

/* WhatsApp logo — circle + chat bubble */
function WaLogo({ size = 96 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{ width: size, height: size, background: T.green }}
    >
      <MessageCircle className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} fill="white" strokeWidth={0} />
      <div
        className="absolute"
        style={{
          transform: `translate(${size * 0.22}px, ${size * 0.22}px)`,
          width: size * 0.18, height: size * 0.18,
          background: T.green, clipPath: "polygon(0 0, 100% 100%, 0 100%)",
        }}
      />
    </div>
  );
}

/* =====================================================================
   1. WELCOME (WhatsApp "Welcome to …" screen)
   ===================================================================== */
export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <Phone bg="#fff">
      <div className="flex-1 flex flex-col items-center px-8 pt-20 pb-10">
        <WaLogo size={110} />
        <h1 className="mt-10 text-[26px] font-normal text-center" style={{ color: T.ink }}>
          Welcome to <span className="font-semibold">GroScore</span>
        </h1>
        <p className="mt-6 text-[14px] text-center leading-relaxed" style={{ color: T.sub }}>
          Read our <span style={{ color: T.teal }}>Privacy Policy</span>. Tap "Agree and continue" to accept
          the <span style={{ color: T.teal }}>Terms of Service</span>.
        </p>

        <div className="flex-1" />

        <div className="mt-8 flex flex-col items-center gap-3">
          <PrimaryBtn onClick={onStart}>AGREE AND CONTINUE</PrimaryBtn>
          <div className="mt-4 flex items-center gap-1.5 text-[11px]" style={{ color: T.subLight }}>
            from <span className="font-semibold" style={{ color: T.sub }}>GroScore</span>
          </div>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   2. PHONE — WhatsApp underlined input, country row
   ===================================================================== */
export function PhoneEntry({ onNext, onBack, initial = "" }: { onNext: (p: string) => void; onBack: () => void; initial?: string }) {
  const [phone, setPhone] = useState(initial);
  const ok = /^\d{10}$/.test(phone);
  return (
    <Phone bg="#fff">
      <WaBar title="Enter your phone number" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        <p className="text-[13px] leading-relaxed text-center" style={{ color: T.sub }}>
          GroScore will need to verify your phone number.{" "}
          <span style={{ color: T.teal }}>What's my number?</span>
        </p>

        {/* Country picker row (underlined) */}
        <div className="mt-10 mx-auto w-[240px]">
          <div
            className="flex items-center justify-between pb-1.5"
            style={{ borderBottom: `2px solid ${T.teal}` }}
          >
            <span className="text-[16px]" style={{ color: T.ink }}>India</span>
            <ChevronDown className="w-5 h-5" style={{ color: T.teal }} />
          </div>

          <div className="mt-6 flex items-end gap-3">
            <div className="flex items-center gap-1" style={{ borderBottom: `2px solid ${T.teal}` }}>
              <span className="text-[16px]" style={{ color: T.ink }}>+</span>
              <input
                value="91"
                readOnly
                className="w-8 text-[16px] outline-none bg-transparent"
                style={{ color: T.ink }}
              />
            </div>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="phone number"
              className="flex-1 text-[16px] outline-none bg-transparent tabular-nums pb-1"
              style={{ color: T.ink, borderBottom: `2px solid ${T.teal}` }}
            />
          </div>
        </div>

        <p className="mt-8 text-[12px] text-center" style={{ color: T.subLight }}>
          Carrier SMS charges may apply.
        </p>

        <div className="flex-1" />
        <div className="flex justify-end">
          <PrimaryBtn onClick={() => ok && onNext(phone)} disabled={!ok}>NEXT</PrimaryBtn>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   3. OTP — WhatsApp "Verifying your number"
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
    <Phone bg="#fff">
      <WaBar title="Verifying your number" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        <p className="text-[13px] leading-relaxed" style={{ color: T.sub }}>
          Waiting to automatically detect an SMS sent to <b style={{ color: T.ink }}>+91 {phone.slice(0, 5)} {phone.slice(5)}</b>.{" "}
          <Link onClick={onChangeNumber}>Wrong number?</Link>
        </p>

        <div className="mt-10 mx-auto w-full max-w-[280px] relative">
          <input
            ref={inputRef}
            value={otp}
            onChange={(e) => !locked && submit(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            className="absolute inset-0 opacity-0"
            disabled={locked}
          />
          <div className="flex gap-4 justify-center">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-12 text-center text-[26px] font-normal tabular-nums pb-1.5"
                style={{
                  borderBottom: `2px solid ${error ? T.danger : otp[i] ? T.teal : "#B4B7BA"}`,
                  color: T.ink,
                }}
              >
                {otp[i] ?? <span style={{ color: "#D1D5DB" }}>–</span>}
              </div>
            ))}
          </div>
        </div>

        {error && !locked && (
          <p className="mt-6 text-center text-[13px]" style={{ color: T.danger }}>
            {error} · {5 - attempts} attempts left
          </p>
        )}
        {locked && (
          <div className="mt-6 mx-4 p-3 rounded-lg text-[13px] text-center" style={{ background: T.dangerSoft, color: T.danger }}>
            Too many wrong tries. Come back in 15 minutes.
          </div>
        )}

        <div className="mt-8 text-center text-[13px]">
          <div style={{ color: T.sub }}>Didn't receive code?</div>
          <div className="mt-3">
            {timer > 0 ? (
              <span style={{ color: T.subLight }}>Resend SMS in 0:{timer.toString().padStart(2, "0")}</span>
            ) : (
              <button
                onClick={() => { setTimer(30); setAttempts(0); setError(null); }}
                className="font-medium"
                style={{ color: T.teal }}
              >
                Resend SMS
              </button>
            )}
          </div>
        </div>

        <div className="flex-1" />
        <div className="text-center text-[11px]" style={{ color: T.subLight }}>
          Any 4 digits work · use <b>0000</b> to force error
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   4. NAME — WhatsApp "Profile info" (avatar + name)
   ===================================================================== */
export function NameEntry({
  onNext, onBack, initial = "", autofilled = false,
}: {
  onNext: (n: string) => void; onBack: () => void; initial?: string; autofilled?: boolean;
}) {
  const [name, setName] = useState(initial);
  const ok = name.trim().length >= 2;
  const initials = (name || "?").trim().split(/\s+/).map(s => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <Phone bg="#fff">
      <WaBar title="Profile info" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        <p className="text-[13px] leading-relaxed text-center" style={{ color: T.sub }}>
          Please provide your name{autofilled ? " — we prefilled it from your PAN, edit if needed" : " and an optional profile photo"}.
        </p>

        {/* Avatar with camera badge */}
        <div className="mt-8 relative mx-auto">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-[28px] font-medium"
            style={{ background: T.teal }}
          >
            {initials || "?"}
          </div>
          <div
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: T.green, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
          >
            <Camera className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="mt-10 flex items-end gap-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            placeholder="Type your name here"
            className="flex-1 text-[16px] outline-none bg-transparent tracking-wide pb-1.5"
            style={{ color: T.ink, borderBottom: `2px solid ${ok ? T.teal : "#B4B7BA"}` }}
          />
          <span className="text-[13px] pb-1.5" style={{ color: T.subLight }}>{25 - Math.min(name.length, 25)}  😊</span>
        </div>
        <p className="mt-3 text-[12px]" style={{ color: T.subLight }}>
          Match your PAN — bureau checks are letter-for-letter.
        </p>

        <div className="flex-1" />
        <div className="flex justify-center">
          <PrimaryBtn onClick={() => ok && onNext(name.trim())} disabled={!ok}>NEXT</PrimaryBtn>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   5. FETCHING — WA style spinner
   ===================================================================== */
export function Fetching({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1500); return () => clearTimeout(t); }, [onDone]);
  return (
    <Phone bg="#fff">
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: T.teal }} />
        <div className="text-center">
          <div className="text-[15px] font-medium" style={{ color: T.ink }}>Fetching your details</div>
          <div className="mt-1 text-[13px]" style={{ color: T.sub }}>Talking to Equifax…</div>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   6. CONFIRM IDENTITY — WA settings-list style
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
  const initials = displayName.split(/\s+/).map(s => s[0]).slice(0, 2).join("");

  return (
    <Phone bg="#fff">
      <WaBar title="Confirm your identity" onBack={onEditName} />
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Big avatar header */}
        <div className="flex flex-col items-center pt-6 pb-5" style={{ background: "#fff" }}>
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-[30px] font-medium"
            style={{ background: T.teal }}
          >
            {initials}
          </div>
          <div className="mt-3 text-[17px] font-medium" style={{ color: T.ink }}>{displayName}</div>
          <div className="text-[13px]" style={{ color: T.sub }}>Details from Equifax</div>
        </div>

        {/* WA-style settings list */}
        <div style={{ background: T.divider }}>
          <SectionHeader>Account</SectionHeader>
          <WaRow label="Name" value={displayName} onClick={onEditName} />
          {cmsName && cmsName !== bureauName && (
            <div className="px-4 py-3 flex items-center gap-3 bg-white" style={{ borderTop: `1px solid ${T.divider}` }}>
              <input
                type="checkbox"
                checked={useSaved}
                onChange={(e) => setUseSaved(e.target.checked)}
                style={{ accentColor: T.green }}
              />
              <span className="text-[13px]" style={{ color: T.sub }}>Use my saved name ({cmsName})</span>
            </div>
          )}
          <WaRow label="Phone" value={`+91 ${user.phone.slice(0, 2)}xxxxxx${user.phone.slice(-2)}`} onClick={onChangeNumber} />
          <WaRow label="PAN" value={maskPan(user.pan)} mono />
          <WaRow label="Date of birth" value={dobMap[user.key] ?? "—"} last />
        </div>

        <div className="px-6 py-5 text-center">
          <button onClick={onNotMe} className="text-[13px]" style={{ color: T.teal }}>
            Not you? Enter PAN manually
          </button>
        </div>

        <div className="mt-auto p-5 flex flex-col items-center gap-2">
          <PrimaryBtn onClick={() => onYes(displayName)}>YES, THAT'S ME</PrimaryBtn>
          <p className="text-[11px]" style={{ color: T.subLight }}>Soft check only — won't affect your score.</p>
        </div>
      </div>
    </Phone>
  );
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 pt-4 pb-1.5 text-[13px] font-medium" style={{ color: T.teal, background: T.divider }}>
      {children}
    </div>
  );
}

function WaRow({ label, value, onClick, mono, last }: { label: string; value: string; onClick?: () => void; mono?: boolean; last?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="w-full text-left px-4 py-3 bg-white flex flex-col"
      style={{ borderBottom: last ? "none" : `1px solid ${T.divider}` }}
    >
      <span className={`text-[16px] ${mono ? "font-mono tracking-wider" : ""}`} style={{ color: T.ink }}>{value}</span>
      <span className="text-[12px] mt-0.5" style={{ color: T.sub }}>{label}</span>
    </button>
  );
}

/* =====================================================================
   7. PAN FALLBACK — WA underline input
   ===================================================================== */
export function PanFallback({ onNext, onBack }: { onNext: (p: string) => void; onBack: () => void }) {
  const [pan, setPan] = useState("");
  const ok = /^[A-Z]{5}\d{4}[A-Z]$/.test(pan);
  const showErr = pan.length === 10 && !ok;
  return (
    <Phone bg="#fff">
      <WaBar title="Enter your PAN" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        <p className="text-[13px] leading-relaxed text-center" style={{ color: T.sub }}>
          We couldn't find you with mobile + name. Your PAN is a guaranteed match.
        </p>

        <div className="mt-12">
          <input
            autoFocus
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
            placeholder="ABCPX1234F"
            className="w-full text-center text-[22px] font-mono tracking-[0.3em] outline-none bg-transparent pb-2"
            style={{ color: T.ink, borderBottom: `2px solid ${showErr ? T.danger : ok ? T.teal : "#B4B7BA"}` }}
          />
          <p className="mt-2 text-[12px] text-center" style={{ color: showErr ? T.danger : T.subLight }}>
            {showErr ? "Invalid PAN format" : "10 characters · exactly as printed"}
          </p>
        </div>

        <div className="mt-6 mx-auto flex items-center gap-2 text-[11px]" style={{ color: T.sub }}>
          <Lock className="w-3.5 h-3.5" /> Encrypted end-to-end. Only used to fetch your report.
        </div>

        <div className="flex-1" />
        <div className="flex justify-end">
          <PrimaryBtn onClick={() => ok && onNext(pan)} disabled={!ok}>NEXT</PrimaryBtn>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   8. ANALYZING — WA chat-loading feel
   ===================================================================== */
export function Analyzing({ user, onDone }: { user: DemoUser; onDone: () => void }) {
  const steps = user.hasScore
    ? ["Fetching report", `Analyzing ${distressedTasks.length} issues`, "Preparing dispute plan", "Arjun is ready"]
    : ["Checking bureau", "No history found — new to credit", "Shortlisting starter cards", "Arjun is ready"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length) { const t = setTimeout(onDone, 500); return () => clearTimeout(t); }
    const t = setTimeout(() => setI(i + 1), 650);
    return () => clearTimeout(t);
  }, [i, steps.length, onDone]);
  return (
    <Phone bg="#fff">
      <WaBar title="Setting up" />
      <div className="flex-1 flex flex-col justify-center px-8">
        <div className="text-center mb-8">
          <WaLogo size={64} />
          <h2 className="mt-5 text-[20px] font-medium" style={{ color: T.ink }}>
            {user.hasScore ? "Building your plan" : "Setting up your profile"}
          </h2>
        </div>
        <div className="space-y-2">
          {steps.map((s, idx) => {
            const done = idx < i;
            const active = idx === i;
            return (
              <div key={s} className="flex items-center gap-3 py-2">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {done ? <CheckCheck className="w-5 h-5" style={{ color: T.teal }} /> :
                   active ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: T.sub }} /> :
                   <div className="w-2 h-2 rounded-full" style={{ background: "#D1D5DB" }} />}
                </div>
                <span className="text-[15px]" style={{ color: done ? T.ink : active ? T.ink : T.subLight, fontWeight: active ? 500 : 400 }}>
                  {s}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-10 text-center text-[11px]" style={{ color: T.subLight }}>Joined by 2,14,000+ Indians this month.</p>
      </div>
    </Phone>
  );
}

/* =====================================================================
   9. PAYWALL — WhatsApp Business-style card
   ===================================================================== */
export function Paywall({ user, onPay, onBack }: { user: DemoUser; onPay: () => void; onBack: () => void }) {
  const isNTC = !user.hasScore;
  const current = user.score ?? 0;
  const target = 750;
  const tasksCount = isNTC ? 0 : distressedTasks.length;
  const topGain = distressedTasks.slice(0, 3).reduce((a, b) => a + b.impact, 0);

  const hero = isNTC
    ? { line: "Zero → 750+. Your first card, your first score.", left: "NTC", right: "750+", leftColor: T.sub }
    : tasksCount >= 3
      ? { line: `+${topGain} points possible from your top 3 fixes`, left: `${current}`, right: `${target}+`, leftColor: current < 550 ? T.danger : T.amber }
      : { line: "Protect and grow your score", left: `${current}`, right: `${target}+`, leftColor: T.amber };

  const heroPct = isNTC ? 0.05 : Math.max(0.05, Math.min(1, (current - 300) / 600));

  return (
    <Phone bg={T.divider}>
      <WaBar title="Unlock your plan" onBack={onBack} />
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Hero card */}
        <div className="m-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-medium" style={{ color: T.sub }}>Today</div>
              <div className="text-[36px] font-semibold leading-none tabular-nums" style={{ color: hero.leftColor }}>{hero.left}</div>
            </div>
            <TrendingUp className="w-5 h-5" style={{ color: T.sub }} />
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider font-medium" style={{ color: T.sub }}>Target</div>
              <div className="text-[36px] font-semibold leading-none tabular-nums" style={{ color: T.green }}>{hero.right}</div>
            </div>
          </div>
          <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: T.divider }}>
            <div className="h-full" style={{ width: `${heroPct * 100}%`, background: T.green }} />
          </div>
          <div className="mt-3 text-[13px] font-medium" style={{ color: T.ink }}>{hero.line}</div>
        </div>

        {/* Tasks */}
        {tasksCount > 0 && (
          <div className="mx-3 rounded-lg bg-white shadow-sm overflow-hidden">
            <div className="px-4 pt-3 pb-1 text-[12px] font-medium" style={{ color: T.teal }}>Fix these first</div>
            {distressedTasks.slice(0, 3).map((t, idx) => (
              <div
                key={t.id}
                className="flex items-start justify-between px-4 py-3"
                style={{ borderTop: idx === 0 ? "none" : `1px solid ${T.divider}` }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium" style={{ color: T.ink }}>{t.title}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: T.sub }}>{t.desc}</div>
                </div>
                <div className="ml-3 shrink-0 px-2 py-0.5 rounded-md text-[12px] font-semibold" style={{ background: T.bubbleOut, color: T.tealDark }}>
                  +{t.impact}
                </div>
              </div>
            ))}
            {tasksCount > 3 && (
              <div className="px-4 py-2.5 text-[12px]" style={{ borderTop: `1px solid ${T.divider}`, color: T.sub }}>
                and {tasksCount - 3} more inside
              </div>
            )}
          </div>
        )}

        {/* Value stack */}
        <div className="mx-3 mt-3 rounded-lg bg-white shadow-sm p-4">
          <div className="text-[12px] font-medium mb-2" style={{ color: T.teal }}>What you get</div>
          {[
            { icon: Bot, t: "Arjun, your credit coach, 24×7" },
            { icon: TrendingUp, t: "Monthly score tracking" },
            { icon: BellRing, t: "Enquiry, error & fraud alerts" },
            { icon: FileText, t: "Dispute help + full report" },
          ].map(({ icon: Ic, t }) => (
            <div key={t} className="flex items-center gap-3 py-1.5 text-[14px]" style={{ color: T.ink }}>
              <Ic className="w-4 h-4 shrink-0" style={{ color: T.teal }} />
              {t}
            </div>
          ))}
        </div>

        <div className="p-4 mt-2 flex flex-col items-center gap-2 sticky bottom-0" style={{ background: T.divider }}>
          <PrimaryBtn onClick={onPay}>
            {isNTC ? "START BUILDING FOR ₹9" : "FIX THESE FOR ₹9"}
          </PrimaryBtn>
          <p className="text-[11px] text-center leading-snug" style={{ color: T.sub }}>
            <b style={{ color: T.ink }}>₹9 today</b> · ₹99/mo starts in 3 days · reminder 1 day before · cancel anytime
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
    <Phone bg="#fff">
      <WaBar title="Restart subscription" onBack={onBack} />
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6 items-center text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#FEF3C7" }}>
          <AlertTriangle className="w-7 h-7" style={{ color: T.amber }} />
        </div>
        <h2 className="mt-4 text-[22px] font-medium" style={{ color: T.ink }}>Welcome back, {user.name.split(" ")[0]}</h2>
        <p className="mt-2 text-[14px]" style={{ color: T.sub }}>
          Your subscription ended. Restart to see today's score and unlock your coach.
        </p>

        <div className="mt-6 w-full rounded-lg bg-white p-5 shadow-sm border" style={{ borderColor: T.line }}>
          <div className="flex items-baseline justify-between">
            <span className="text-[14px]" style={{ color: T.ink }}>Monthly plan</span>
            <span className="text-[32px] font-semibold" style={{ color: T.ink }}>
              ₹99<span className="text-[12px] font-normal" style={{ color: T.sub }}>/mo</span>
            </span>
          </div>
          <div className="mt-4 space-y-2 text-[13px] text-left" style={{ color: T.ink }}>
            {["Fresh report + updated score", "Coach, alerts, disputes", "Cancel anytime"].map((v) => (
              <div key={v} className="flex items-center gap-2.5">
                <Check className="w-4 h-4" style={{ color: T.green }} /> {v}
              </div>
            ))}
          </div>
        </div>

        {user.score && (
          <div className="mt-4 w-full rounded-lg px-4 py-2.5 flex items-center justify-between" style={{ background: T.bubbleOut }}>
            <span className="text-[12px]" style={{ color: T.tealDark }}>Last known score</span>
            <span className="text-[18px] font-semibold" style={{ color: T.tealDark }}>{user.score}</span>
          </div>
        )}

        <div className="flex-1" />
        <div className="w-full pt-6 flex flex-col items-center gap-2">
          <PrimaryBtn onClick={onPay}>RESTART FOR ₹99</PrimaryBtn>
          <p className="text-[11px]" style={{ color: T.subLight }}>You'll be charged today. Cancel anytime.</p>
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
    <Phone bg="#fff">
      <WaBar title="Razorpay" onBack={onBack} />
      <div className="flex-1 flex flex-col px-5 pt-5 pb-5">
        <div className="rounded-lg p-5 text-center" style={{ background: T.tealDark, color: "#fff" }}>
          <div className="text-[11px] uppercase tracking-widest opacity-80">Total payable</div>
          <div className="mt-1 text-[40px] font-semibold">₹{amount}</div>
          {amount === 9 && <div className="text-[11px] opacity-80 mt-1">₹99/mo starts in 3 days</div>}
        </div>
        <div className="mt-5 text-[12px] font-medium" style={{ color: T.teal }}>PAYMENT METHOD</div>
        <div className="mt-2 space-y-1.5">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className="w-full text-left p-3.5 rounded-lg border flex items-center gap-3 bg-white transition"
              style={{ borderColor: method === m.id ? T.teal : T.line }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: method === m.id ? T.teal : "#B4B7BA" }}
              >
                {method === m.id && <div className="w-2 h-2 rounded-full" style={{ background: T.teal }} />}
              </div>
              <span className="text-[14px]" style={{ color: T.ink }}>{m.t}</span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex justify-center">
          <PrimaryBtn onClick={() => { setBusy(true); setTimeout(onSuccess, 900); }} disabled={busy}>
            {busy ? "PROCESSING…" : `PAY ₹${amount}`}
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
    <Phone bg="#fff">
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: T.green }}>
          <Check className="w-9 h-9 text-white" strokeWidth={3} />
        </div>
        <div className="text-[18px] font-medium" style={{ color: T.ink }}>Payment successful</div>
        <div className="text-[13px]" style={{ color: T.sub }}>Setting up your coach…</div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   13. HOME STUB — WhatsApp chat list
   ===================================================================== */
export function HomeStub({ user, onRestart }: { user: DemoUser; onRestart: () => void }) {
  const chats = user.hasScore
    ? [
        { name: "Arjun · your coach", msg: `Your score is ${user.score}. Let's fix 3 things today.`, time: "now", unread: 3, pinned: true },
        { name: "Score updates", msg: "New report available", time: "9:12 AM", unread: 1 },
        { name: "Disputes", msg: "HDFC responded to your query", time: "Yesterday" },
        { name: "Alerts", msg: "New enquiry from Bajaj Finance", time: "Yesterday" },
      ]
    : [
        { name: "Arjun · your coach", msg: "Welcome! Let's set up your first card.", time: "now", unread: 2, pinned: true },
        { name: "Getting started", msg: "3 steps to your first score", time: "9:12 AM", unread: 1 },
      ];
  return (
    <Phone bg="#fff">
      <div className="h-14 flex items-center justify-between px-4 shrink-0" style={{ background: T.tealDark, color: "#fff" }}>
        <div className="font-medium text-[19px]">GroScore</div>
        <div className="flex items-center gap-5">
          <Camera className="w-5 h-5" />
          <Search className="w-5 h-5" />
          <MoreVertical className="w-5 h-5" />
        </div>
      </div>
      {/* Tabs */}
      <div className="flex items-center px-4 gap-6 text-[13px] font-medium shrink-0" style={{ background: T.tealDark, color: "rgba(255,255,255,0.7)" }}>
        {["CHATS", "STATUS", "CALLS"].map((t, i) => (
          <div key={t} className="py-2.5 pb-3" style={{
            color: i === 0 ? "#fff" : undefined,
            borderBottom: i === 0 ? "3px solid #fff" : "3px solid transparent",
          }}>{t}</div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((c) => {
          const initials = c.name.split(" ")[0].slice(0, 2).toUpperCase();
          return (
            <div key={c.name} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${T.divider}` }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[15px] font-medium shrink-0" style={{ background: T.teal }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[15px] font-medium truncate" style={{ color: T.ink }}>{c.name}</span>
                  <span className="text-[11px] shrink-0" style={{ color: c.unread ? T.green : T.subLight }}>{c.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="text-[13px] truncate" style={{ color: T.sub }}>{c.msg}</span>
                  {c.unread ? (
                    <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold text-white flex items-center justify-center" style={{ background: T.green }}>
                      {c.unread}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}

        <div className="px-4 py-6 text-center text-[12px]" style={{ color: T.subLight }}>
          Signed in as {user.name}
          <div className="mt-3">
            <SecondaryBtn onClick={onRestart}>Restart demo</SecondaryBtn>
          </div>
        </div>
      </div>

      {/* FAB */}
      <div className="absolute" style={{ bottom: 24, right: 20 }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: T.green }}>
          <MessageCircle className="w-6 h-6 text-white" fill="white" strokeWidth={0} />
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
    <Phone bg="#fff">
      <WaBar title="Something went wrong" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: T.dangerSoft }}>
          <X className="w-7 h-7" style={{ color: T.danger }} />
        </div>
        <div className="font-medium text-[16px]" style={{ color: T.ink }}>{msg}</div>
        <PrimaryBtn onClick={onRetry}>RETRY</PrimaryBtn>
      </div>
    </Phone>
  );
}

/* Suppress unused-import lint */
const _unused = { useMemo };
export default _unused;

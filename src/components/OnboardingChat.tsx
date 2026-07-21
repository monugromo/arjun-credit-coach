import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Phone, MoreVertical, Send, Lock, CheckCheck, Loader2, ShieldCheck, Sparkles, TrendingUp, BadgeCheck, Bell, MessageCircle, FileText, X } from "lucide-react";
import kabirImg from "@/assets/kabir.jpg";
import panCardRef from "@/assets/pan-card-ref.png";
import { DEMOS, maskPan, distressedTasks, type DemoUser } from "@/lib/groscore-data";

/* ============================================================
   Onboarding — WhatsApp-style chat with Arjun (mock)
   ============================================================ */

const BRAND = {
  header: "#1c6b4f",
  accent: "#4bbf72",
  accentDark: "#3aa762",
  ink: "#0e1b2a",
  muted: "#6b7a86",
  chatBg: "#e7ece5",
  bubbleIn: "#ffffff",
  bubbleOut: "#d7f4de",
  card: "#f4f8f4",
  hair: "#e3e8e2",
  tick: "#34B7F1",
};

type UserState = "new" | "active" | "lapsed";
type BureauResult = "hit" | "nohit";

interface Task { title: string; points: number; urgent?: boolean }

type Msg =
  | { id: string; from: "coach"; kind: "text"; text: string }
  | { id: string; from: "coach"; kind: "confirm"; user: DemoUser }
  | { id: string; from: "coach"; kind: "pan-card" }
  | { id: string; from: "coach"; kind: "analyze" }
  | { id: string; from: "coach"; kind: "paywall"; score?: number; tasks: Task[]; isNTC: boolean; amount: 9 | 99 }
  | { id: string; from: "user"; kind: "text"; text: string }
  | { id: string; from: "system"; text: string };

type Input =
  | { kind: "none" }
  | { kind: "mobile" }
  | { kind: "otp" }
  | { kind: "text"; placeholder: string; onSubmit: (v: string) => void; numeric?: boolean; maxLength?: number; uppercase?: boolean }
  | { kind: "quick"; options: { label: string; primary?: boolean; onTap: () => void }[] };

const nowTime = () => {
  const d = new Date();
  let h = d.getHours(); const m = d.getMinutes();
  const ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
};
const uid = () => Math.random().toString(36).slice(2, 9);
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function OnboardingChat({
  onDone,
  onBack,
}: {
  onDone: (user: DemoUser) => void;
  onBack: () => void;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [times, setTimes] = useState<Record<string, string>>({});
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState<Input>({ kind: "none" });
  const [user, setUser] = useState<DemoUser | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, input]);

  const pushCoach = async (text: string) => {
    setTyping(true);
    await sleep(Math.min(700 + text.length * 18, 2200));
    setTyping(false);
    const id = uid();
    setMsgs((m) => [...m, { id, from: "coach", kind: "text", text }]);
    setTimes((t) => ({ ...t, [id]: nowTime() }));
    await sleep(220);
  };
  const pushCoachRich = async (msg: Omit<Msg, "id">) => {
    setTyping(true);
    await sleep(900);
    setTyping(false);
    const id = uid();
    setMsgs((m) => [...m, { ...(msg as Msg), id }]);
    setTimes((t) => ({ ...t, [id]: nowTime() }));
    await sleep(220);
  };
  const pushUser = (text: string) => {
    const id = uid();
    setMsgs((m) => [...m, { id, from: "user", kind: "text", text }]);
    setTimes((t) => ({ ...t, [id]: nowTime() }));
  };
  const pushSystem = (text: string) => {
    setMsgs((m) => [...m, { id: uid(), from: "system", text }]);
  };

  /* ---------------- FLOW ---------------- */
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      pushSystem("Today");
      await sleep(400);
      await pushCoach("Namaste! Main Arjun 👋 Aapka personal credit coach.");
      await pushCoach("2 minute mein aapki poori credit report nikaalte hain — bilkul free check, score par koi asar nahi. 🔒");
      await pushCoach("Chaliye shuru karein — apna mobile number batayein.");
      setInput({ kind: "mobile" });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMobile = async (phone: string) => {
    const u = DEMOS[phone];
    if (!u) {
      alert("Try demo: 9876500001 (NTC) · 9876500002 (Distressed) · 9876500003 (Lapsed)");
      return;
    }
    setUser(u);
    pushUser(`+91 ${phone.slice(0, 5)} ${phone.slice(5)}`);
    setInput({ kind: "none" });
    await sleep(400);
    await pushCoach("OTP bhej diya ✅ Detect kar raha hoon…");
    setInput({ kind: "otp" });
  };

  const handleOtpDone = async () => {
    const u = user!;
    pushUser("Code verified");
    setInput({ kind: "none" });
    await sleep(300);
    await pushCoach("Number verified ✅");

    // Branch on userState (derived from demo)
    const userState: UserState = u.expired ? "lapsed" : "new";
    if (userState === "lapsed") {
      await pushCoach(`Wapas swaagat hai, ${u.name} 🙏 Aapka trial khatam ho gaya tha.`);
      await pushCoachRich({
        from: "coach", kind: "paywall",
        score: u.score, tasks: [], isNTC: false, amount: 99,
      });
      return;
    }
    // NEW user → ask name
    await pushCoach("Ab apna naam batayein — jaisa aapke PAN card par likha hai.");
    await pushCoachRich({ from: "coach", kind: "pan-card" });
    setInput({
      kind: "text", placeholder: "Full name (as on PAN)", uppercase: true,
      onSubmit: (v) => handleName(v.trim()),
    });
  };

  const handleName = async (n: string) => {
    if (!n) return;
    pushUser(n);
    setInput({ kind: "none" });
    await sleep(400);
    await pushCoach(`Thanks ${n.split(" ")[0]}!`);
    await pushCoach("Equifax se aapki details check kar raha hoon… ⏳");
    await sleep(1400);
    const u = user!;
    const bureauResult: BureauResult = u.hasScore ? "hit" : "nohit";
    if (bureauResult === "hit") {
      await pushCoachRich({ from: "coach", kind: "confirm", user: u });
    } else {
      await pushCoach("Aapki koi credit history nahi mili — koi baat nahi! 🌱");
      await pushCoach("Confirm karne ke liye apna PAN number daalein.");
      setInput({
        kind: "text", placeholder: "PAN (e.g. ABCDE1234F)", uppercase: true, maxLength: 10,
        onSubmit: (v) => handlePanNTC(v.trim().toUpperCase()),
      });
    }
  };

  const handleConfirmYes = async () => {
    pushUser("✅ Haan, yeh main hoon");
    await runAnalyze(false);
  };
  const handleConfirmNo = async () => {
    pushUser("❌ Nahi");
    await pushCoach("Koi baat nahi 🙂 Apna PAN number daalein, main dobara sahi report nikaalta hoon.");
    setInput({
      kind: "text", placeholder: "PAN (e.g. ABCDE1234F)", uppercase: true, maxLength: 10,
      onSubmit: async (v) => {
        pushUser(v.toUpperCase());
        setInput({ kind: "none" });
        await pushCoach("Equifax se dobara check kar raha hoon… ⏳");
        await sleep(1400);
        await pushCoachRich({ from: "coach", kind: "confirm", user: user! });
      },
    });
  };
  const handlePanNTC = async (pan: string) => {
    if (pan.length < 10) { alert("Enter 10-char PAN"); return; }
    pushUser(pan);
    setInput({ kind: "none" });
    await pushCoach("Ek baar aur try karta hoon… ⏳");
    await sleep(1200);
    await pushCoach("Confirmed — abhi koi credit history nahi hai. Yeh actually acchi baat hai — clean slate. 🌱");
    await runAnalyze(true);
  };

  const runAnalyze = async (isNTC: boolean) => {
    await pushCoachRich({ from: "coach", kind: "analyze" });
    await sleep(2200);
    const u = user!;
    const tasks: Task[] = isNTC ? [] : distressedTasks.slice(0, 6).map((t) => ({
      title: t.title, points: t.impact, urgent: t.status === "todo" && t.impact > 60,
    }));
    await pushCoachRich({
      from: "coach", kind: "paywall",
      score: u.score, tasks, isNTC, amount: 9,
    });
  };

  const startPayment = async (amount: 9 | 99) => {
    pushUser(amount === 9 ? "Trial shuru karo · ₹9" : "Restart · ₹99");
    setInput({ kind: "none" });
    await sleep(600);
    await pushCoach("Razorpay khol raha hoon… 🔒");
    await sleep(1400);
    await pushCoach(`Trial shuru · ₹${amount} paid ✓`);
    await sleep(500);
    onDone(user!);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: BRAND.chatBg }}>
      {/* WhatsApp header */}
      <div className="flex items-center gap-2 px-2 h-14 text-white shrink-0" style={{ background: BRAND.header }}>
        <button onClick={onBack} className="p-1"><ChevronLeft className="w-6 h-6" /></button>
        <img src={kabirImg} alt="" className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[16px] leading-tight truncate">Arjun · GroScore</div>
          <div className="text-[11px] opacity-90">online</div>
        </div>
        <button className="p-2"><Phone className="w-5 h-5" /></button>
        <button className="p-2"><MoreVertical className="w-5 h-5" /></button>
      </div>

      {/* Chat body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5"
        style={{
          backgroundColor: BRAND.chatBg,
          backgroundImage:
            "radial-gradient(rgba(28,107,79,0.06) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        {msgs.map((m) => (
          <MsgRow
            key={m.id}
            msg={m}
            time={times[m.id] || ""}
            onConfirmYes={handleConfirmYes}
            onConfirmNo={handleConfirmNo}
            onPay={startPayment}
          />
        ))}
        {typing && <TypingBubble />}
      </div>

      {/* Input zone */}
      <div className="shrink-0 border-t" style={{ borderColor: BRAND.hair, background: "#f6f7f5" }}>
        <InputZone input={input} onMobile={handleMobile} onOtpDone={handleOtpDone} />
      </div>
    </div>
  );
}

/* ---------------- Message rows ---------------- */

function MsgRow({
  msg, time, onConfirmYes, onConfirmNo, onPay,
}: {
  msg: Msg; time: string;
  onConfirmYes: () => void; onConfirmNo: () => void;
  onPay: (amount: 9 | 99) => void;
}) {
  if (msg.from === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[11px] px-2.5 py-1 rounded-md bg-white/80 text-gray-600 shadow-sm">{msg.text}</span>
      </div>
    );
  }
  const isUser = msg.from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-[14px] px-2.5 py-1.5 shadow-sm ${isUser ? "rounded-tr-[4px]" : "rounded-tl-[4px]"}`}
        style={{ background: isUser ? BRAND.bubbleOut : BRAND.bubbleIn }}
      >
        {msg.from === "coach" && msg.kind === "text" && (
          <div className="text-[14.5px] leading-[1.35] text-gray-900 whitespace-pre-line">{msg.text}</div>
        )}
        {msg.from === "user" && (
          <div className="text-[14.5px] leading-[1.35] text-gray-900 whitespace-pre-line">{msg.text}</div>
        )}
        {msg.from === "coach" && msg.kind === "confirm" && (
          <ConfirmCard user={msg.user} onYes={onConfirmYes} onNo={onConfirmNo} />
        )}
        {msg.from === "coach" && msg.kind === "pan-card" && <PanCardIllustration />}
        {msg.from === "coach" && msg.kind === "analyze" && <AnalyzeCard />}
        {msg.from === "coach" && msg.kind === "paywall" && (
          <Paywall score={msg.score} tasks={msg.tasks} isNTC={msg.isNTC} amount={msg.amount} onPay={() => onPay(msg.amount)} />
        )}
        <div className={`flex items-center gap-1 mt-0.5 ${isUser ? "justify-end" : "justify-start"}`}>
          <span className="text-[10.5px] text-gray-500">{time}</span>
          {isUser && <CheckCheck className="w-3.5 h-3.5" style={{ color: BRAND.tick }} />}
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-[14px] rounded-tl-[4px] bg-white shadow-sm px-3 py-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Cards ---------------- */

function PanCardIllustration() {
  return (
    <div className="mt-1 rounded-lg overflow-hidden border" style={{ borderColor: BRAND.hair }}>
      <img src={panCardRef} alt="PAN card reference" className="w-full h-auto block" />
      <div className="text-[11px] text-gray-600 px-2 py-1 bg-white">Enter your name exactly as printed on your PAN.</div>
    </div>
  );
}

function ConfirmCard({ user, onYes, onNo }: { user: DemoUser; onYes: () => void; onNo: () => void }) {
  return (
    <div className="mt-1 w-[260px]">
      <div className="rounded-xl p-3" style={{ background: BRAND.card, border: `1px solid ${BRAND.hair}` }}>
        <div className="text-[13px] font-bold text-gray-900 mb-2">Yeh aap hain? 🪪</div>
        <div className="text-[12.5px] text-gray-700 space-y-1">
          <div><span className="text-gray-500">Naam:</span> {user.name.toUpperCase()} V••••</div>
          <div><span className="text-gray-500">PAN:</span> {maskPan(user.pan)}</div>
          <div><span className="text-gray-500">Janm varsh:</span> ••/••/1994</div>
        </div>
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        <button onClick={onYes} className="w-full text-white font-semibold text-[13.5px] py-2 rounded-full" style={{ background: BRAND.accent }}>
          ✅ Haan, yeh main hoon
        </button>
        <button onClick={onNo} className="w-full font-semibold text-[13.5px] py-2 rounded-full border" style={{ borderColor: BRAND.hair, color: BRAND.ink }}>
          ❌ Nahi
        </button>
      </div>
    </div>
  );
}

function AnalyzeCard() {
  const steps = [
    "Credit report fetch kiya",
    "Issues analyze kiye",
    "Dispute plan taiyaar",
    "Arjun ready hai",
  ];
  const [done, setDone] = useState<number>(0);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDone(i);
      if (i >= steps.length) clearInterval(t);
    }, 450);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="mt-1 w-[260px] rounded-xl p-3" style={{ background: BRAND.card, border: `1px solid ${BRAND.hair}` }}>
      <div className="text-[12.5px] font-bold text-gray-900 mb-2 flex items-center gap-1.5">
        <Loader2 className={`w-3.5 h-3.5 ${done < steps.length ? "animate-spin" : "hidden"}`} />
        Analyzing…
      </div>
      <ul className="space-y-1">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2 text-[12.5px]">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] ${i < done ? "" : "opacity-30"}`}
              style={{ background: BRAND.accent }}>✓</span>
            <span className={i < done ? "text-gray-900" : "text-gray-400"}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Paywall ---------------- */

function ScoreGauge({ from, to }: { from: number; to: number }) {
  const [val, setVal] = useState(from);
  useEffect(() => {
    const start = performance.now(); const dur = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setVal(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to]);
  const pct = Math.max(0, Math.min(1, (val - 300) / (900 - 300)));
  const color = val < 550 ? "#e14343" : val < 700 ? "#e2a03f" : "#2ea968";
  const r = 46, c = 2 * Math.PI * r;
  const dash = c * 0.75; // 3/4 arc
  const offset = dash * (1 - pct);
  return (
    <div className="relative w-[120px] h-[80px] mx-auto">
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <path d="M10,72 A50,50 0 0,1 110,72" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
        <path d="M10,72 A50,50 0 0,1 110,72" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={dash} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <div className="text-[20px] font-extrabold" style={{ color }}>{val}</div>
      </div>
    </div>
  );
}

function Paywall({ score, tasks, isNTC, amount, onPay }: {
  score?: number; tasks: Task[]; isNTC: boolean; amount: 9 | 99; onPay: () => void;
}) {
  const sumPoints = tasks.reduce((a, t) => a + t.points, 0);
  const hero = isNTC
    ? "Naya credit? Clean slate — score zero se banayein."
    : tasks.length >= 1 && (score ?? 0) < 700
      ? `+${sumPoints} points tak badha sakte hain — yeh ${tasks.length} theek karein.`
      : score && score < 700
        ? `Aapka score ${score}. Le chalein 750+ tak.`
        : "Score protect karein — errors & fraud pakdein.";

  const top = [...tasks].sort((a, b) => b.points - a.points).slice(0, 3);
  const extra = Math.max(0, tasks.length - 3);
  const cta = amount === 99
    ? "Restart karein — ₹99"
    : isNTC ? "Score banana shuru karein — ₹9"
      : tasks.length ? "In ko fix karein — ₹9 se shuru"
        : "Trial shuru karein — ₹9";

  return (
    <div className="mt-1 w-[300px] rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${BRAND.hair}` }}>
      {/* Hero */}
      <div className="p-3 text-center" style={{ background: "linear-gradient(180deg,#f0faf3,#ffffff)" }}>
        <ScoreGauge from={score ?? 300} to={isNTC ? 300 : 750} />
        <div className="text-[13px] font-semibold text-gray-800 mt-1 leading-snug">{hero}</div>
      </div>

      {/* Task module */}
      {tasks.length >= 1 && (
        <div className="px-3 pb-2">
          <div className="text-[10.5px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">
            {tasks.length >= 3 ? "Top fixes" : "Aapki sabse tez jeet"}
          </div>
          <ul className="space-y-1">
            {top.map((t) => (
              <li key={t.title} className="flex items-center gap-2 text-[12.5px] text-gray-800">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: BRAND.accent }} />
                <span className="flex-1 truncate">{t.title}</span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#DCFCE7", color: "#166534" }}>+{t.points}</span>
              </li>
            ))}
            {extra > 0 && <li className="text-[11.5px] text-gray-500 pl-3.5">aur {extra} aur</li>}
          </ul>
        </div>
      )}

      {/* Value stack */}
      <div className="px-3 pb-2 pt-1 space-y-1.5">
        {[
          { i: MessageCircle, t: "Arjun 24×7 personal coach" },
          { i: TrendingUp, t: "Har mahine score tracking" },
          { i: Bell, t: "Naye enquiry / error / fraud ke alerts" },
          { i: FileText, t: "Dispute help + full credit report" },
        ].map(({ i: Icon, t }) => (
          <div key={t} className="flex items-center gap-2 text-[12.5px] text-gray-800">
            <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#eaf6ee" }}>
              <Icon className="w-3.5 h-3.5" style={{ color: BRAND.header }} />
            </span>
            {t}
          </div>
        ))}
      </div>

      {/* Price */}
      <div className="px-3 py-2 mx-3 mb-2 rounded-lg flex items-center justify-between" style={{ background: "#f0faf3" }}>
        <div>
          <div className="text-[11px] text-gray-500 line-through">₹299</div>
          <div className="text-[16px] font-extrabold text-gray-900 leading-none">
            ₹{amount} <span className="text-[11px] font-medium text-gray-600">/{amount === 9 ? "3 din" : "month"}</span>
          </div>
          <div className="text-[10.5px] text-gray-600 mt-0.5">
            {amount === 9 ? "Uske baad ₹99/mo · Cancel anytime" : "Cancel anytime · Razorpay"}
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: "#DCFCE7", color: "#166534" }}>
          {amount === 9 ? "TRIAL · 67% OFF" : "RESTART"}
        </span>
      </div>

      {/* CTA */}
      <div className="px-3 pb-3">
        <button
          onClick={onPay}
          className="w-full text-white font-bold text-[14px] py-3 rounded-full shadow-sm active:scale-[0.99]"
          style={{ background: BRAND.accent }}
        >
          {cta}
        </button>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-[10.5px] text-gray-500">
          <Lock className="w-3 h-3" /> Soft check · 1.2 lakh Indians started here.
        </div>
      </div>
    </div>
  );
}

/* ---------------- Input zone ---------------- */

function InputZone({
  input, onMobile, onOtpDone,
}: {
  input: Input;
  onMobile: (phone: string) => void;
  onOtpDone: () => void;
}) {
  if (input.kind === "none") {
    return (
      <div className="px-4 py-3 text-center text-[12px] text-gray-500">
        <Loader2 className="w-3.5 h-3.5 inline-block mr-1 animate-spin align-[-2px]" />
        Arjun typing…
      </div>
    );
  }
  if (input.kind === "mobile") return <MobileComposer onSubmit={onMobile} />;
  if (input.kind === "otp") return <OtpBoxes onDone={onOtpDone} />;
  if (input.kind === "quick") {
    return (
      <div className="p-2 flex flex-wrap gap-2 justify-end">
        {input.options.map((o, i) => (
          <button key={i} onClick={o.onTap}
            className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border ${o.primary ? "text-white" : "bg-white text-gray-800"}`}
            style={o.primary ? { background: BRAND.accent, borderColor: BRAND.accent } : { borderColor: BRAND.hair }}>
            {o.label}
          </button>
        ))}
      </div>
    );
  }
  // text
  return <TextComposer key={input.placeholder} input={input} />;
}

function MobileComposer({ onSubmit }: { onSubmit: (v: string) => void }) {
  const [v, setV] = useState("");
  const [consent, setConsent] = useState(true);
  return (
    <div className="p-2.5">
      <label className="flex items-center gap-2 px-2 pb-2 text-[11.5px] text-gray-600">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="accent-[#4bbf72]" />
        <ShieldCheck className="w-3.5 h-3.5" style={{ color: BRAND.header }} />
        Fetch my credit report — soft check, won't affect my score.
      </label>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-white rounded-full px-3 py-2 border" style={{ borderColor: BRAND.hair }}>
          <span className="text-[14px] text-gray-500 mr-1.5">+91</span>
          <input
            inputMode="numeric" maxLength={10}
            value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit mobile"
            className="flex-1 outline-none text-[15px] bg-transparent"
          />
        </div>
        <button
          disabled={v.length !== 10 || !consent}
          onClick={() => onSubmit(v)}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white disabled:opacity-40"
          style={{ background: BRAND.accent }}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function OtpBoxes({ onDone }: { onDone: () => void }) {
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const target = "1234";
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDigits(target.slice(0, i).split("").concat(Array(4 - i).fill("")));
      if (i >= 4) {
        clearInterval(t);
        setTimeout(onDone, 500);
      }
    }, 450);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="p-3">
      <div className="text-[11.5px] text-gray-600 text-center mb-2 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" style={{ color: BRAND.accent }} />
        Detecting code from SMS…
      </div>
      <div className="flex justify-center gap-2.5">
        {digits.map((d, i) => (
          <div key={i}
            className="w-11 h-12 rounded-lg border-2 bg-white flex items-center justify-center text-[20px] font-bold"
            style={{ borderColor: d ? BRAND.accent : BRAND.hair, color: BRAND.ink }}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

function TextComposer({ input }: { input: Extract<Input, { kind: "text" }> }) {
  const [v, setV] = useState("");
  const submit = () => {
    let val = v.trim();
    if (input.uppercase) val = val.toUpperCase();
    if (!val) return;
    input.onSubmit(val);
    setV("");
  };
  return (
    <div className="p-2.5 flex items-center gap-2">
      <div className="flex-1 flex items-center bg-white rounded-full px-3 py-2 border" style={{ borderColor: BRAND.hair }}>
        <input
          value={v}
          onChange={(e) => setV(input.uppercase ? e.target.value.toUpperCase() : e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          inputMode={input.numeric ? "numeric" : "text"}
          maxLength={input.maxLength}
          placeholder={input.placeholder}
          className="flex-1 outline-none text-[15px] bg-transparent"
          autoFocus
        />
      </div>
      <button onClick={submit} disabled={!v.trim()}
        className="w-11 h-11 rounded-full flex items-center justify-center text-white disabled:opacity-40"
        style={{ background: BRAND.accent }}>
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}

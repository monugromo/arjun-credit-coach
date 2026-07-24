import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Phone, MoreVertical, ChevronLeft, ChevronDown, Send, Paperclip,
  Camera, Smile, Mic, FileText, Lock, User, Settings, MessageCircle,
  LogOut, Download, PhoneOff, Volume2, MicOff, Bell, MessageSquare,
  Mail, CheckCircle2, ArrowRight, Sparkles, ShieldAlert, Edit2,
  ChevronRight, Share,
  CheckCheck, X, AlertTriangle, TrendingUp, Loader2, Briefcase, Award,
  Layers, Search, UserPlus, Wallet, BadgeCheck, Zap,
} from "lucide-react";
import kabirImg from "@/assets/kabir.jpg";
import groLogo from "@/assets/GroScore.svg";
import panCardRef from "@/assets/pan-card-ref.png";
import reportPreview from "@/assets/report-preview.jpg";
import actionPlanPreview from "@/assets/action-plan-preview.jpg";
import scoreProjection from "@/assets/score-projection.jpg";
import {
  DEMOS, maskPan, distressedTasks, ntcTasks, distressedFactors,
  fdCards, updatesFeed, initialChat, type DemoUser, type ChatMsg, type FdCard,
} from "@/lib/groscore-data";

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

/* ----------------- WhatsApp tokens ----------------- */
const WA = {
  green: "#075E54",        // header
  greenDark: "#054C44",
  accent: "#25D366",       // CTA
  tick: "#34B7F1",
  bubbleOut: "#DCF8C6",
  bg: "#ECE5DD",           // chat list bg (we use white per request)
};

// WhatsApp-style doodle SVG (light gray icons over white).
const DOODLE_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320' viewBox='0 0 320 320'>
  <g fill='none' stroke='%23000' stroke-opacity='0.05' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'>
    <circle cx='40' cy='40' r='14'/>
    <path d='M30 38 q10 -14 20 0'/>
    <path d='M90 70 l10 0 l5 -8 l5 8 l10 0 l-8 6 l3 10 l-10 -6 l-10 6 l3 -10 z'/>
    <rect x='160' y='30' width='34' height='22' rx='4'/>
    <path d='M160 36 l17 12 l17 -12'/>
    <path d='M230 60 a14 14 0 1 0 -1 -14'/>
    <path d='M30 130 q15 -10 30 0 q15 10 30 0'/>
    <circle cx='130' cy='140' r='10'/>
    <path d='M120 140 l-8 -8 M140 140 l8 -8 M130 130 l0 -10'/>
    <path d='M200 130 l8 -16 l8 16 l16 2 l-12 10 l4 16 l-16 -8 l-16 8 l4 -16 l-12 -10 z'/>
    <rect x='260' y='120' width='30' height='40' rx='4'/>
    <path d='M266 132 h18 M266 140 h18 M266 148 h10'/>
    <circle cx='60' cy='220' r='12'/>
    <path d='M50 230 l-6 14 M70 230 l6 14'/>
    <path d='M130 210 q20 -20 40 0 q-20 20 -40 0 z'/>
    <circle cx='150' cy='210' r='3'/>
    <path d='M220 220 l10 -4 l10 4 l-4 10 l4 10 l-10 -4 l-10 4 l4 -10 z'/>
    <path d='M280 250 l-10 10 l10 10 l10 -10 z'/>
    <path d='M40 290 l8 -8 l8 8 l8 -8 l8 8'/>
    <circle cx='180' cy='285' r='10'/>
    <path d='M170 285 h20 M180 275 v20'/>
  </g>
</svg>
`.replace(/\n/g, "").replace(/\s+/g, " ");
const DOODLE_URL = `url("data:image/svg+xml;utf8,${DOODLE_SVG}")`;

type Screen =
  | "landing" | "phone" | "otp" | "name" | "fetch" | "panInput"
  | "bureau-validate" | "bureau-fetching" | "bureau-refetch"
  | "ntc2-fetch" | "ntc2-nohistory" | "ntc2-edit"
  | "panValidate" | "expired" | "payment" | "payment-success"
  | "perm-all" | "perm-blocked" | "perm-email-intro" | "loading-email" | "perm-email" | "loading-journey" | "score-journey"
  | "ntc-checklist"
  | "chat" | "call-incoming" | "call-active"
  | "report" | "tasks" | "arjun-profile"
  | "profile" | "subscription" | "help";

type ChatPhase = "intro" | "awaiting-consent" | "in-call" | "post-call";

function Index() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState<DemoUser | null>(null);
  const [name, setName] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatPhase, setChatPhase] = useState<ChatPhase>("intro");
  const [tasks, setTasks] = useState(distressedTasks);
  const [reportUpdated, setReportUpdated] = useState(false);
  const [tasksUpdated, setTasksUpdated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const streamingRef = useRef(false);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [bureauUpdated, setBureauUpdated] = useState(false);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const typingDelay = (msg: Partial<ChatMsg>) => {
    if (msg.kind === "text" && msg.text) return Math.min(900 + msg.text.length * 22, 2600);
    if (msg.kind === "report" || msg.kind === "plan") return 1400;
    if (msg.kind === "fdCarousel") return 1600;
    if (msg.kind === "task") return 1200;
    return 900;
  };
  const streamCoach = async (items: Array<Omit<ChatMsg, "time">>) => {
    for (const item of items) {
      if (item.from === "coach") {
        setTyping(true);
        await sleep(typingDelay(item));
        setTyping(false);
        await sleep(120);
      } else {
        await sleep(400);
      }
      setChat((c) => [...c, { ...item, time: nowTime() } as ChatMsg]);
      await sleep(280);
    }
  };

  const go = (s: Screen) => { setMenuOpen(false); setScreen(s); };

  const onPhoneSubmit = () => {
    const u = DEMOS[phone];
    if (!u) { alert("Use demo phone 9876500001 (NTC), 9876500002 (Distressed), 9876500003 (Expired), 9876500004 (Direct), 9876500005 (NTC · No history), 9876500006 (NTC · PAN re-fetch) or 9876500007 (Ishaan · NTC)"); return; }
    setUser(u);
    setName(u.name);
    go("otp");
  };

  const startChatFlow = (u: DemoUser) => {
    setChat([]);
    setChatPhase("intro");
    setTasks(u.key === "distressed" ? distressedTasks : ntcTasks);
    go("chat");
  };

  // Auto-play intro stream when entering chat for the first time, then show call popup
  useEffect(() => {
    if (screen !== "chat" || !user) return;
    if (chatPhase !== "intro" || chat.length > 0) return;
    if (streamingRef.current) return;
    streamingRef.current = true;
    (async () => {
      await sleep(400);
      await streamCoach(initialChat(user.key, user.name));
      setChatPhase("awaiting-consent");
      if (user.key !== "direct") setShowCallPopup(true);
      streamingRef.current = false;
    })();
  }, [screen, user, chatPhase, chat.length]);

  const logout = () => {
    setScreen("landing"); setPhone(""); setOtp(""); setUser(null);
    setName(""); setChat([]); setTasks(distressedTasks);
    setReportUpdated(false); setTasksUpdated(false); setMenuOpen(false);
    setChatPhase("intro"); setShowCallPopup(false); setBureauUpdated(false);
  };

  const postCallChat = (accepted: boolean) => {
    if (!user) return;
    setChatPhase("post-call");
    go("chat");
    (async () => {
      // Drop a system call-log line first, then stream the rest like Arjun is typing
      const callLog: ChatMsg = accepted
        ? { id: "calllog" + Date.now(), from: "system", kind: "callLog", text: "Voice call · 3:12", time: nowTime() }
        : { id: "missed" + Date.now(), from: "system", kind: "callLog", text: "Missed voice call · Tap to call back", time: nowTime() };
      setChat((c) => [...c, callLog]);
      await sleep(600);

      const items: Array<Omit<ChatMsg, "time">> = [];
      if (!accepted) {
        // Don't share any report/plan/cards until the call actually happens.
        // Just gently ask when's a good time to call back.
        await streamCoach([
          { id: "cb1" + Date.now(), from: "coach", kind: "text",
            text: "Koi baat nahi 🙂 lagta hai abhi busy ho." },
          { id: "cb2" + Date.now(), from: "coach", kind: "text",
            text: "Aap bata do — kab call karu? 2 minute ka hi kaam hai, uske baad aapki poori report aur plan share kar dunga." },
          { id: "cb3" + Date.now(), from: "coach", kind: "callbackOptions" },
        ]);
        return;
      }
      if (user.key === "distressed") {
        items.push({ id: "s1" + Date.now(), from: "coach", kind: "text",
          text: "Achha hua baat ho gayi 🙏" });
        items.push({ id: "s2" + Date.now(), from: "coach", kind: "text",
          text: "Jaisa discuss kiya — main abhi aapki report aur personalised plan tayar kar raha hoon. 2 minute do mujhe 🙏" });
      } else {
        // NTC — no credit report (would be empty). Go straight to secured card options.
        items.push({ id: "s1" + Date.now(), from: "coach", kind: "text",
          text: "Baat karke accha laga 🙏" });
        items.push({ id: "s2" + Date.now(), from: "coach", kind: "text",
          text: "Ek baat clear kar du — aapko reject nahi kiya gaya hai 🙏 Aapki abhi credit history hi nahi hai, isliye banks ko data nahi mila. Iska solution simple hai." });
        items.push({ id: "s3" + Date.now(), from: "coach", kind: "text",
          text: "Pehle 2 min mein samjho 'NTC' ka matlab kya hota hai 👇" });
        items.push({ id: "vid" + Date.now(), from: "coach", kind: "videoIntro" });
        items.push({ id: "fdintro" + Date.now(), from: "coach", kind: "text",
          text: "Ab yeh rahe 4 best secured cards — apna FD lagao, card milega, score banega. Swipe karke dekho:" });
        items.push({ id: "fdcaro" + Date.now(), from: "coach", kind: "fdCarousel" });
      }
      await streamCoach(items);
      if (accepted && user.key === "distressed") {
        // Simulate Arjun actually preparing things on his side.
        await sleep(2200);
        await streamCoach([
          { id: "rep" + Date.now(), from: "coach", kind: "text",
            text: "Ho gaya ✅ Yeh rahi aapki report aur projection — dekho score kaise improve hoga:" },
          { id: "repdoc" + Date.now(), from: "coach", kind: "report", text: "Credit Report.pdf" },
          { id: "proj" + Date.now(), from: "coach", kind: "projection" },
          { id: "tlintro" + Date.now(), from: "coach", kind: "text",
            text: "Aur yeh rahi aapki priority task list — ek-ek karke karte hain. Pehla sabse zaroori 👇" },
        ]);
        const taskItems: Array<Omit<ChatMsg, "time">> = [];
        ["t3", "t2", "t1"].forEach((tid, i) => {
          taskItems.push({ id: `tsum${i}${Date.now()}`, from: "coach", kind: "task", meta: { taskId: tid } });
        });
        await streamCoach(taskItems);
      }
      setReportUpdated(true);
      setTasksUpdated(true);
    })();
  };

  function handleCallbackSelect(option: string) {
    if (!user) return;
    setChat((c) => [...c, { id: "ucb" + Date.now(), from: "user", kind: "text", text: option, time: nowTime() }]);
    (async () => {
      if (option === "Abhi") {
        await streamCoach([
          { id: "cbok" + Date.now(), from: "coach", kind: "text", text: "Theek hai, 30 sec mein call kar raha hoon 📞" },
        ]);
        await sleep(800);
        go("call-incoming");
        setChatPhase("awaiting-consent");
      } else {
        await streamCoach([
          { id: "cbok" + Date.now(), from: "coach", kind: "text", text: `Sure — ${option} call karunga. Tab tak aap report dekh lena 👍` },
        ]);
      }
    })();
  }

  const triggerNtcBuild = () => {
    if (!user) return;
    go("chat");
    setChat((c) => [...c, { id: "ub" + Date.now(), from: "user", kind: "text",
      text: "Mujhe credit score build karna hai — guide karo", time: nowTime() }]);
    (async () => {
      await sleep(500);
      await streamCoach([
        { id: "nb1" + Date.now(), from: "coach", kind: "text",
          text: "Bilkul! Pehle clear kar du — aap reject nahi hue ho 🙏 Aapki credit history hi nahi hai, isliye banks ko data nahi mil raha." },
        { id: "nb2" + Date.now(), from: "coach", kind: "text",
          text: "2 minute ka yeh short video dekh lo — 'NTC' ka matlab samajh aa jayega 👇" },
        { id: "nbvid" + Date.now(), from: "coach", kind: "videoIntro" },
        { id: "nb3" + Date.now(), from: "coach", kind: "text",
          text: "Aur yeh rahe 4 best secured cards — FD lagao, card milega, score build hoga. Jo pasand aaye us par tap karo:" },
        { id: "nbfd" + Date.now(), from: "coach", kind: "fdCarousel" },
      ]);
    })();
  };

  // Task action — user taps a task; jump to chat and stream Arjun's guidance + drafts
  const triggerTaskFlow = (taskId: string) => {
    if (!user) return;
    go("chat");
    (async () => {
      const task = (user.key === "distressed" ? distressedTasks : ntcTasks).find((t) => t.id === taskId);
      if (!task) return;
      // user-bubble first so it feels like the tap was a message
      setChat((c) => [...c, { id: "utap" + Date.now(), from: "user", kind: "text",
        text: `Help me with: ${task.title}`, time: nowTime() }]);
      await sleep(500);
      if (taskId === "t3") {
        await streamCoach([
          { id: "g1" + Date.now(), from: "coach", kind: "text",
            text: `Hi ${user.name} 👋 acha kiya jo tap kiya — yeh sabse zaroori hai abhi.` },
          { id: "g2" + Date.now(), from: "coach", kind: "text",
            text: "IndusInd ne aapke naam pe ek hard enquiry daali hai, par aapne khud apply nahi kiya. Yeh galat hai aur isse score girta hai." },
          { id: "g3" + Date.now(), from: "coach", kind: "text",
            text: "Kya karna hai (2 minute ka kaam):\n1️⃣ IndusInd ke customer care ko likho — 'unauthorised enquiry, please remove'\n2️⃣ CIBIL pe dispute file karo (main link bhej dunga)\n3️⃣ Reply ka wait — 7–15 din mein hat jata hai" },
          { id: "g4" + Date.now(), from: "coach", kind: "text",
            text: "Tension mat lo — maine aapke liye email draft kar diya hai. Bas review karke 'Send' dabao 👇" },
          { id: "em" + Date.now(), from: "coach", kind: "emailDraft", meta: { taskId } },
        ]);
      } else if (taskId === "t2") {
        await streamCoach([
          { id: "g1" + Date.now(), from: "coach", kind: "text",
            text: `Hi ${user.name} 👋 HDFC wali EMI 11 din se overdue hai — yeh sabse jaldi fix karne wali cheez hai.` },
          { id: "g2" + Date.now(), from: "coach", kind: "text",
            text: "Har din late = +1 negative mark. Aaj pay kar diya to next report mein 'paid' show hoga aur ~70 points wapas aa sakte hain." },
          { id: "g3" + Date.now(), from: "coach", kind: "text",
            text: "Kaise:\n1️⃣ HDFC NetBanking → Loans → Pay EMI\n2️⃣ ₹4,820 (overdue) + ₹350 (late fee) = ₹5,170\n3️⃣ Receipt screenshot mujhe bhej dena, main track karunga" },
          { id: "g4" + Date.now(), from: "coach", kind: "text",
            text: "Pay karne ke baad autopay set karna mat bhoolna — main reminder bhejta rahunga 💚" },
        ]);
      } else if (taskId === "t1") {
        await streamCoach([
          { id: "g1" + Date.now(), from: "coach", kind: "text",
            text: `Yeh 'written-off' Hari & Co wala mark sabse bhaari hai ${user.name} — +115 points wapas aa sakte hain.` },
          { id: "g2" + Date.now(), from: "coach", kind: "text",
            text: "Aapne batayaa tha ki yeh aapka account hi nahi hai. Bureau ko likhna hoga ki yeh entry galat hai." },
          { id: "g3" + Date.now(), from: "coach", kind: "text",
            text: "Steps:\n1️⃣ CIBIL dispute portal khol ke 'not my account' file karo\n2️⃣ PAN + ID proof attach\n3️⃣ 30 din mein reply aata hai\n\nMain dispute draft taiyaar kar deta hoon — chahiye?" },
        ]);
      } else if (taskId === "n1") {
        await streamCoach([
          { id: "g1" + Date.now(), from: "coach", kind: "text",
            text: `Bilkul sahi qadam ${user.name} 👏 — secured card aapki credit history shuru karega.` },
          { id: "g2" + Date.now(), from: "coach", kind: "text",
            text: "Maine 4 options shortlist kiye hain — sabse fast SBM Bank hai. ₹2,000 FD, guaranteed approval, 7 din mein card." },
          { id: "g3" + Date.now(), from: "coach", kind: "fdCarousel" },
        ]);
      } else {
        await streamCoach([
          { id: "g1" + Date.now(), from: "coach", kind: "text",
            text: `Theek hai ${user.name}, "${task.title}" pe kaam karte hain.` },
          { id: "g2" + Date.now(), from: "coach", kind: "text",
            text: task.desc + " — main step-by-step samjha deta hoon." },
          { id: "g3" + Date.now(), from: "coach", kind: "text",
            text: "1️⃣ App khol ke verify karo\n2️⃣ Required action lo\n3️⃣ Confirmation mujhe bhej do — main track kar lunga ✅" },
        ]);
      }
    })();
  };

  // FD card "View details" tap — stream a typing-style detail message + apply link
  const triggerFdDetails = (card: FdCard) => {
    if (!user) return;
    go("chat");
    (async () => {
      setChat((c) => [...c, { id: "ufd" + Date.now(), from: "user", kind: "text",
        text: `View details — ${card.bank} ${card.name}`, time: nowTime() }]);
      await sleep(400);
      await streamCoach([
        { id: "cfd0" + Date.now(), from: "coach", kind: "text",
          text: `Ek second, ${card.bank} ke latest offer check kar raha hoon… 🔍` },
        { id: "cfd1" + Date.now(), from: "coach", kind: "text",
          text: `Bढ़िया choice! ${card.name} ke details:\n\n• Min FD: ₹${card.minDeposit.toLocaleString("en-IN")}\n• Approval: ${card.approval}\n• Fees: ${card.fee}\n• ${card.benefits[0]}` },
        { id: "cfd2" + Date.now(), from: "coach", kind: "text",
          text: "Aap eligible ho ✅ — bas KYC + FD lagao aur 5–7 din mein card aa jayega." },
        { id: "cfd3" + Date.now(), from: "coach", kind: "text",
          text: "Yeh raha aapka secure apply link 👇" },
        { id: "cfd4" + Date.now(), from: "coach", kind: "applyLink",
          meta: { bank: card.bank, name: card.name, url: `groscore.in/apply/${card.id}`, color: card.color } },
        { id: "cfd5" + Date.now(), from: "coach", kind: "text",
          text: "Apply karte hi mujhe bata dena, main aage track karunga 💚" },
      ]);
    })();
  };

  return (
    <div className="h-[100dvh] w-full bg-neutral-200 flex items-stretch sm:items-center justify-center overflow-hidden">
      <div className="relative w-full sm:max-w-[420px] h-[100dvh] sm:h-[min(900px,100dvh-3rem)] sm:my-6 bg-white overflow-hidden sm:rounded-[2.5rem] sm:shadow-2xl sm:border sm:border-black/10 flex flex-col">
        <DevNav current={screen} go={go} hasUser={!!user} loadDemo={(k) => {
          const u = k === "ntc" ? DEMOS["9876500001"] : DEMOS["9876500002"];
          setUser(u); setName(u.name); setPhone(u.phone);
          startChatFlow(u);
        }} />
        {screen === "landing" && <Landing onStart={() => go("phone")} />}
        {screen === "phone" && (
          <PhoneScreen phone={phone} setPhone={setPhone} onBack={() => go("landing")} onSubmit={onPhoneSubmit} />
        )}
        {screen === "otp" && user && (
          <OtpScreen phone={user.phone} otp={otp} setOtp={setOtp}
            onBack={() => go("phone")} onDone={() => {
              if (user.expired) return go("expired");
              if (user.key === "direct") return startChatFlow(user);
              return go("name");
            }} />
        )}
        {screen === "name" && (
          <NameScreen name={name} setName={setName} onBack={() => go("otp")}
            onContinue={() => {
              if (user?.key === "ntc2") return go("ntc2-fetch");
              if (user?.key === "ntc" || user?.key === "ntc3") {
                setBureauUpdated(false);
                return go("bureau-validate");
              }
              return go("fetch");
            }} />
        )}
        {screen === "bureau-validate" && user && (
          <BureauValidateScreen
            user={user} name={name} updated={bureauUpdated}
            onYes={() => go("expired")}
            onNotMe={() => go("panInput")}
            onBack={() => go("name")}
          />
        )}
        {screen === "bureau-fetching" && user && (
          <Ntc2FetchScreen onDone={() => go("ntc2-nohistory")} />
        )}
        {screen === "bureau-refetch" && user && (
          <BureauRefetch onDone={() => {
            setBureauUpdated(true);
            if (user.updated) setName(user.updated.name);
            go("bureau-validate");
          }} />
        )}
        {screen === "ntc2-fetch" && user && (
          <Ntc2FetchScreen onDone={() => go("ntc2-nohistory")} />
        )}
        {screen === "ntc2-nohistory" && user && (
          <Ntc2NoHistoryScreen
            user={user} name={name}
            onHasCredit={() => go("ntc2-edit")}
            onNoCredit={() => go("expired")}
            onBack={() => go("name")}
          />
        )}
        {screen === "ntc2-edit" && user && (
          <EditDetailsScreen
            user={user} name={name} setName={setName}
            onBack={() => go("ntc2-nohistory")}
            onContinue={() => go("bureau-refetch")}
          />
        )}
        {screen === "expired" && user && (
          <ExpiredScreen user={user} name={name} onLogout={logout}
            onRestart={() => go("payment")} />
        )}
        {screen === "payment" && user && (
          <RazorpayScreen user={user} onBack={() => go("expired")}
            onSuccess={() => go("payment-success")} />
        )}
        {screen === "payment-success" && user && (
          <PaymentSuccess onDone={() => startChatFlow(user)} />
        )}
        {screen === "fetch" && user && (
          <PanCardScreen
            user={user} name={name} setName={setName}
            onConfirm={() => go("perm-all")}
            onChangeNumber={() => go("phone")}
            onNotFound={() => go("panInput")}
          />
        )}
        {screen === "panInput" && user && (
          <PanInputScreen user={user} name={name} setName={setName}
            onBack={() => go(user.key === "ntc2" ? "ntc2-nohistory" : "bureau-validate")}
            onContinue={() => go(
              user.key === "ntc3" ? "bureau-refetch"
              : user.key === "ntc" ? "bureau-fetching"
              : user.key === "ntc2" ? "bureau-refetch"
              : "perm-all"
            )} />
        )}
        {screen === "perm-all" && (
          <PermAllScreen
            onAllow={() => go("perm-email-intro")}
            onDeny={() => go("perm-blocked")}
          />
        )}
        {screen === "perm-blocked" && (
          <PermBlocked onRetry={() => go("perm-all")} />
        )}
        {screen === "perm-email" && (
          <EmailPerm
            onDone={() => go("ntc-checklist")}
          />
        )}
        {screen === "perm-email-intro" && (
          <EmailIntro onContinue={() => go("loading-email")} onSkip={() => go("ntc-checklist")} />
        )}
        {screen === "loading-email" && (
          <LoadingScreen label="Opening Google sign-in…" onDone={() => go("perm-email")} />
        )}
        {screen === "ntc-checklist" && user && (
          <NTCChecklistScreen user={user} onDone={() => {
            setChat([]);
            setChatPhase("intro");
            setTasks(user.key === "distressed" ? distressedTasks : ntcTasks);
            go("chat");
          }} />
        )}
        {screen === "chat" && user && (
          <ChatScreen
            user={user} chat={chat} setChat={setChat}
            chatPhase={chatPhase} setChatPhase={setChatPhase}
            reportUpdated={reportUpdated} tasksUpdated={tasksUpdated}
            menuOpen={menuOpen} setMenuOpen={setMenuOpen}
            typing={typing}
            onAcceptCall={() => go("call-active")}
            onDeclineCall={() => postCallChat(false)}
            openReport={() => { setReportUpdated(false); go("report"); }}
            openTasks={() => { setTasksUpdated(false); go("tasks"); }}
            openHeader={() => go("arjun-profile")}
            openCall={() => go("call-incoming")}
            tasks={tasks}
            onTaskAction={triggerTaskFlow}
            onPickFd={triggerFdDetails}
            onCallbackSelect={handleCallbackSelect}
            onBuildCredit={triggerNtcBuild}
            onMenu={(k) => {
              if (k === "logout") logout();
              else if (k === "profile") go("profile");
              else if (k === "sub") go("subscription");
              else if (k === "help") go("help");
            }}
          />
        )}
        {screen === "call-incoming" && (
          <IncomingCall
            onAccept={() => go("call-active")}
            onDecline={() => postCallChat(false)}
          />
        )}
        {screen === "call-active" && user && (
          <ActiveCall user={user} onEnd={() => postCallChat(true)} />
        )}
        {screen === "report" && user && (
          <ReportScreen user={user} onBack={() => go(user ? "chat" : "arjun-profile")} onStartChat={triggerNtcBuild} />
        )}
        {screen === "tasks" && user && (
          <TasksScreen user={user} tasks={tasks}
            onComplete={(id) => setTasks((t) => t.map((x) => x.id === id ? { ...x, status: "done" } : x))}
            onTaskAction={triggerTaskFlow}
            onBack={() => go("chat")} />
        )}
        {screen === "arjun-profile" && user && (
          <ArjunProfile user={user} tasks={tasks}
            onBack={() => go("chat")}
            openReport={() => go("report")}
            openTasks={() => go("tasks")}
          />
        )}
        {screen === "profile" && user && <Profile user={user} onBack={() => go("chat")} />}
        {screen === "subscription" && <Subscription onBack={() => go("chat")} />}
        {screen === "help" && <Help onBack={() => go("chat")} />}
        {showCallPopup && user && (
          <MiniProfilePopup
            user={user}
            onCall={() => {
              setShowCallPopup(false);
              setChatPhase("awaiting-consent");
              go("call-incoming");
            }}
            onCancel={() => setShowCallPopup(false)}
          />
        )}
      </div>
    </div>
  );
}

const nowTime = () => {
  const d = new Date();
  let h = d.getHours(); const m = d.getMinutes();
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
};

/* ====================== LANDING ====================== */
function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#f6faf8]">
      {/* Decorative ambient blobs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#01be87]/[0.07] blur-3xl" />
      <div className="absolute top-1/3 -left-20 w-56 h-56 rounded-full bg-[#18186b]/[0.06] blur-3xl" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-40 rounded-full bg-[#01be87]/[0.04] blur-3xl" />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
        {/* Logo mark */}
        <div className="mb-12">
          <img src={groLogo} alt="GroScore" className="w-56 h-auto" />
        </div>

        {/* Headline */}
        <h1 className="text-[32px] font-extrabold text-[#0a0a2e] leading-[1.1] tracking-[-0.02em]">
          Your personal<br />credit coach
        </h1>

        {/* Subhead */}
        <p className="mt-5 text-[15px] text-gray-500 leading-[1.65] max-w-[300px]">
          Better credit, smarter savings, stronger insight — with experts in your corner, 24×7.
        </p>

        {/* Feature pills */}
        <div className="mt-8 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-white border border-[#01be87]/15 rounded-full px-3 py-1.5 text-[13px] font-medium text-[#01be87] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> AI Coach
          </span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative px-8 pb-12 pt-4 z-10">
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#01be87]/20 to-transparent" />
        <button
          onClick={onStart}
          className="w-full text-white font-bold py-4 rounded-full text-base shadow-md active:scale-[0.98] transition"
          style={{ background: WA.accent }}
        >
          Get Started
        </button>
        <p className="text-center text-[11px] text-gray-400 mt-4 tracking-wide">
          Trusted by 50,000+ users across India
        </p>
      </div>
    </div>
  );
}

/* ====================== ONBOARDING (WhatsApp top bar, English) ====================== */
function WATopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-3 h-14 text-white" style={{ background: WA.green }}>
      {onBack && <button onClick={onBack} className="p-1 -ml-1"><ChevronLeft className="w-6 h-6" /></button>}
      <h1 className="font-semibold text-[17px] flex-1">{title}</h1>
      {right}
    </div>
  );
}

/* ====================== PHONE ====================== */
function PhoneScreen({ phone, setPhone, onBack, onSubmit }: { phone: string; setPhone: (s: string) => void; onBack: () => void; onSubmit: () => void }) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="Enter your phone number" onBack={onBack} />
      <div className="p-6 flex-1">
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          GroScore will send an SMS to verify your phone number. Carrier charges may apply.
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b-2 pb-2" style={{ borderColor: WA.accent }}>
            <span className="font-medium text-gray-900">India (+91)</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <div className="border-b-2 pb-2" style={{ borderColor: WA.accent }}>
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric" placeholder="phone number"
              className="w-full outline-none text-lg tracking-wider bg-transparent" />
          </div>
        </div>
        <div className="mt-6">
          <div className="text-[11px] uppercase text-gray-500 font-semibold mb-2">Demo accounts</div>
          <div className="flex flex-col gap-2">
            {[["9876500001", "Rahul · New to credit"], ["9876500002", "Sonu · Score 413"], ["9876500003", "Darpan · Trial ended"], ["9876500004", "Priya · Direct to chat"], ["9876500005", "Aarav · NTC · No history"], ["9876500006", "Kavya · NTC · PAN re-fetch"]].map(([p, label]) => (
              <button key={p} onClick={() => setPhone(p)}
                className="text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 flex items-center justify-between">
                <span>
                  <div className="font-medium text-gray-900">+91 {p.slice(0, 5)} {p.slice(5)}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6">
        <button onClick={onSubmit} disabled={phone.length !== 10}
          className="w-full text-white font-bold py-3.5 rounded-full disabled:opacity-40"
          style={{ background: WA.accent }}>
          Next
        </button>
      </div>
    </div>
  );
}

/* ====================== OTP ====================== */
function OtpScreen({ phone, otp, setOtp, onBack, onDone }: { phone: string; otp: string; setOtp: (s: string) => void; onBack: () => void; onDone: () => void }) {
  const [timer, setTimer] = useState(30);
  useEffect(() => {
    const t1 = setTimeout(() => setOtp("123456"), 1200);
    const t2 = setTimeout(() => onDone(), 2400);
    const iv = setInterval(() => setTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const digits = otp.padEnd(6, " ").slice(0, 6).split("");
  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="Verifying your number" onBack={onBack} />
      <div className="p-6 flex-1">
        <p className="text-sm text-gray-600 mb-6">
          We sent a 6-digit code to <b>+91 {phone.slice(0, 5)} {phone.slice(5)}</b>
        </p>
        <div className="flex gap-2 justify-between">
          {digits.map((d, i) => (
            <div key={i}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition ${
                d.trim() ? "text-gray-900" : "border-gray-200 text-gray-900"
              }`}
              style={{ borderColor: d.trim() ? WA.accent : undefined, background: d.trim() ? "#E8F5E9" : undefined }}>
              {d.trim()}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-6 text-sm text-gray-600">
          <Sparkles className="w-4 h-4" style={{ color: WA.accent }} /> Detecting code from SMS…
        </div>
        <button className="mt-4 text-sm font-medium disabled:opacity-40" disabled={timer > 0} style={{ color: WA.green }}>
          {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}

/* ====================== NAME ====================== */
function NameScreen({ name, setName, onBack, onContinue }: { name: string; setName: (s: string) => void; onBack: () => void; onContinue: () => void }) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="Your name (as in bureau)" onBack={onBack} />
      <div className="p-6 flex-1">
        <p className="text-sm text-gray-600 mb-2">Enter your name <b>exactly as it appears in the credit bureau</b> — it helps us fetch accurate data on the first try.</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
          className="w-full border-b-2 pb-2 mt-4 text-xl outline-none bg-transparent"
          style={{ borderColor: WA.accent }} />
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-[11px] uppercase font-bold tracking-wider text-gray-500 mb-2">Where to find your name</div>
          <img src={panCardRef} alt="PAN card reference" className="w-full rounded-lg" />
          <div className="text-[11px] text-gray-500 mt-2 text-center">Use the same spelling as the "Name" field on your PAN card.</div>
        </div>
      </div>
      <div className="p-6">
        <button onClick={onContinue} disabled={!name.trim()}
          className="w-full text-white font-bold py-3.5 rounded-full disabled:opacity-40"
          style={{ background: WA.accent }}>
          Continue
        </button>
      </div>
    </div>
  );
}

/* ====================== PAN CARD SCREEN ====================== */
function PanCardScreen({ user, name, setName, onConfirm, onChangeNumber, onNotFound }:
  { user: DemoUser; name: string; setName: (s: string) => void; onConfirm: () => void; onChangeNumber: () => void; onNotFound: () => void }) {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1500); return () => clearTimeout(t); }, []);

  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="Confirm your identity" />
      <div className="p-5 flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: "#E5E7EB", borderTopColor: WA.accent }} />
            <p className="text-gray-600">Fetching your credit profile…</p>
          </div>
        ) : (
          <>
            <p className="text-xs uppercase font-semibold text-gray-500 tracking-wide mb-3">Is this you?</p>

            {/* PAN card (real reference image with user data overlay) */}
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200">
              <img src={panCardRef} alt="PAN card" className="w-full block" />
              {/* Name overlay — covers the "YOUR NAME" placeholder */}
              <div className="absolute" style={{ left: "11%", top: "42%", width: "42%" }}>
                {editing ? (
                  <div className="flex items-center gap-1 bg-white/95 rounded px-1 py-0.5">
                    <input value={draft} onChange={(e) => setDraft(e.target.value)}
                      className="flex-1 min-w-0 text-[13px] font-bold uppercase border-b border-gray-400 outline-none bg-transparent" />
                    <button onClick={() => { setName(draft); setEditing(false); }}
                      className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: WA.accent }}>OK</button>
                  </div>
                ) : (
                  <div className="text-[13px] sm:text-sm font-bold uppercase text-gray-900 bg-white rounded px-1.5 py-0.5 inline-block tracking-wide shadow-sm">
                    {(name || user.name)}
                  </div>
                )}
              </div>
              {/* PAN number overlay — covers the "ABCDE1234F" placeholder */}
              <div className="absolute" style={{ left: "11%", top: "72%", width: "50%" }}>
                <div className="font-mono text-[13px] sm:text-sm font-bold tracking-wider text-gray-900 bg-white rounded px-1.5 py-0.5 inline-block shadow-sm">
                  {user.pan}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => { setDraft(name); setEditing(true); }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700">
                <Edit2 className="w-4 h-4" /> Edit name
              </button>
              <button onClick={onChangeNumber}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4" /> Change number
              </button>
            </div>

            <button onClick={onNotFound} className="mt-3 text-xs text-gray-500 underline self-center">
              PAN not found? Enter manually
            </button>

            <div className="mt-auto pt-6">
              <button onClick={onConfirm}
                className="w-full text-white font-bold py-3.5 rounded-full"
                style={{ background: WA.accent }}>
                Yes, that's me
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PanInputScreen({ user, name, setName, onBack, onContinue }:
  { user: DemoUser; name: string; setName: (v: string) => void; onBack: () => void; onContinue: () => void }) {
  const [localName, setLocalName] = useState(name || user.name);
  const [pan, setPan] = useState("");
  const valid = localName.trim().length >= 2 && pan.length === 10;
  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="Re-check your details" onBack={onBack} />
      <div className="p-6 flex-1 overflow-y-auto">
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          Let's try once more. Please enter your <b>full name</b> exactly as on your PAN card, along with your PAN number.
        </p>
        <div className="space-y-5">
          <div>
            <label className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">Full name (as per PAN)</label>
            <input value={localName} onChange={(e) => setLocalName(e.target.value)}
              placeholder="e.g. Rahul Kumar"
              className="w-full border-b-2 pb-2 mt-1 text-lg outline-none"
              style={{ borderColor: WA.accent }} />
          </div>
          <div>
            <label className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">PAN number</label>
            <input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
              placeholder="ABCDE1234F"
              className="w-full border-b-2 pb-2 mt-1 text-lg tracking-widest outline-none"
              style={{ borderColor: WA.accent }} />
          </div>
        </div>
        <p className="text-[11px] text-gray-500 mt-5 leading-relaxed">
          We'll use these to re-check your credit bureau record.
        </p>
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-[11px] uppercase font-bold tracking-wider text-gray-500 mb-2">Where to find these</div>
          <img src={panCardRef} alt="PAN card reference" className="w-full rounded-lg" />
          <div className="text-[11px] text-gray-500 mt-2 text-center">Copy your name and 10-character PAN exactly as shown on your PAN card.</div>
        </div>
      </div>
      <div className="p-6 pt-2">
        <button onClick={() => { setName(localName.trim()); onContinue(); }} disabled={!valid}
          className="w-full text-white font-bold py-3.5 rounded-full disabled:opacity-40"
          style={{ background: WA.accent }}>
          Re-check bureau
        </button>
      </div>
    </div>
  );
}

/* ====================== BUREAU VALIDATE (card with 4 fields) ====================== */
function BureauValidateScreen({ user, name, updated, onYes, onNotMe, onBack }:
  { user: DemoUser; name: string; updated?: boolean; onYes: () => void; onNotMe: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1400); return () => clearTimeout(t); }, []);
  const src = updated && user.updated ? user.updated : { name: name || user.name, pan: user.pan, dob: user.dob || "—" };
  const displayName = (src.name || user.name).toUpperCase();
  const rows: Array<{ label: string; value: string; icon: React.ComponentType<{ className?: string }> }> = [
    { label: "Name", value: displayName, icon: User },
    { label: "Mobile", value: `+91 ${user.phone.slice(0, 5)} ${user.phone.slice(5)}`, icon: Phone },
    { label: "PAN", value: src.pan, icon: BadgeCheck },
    { label: "Date of birth", value: src.dob, icon: FileText },
  ];
  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="Confirm your identity" onBack={onBack} />
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: "#E5E7EB", borderTopColor: WA.accent }} />
          <p className="text-gray-600 text-sm">{updated ? "Re-fetching with your new PAN…" : "Fetching your details from the bureau…"}</p>
        </div>
      ) : (
        <>
          <div className="p-5 flex-1 overflow-y-auto">
            <p className="text-xs uppercase font-semibold text-gray-500 tracking-wide mb-3">{updated ? "Updated details — is this you?" : "Is this you?"}</p>
            <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#F1FBF4" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: WA.green }}>
                  {displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase font-semibold text-emerald-700 tracking-wide">Bureau match</div>
                  <div className="font-bold text-gray-900 truncate">{displayName}</div>
                </div>
                <BadgeCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="divide-y divide-gray-100">
                {rows.map((r) => {
                  const Icon = r.icon;
                  return (
                    <div key={r.label} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">{r.label}</div>
                        <div className="font-semibold text-gray-900 text-[15px] truncate">{r.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-3 text-center leading-relaxed">
              These details came from your credit bureau record. Please confirm before we proceed.
            </p>
          </div>
          <div className="p-5 pt-2 space-y-2.5">
            <button onClick={onYes}
              className="w-full text-white font-bold py-3.5 rounded-full"
              style={{ background: WA.accent }}>
              Yes, that's me
            </button>
            <button onClick={onNotMe}
              className="w-full font-semibold py-3.5 rounded-full border border-gray-300 text-gray-700 bg-white">
              Not me
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ====================== BUREAU FETCHING (after "Not me" PAN entry) ====================== */

/* ====================== BUREAU REFETCH (after "Not me" PAN entry — found updated details) ====================== */
function BureauRefetch({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"loading" | "found">("loading");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("found"), 1600);
    const t2 = setTimeout(onDone, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="Re-fetching from bureau" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {phase === "loading" ? (
          <>
            <div className="w-14 h-14 border-4 rounded-full animate-spin mb-5" style={{ borderColor: "#E5E7EB", borderTopColor: WA.accent }} />
            <p className="text-gray-700 font-semibold">Looking up your credit record…</p>
            <p className="text-gray-500 text-sm mt-1">Using your updated PAN.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#DCF7E3" }}>
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Updated details found</h2>
            <p className="text-gray-600 text-sm mt-2 max-w-xs leading-relaxed">
              We matched your new PAN with a bureau record. Please review the updated details on the next screen.
            </p>
          </>
        )}
      </div>
    </div>
  );
}


/* ====================== EDIT DETAILS (NTC2: user says they have a loan/CC) ====================== */
function EditDetailsScreen({ user, name, setName, onBack, onContinue }:
  { user: DemoUser; name: string; setName: (v: string) => void; onBack: () => void; onContinue: () => void }) {
  const [localName, setLocalName] = useState(name || user.name);
  const [pan, setPan] = useState(user.pan || "");
  const valid = localName.trim().length >= 2 && pan.length === 10;
  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="Edit your details" onBack={onBack} />
      <div className="p-6 flex-1 overflow-y-auto">
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          Let's try once more. Please enter your <b>full name</b> exactly as on your PAN card, along with your PAN number.
        </p>
        <div className="space-y-5">
          <div>
            <label className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">Full name (as per PAN)</label>
            <input value={localName} onChange={(e) => setLocalName(e.target.value)}
              placeholder="e.g. Aarav Mehta"
              className="w-full border-b-2 pb-2 mt-1 text-lg outline-none"
              style={{ borderColor: WA.accent }} />
          </div>
          <div>
            <label className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">PAN number</label>
            <input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
              placeholder="ABCDE1234F"
              className="w-full border-b-2 pb-2 mt-1 text-lg tracking-widest outline-none"
              style={{ borderColor: WA.accent }} />
          </div>
        </div>
        <p className="text-[11px] text-gray-500 mt-5 leading-relaxed">
          We'll use these to re-check your credit bureau record.
        </p>
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-[11px] uppercase font-bold tracking-wider text-gray-500 mb-2">Where to find these</div>
          <img src={panCardRef} alt="PAN card reference" className="w-full rounded-lg" />
          <div className="text-[11px] text-gray-500 mt-2 text-center">Copy your name and 10-character PAN exactly as shown on your PAN card.</div>
        </div>
      </div>
      <div className="p-6 pt-2">
        <button onClick={() => { setName(localName.trim()); onContinue(); }} disabled={!valid}
          className="w-full text-white font-bold py-3.5 rounded-full disabled:opacity-40"
          style={{ background: WA.accent }}>
          Re-check bureau
        </button>
      </div>
    </div>
  );
}






/* ====================== NTC2: Bureau fetch (no history) ====================== */
function Ntc2FetchScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="Fetching from bureau" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-14 h-14 border-4 rounded-full animate-spin mb-5" style={{ borderColor: "#E5E7EB", borderTopColor: WA.accent }} />
        <p className="text-gray-700 font-semibold">Looking up your credit record…</p>
        <p className="text-gray-500 text-sm mt-1">This usually takes a few seconds.</p>
      </div>
    </div>
  );
}

/* ====================== NTC2: No credit history — confirm loan/CC ====================== */
function Ntc2NoHistoryScreen({ user, name, onHasCredit, onNoCredit, onBack }:
  { user: DemoUser; name: string; onHasCredit: () => void; onNoCredit: () => void; onBack: () => void }) {
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  const displayName = (name || user.name).split(" ")[0];
  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="No credit history found" onBack={onBack} />
      <div className="p-5 flex-1 overflow-y-auto">
        <div className="rounded-2xl p-5 border border-amber-100" style={{ background: "#FFFBEB" }}>
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FEF3C7" }}>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase font-bold tracking-wider text-amber-700">Bureau result</div>
              <div className="font-bold text-gray-900 mt-0.5">Hi {displayName}, we couldn't find any credit record.</div>
              <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">
                Iska matlab sirf itna hai ki bureau ke paas abhi aapka data nahi hai — koi problem nahi, hum yahin se shuru karenge.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-[11px] uppercase font-bold tracking-wider text-gray-500 mb-2">Quick check</div>
          <h3 className="text-[17px] font-bold text-gray-900 leading-snug">
            Do you currently have any active loan or credit card?
          </h3>
          <p className="text-xs text-gray-500 mt-1">Even one that's in your name but paid by family counts.</p>

          <div className="mt-4 space-y-2.5">
            {([
              { key: "yes", title: "Yes, I have a loan or credit card", desc: "We'll re-check the bureau with your PAN to pull the record.", icon: BadgeCheck },
              { key: "no", title: "No, nothing in my name yet", desc: "That's fine — your coach will help you build a score from scratch.", icon: UserPlus },
            ] as const).map((opt) => {
              const Icon = opt.icon;
              const active = choice === opt.key;
              return (
                <button key={opt.key} onClick={() => setChoice(opt.key)}
                  className="w-full text-left rounded-2xl border p-3.5 flex items-start gap-3 transition"
                  style={{
                    borderColor: active ? WA.accent : "#E5E7EB",
                    background: active ? "#F1FBF4" : "#fff",
                  }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: active ? WA.accent : "#F3F4F6", color: active ? "#fff" : "#4B5563" }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-[15px]">{opt.title}</div>
                    <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">{opt.desc}</div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center"
                    style={{ borderColor: active ? WA.accent : "#D1D5DB", background: active ? WA.accent : "transparent" }}>
                    {active && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="p-5 pt-2">
        <button
          onClick={() => (choice === "yes" ? onHasCredit() : onNoCredit())}
          disabled={!choice}
          className="w-full text-white font-bold py-3.5 rounded-full disabled:opacity-40"
          style={{ background: WA.accent }}>
          Continue
        </button>
      </div>
    </div>
  );
}


/* ====================== PAN VALIDATE (name + PAN together) ====================== */
function PanValidateScreen({ name, setName, defaultPan, onBack, onContinue }:
  { name: string; setName: (s: string) => void; defaultPan: string; onBack: () => void; onContinue: () => void }) {
  const [pan, setPan] = useState("");
  const [checking, setChecking] = useState(false);
  const panOk = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  const nameOk = name.trim().length >= 2;
  const submit = () => {
    if (!panOk || !nameOk) return;
    setChecking(true);
    setTimeout(() => { setChecking(false); onContinue(); }, 1200);
  };
  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="Confirm & enter PAN" onBack={onBack} />
      <div className="p-6 flex-1 overflow-y-auto">
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          Please confirm your name and enter your <b>PAN number</b>. We'll cross-check with the bureau.
        </p>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-[11px] uppercase font-bold tracking-wider text-gray-500 mb-1">Name (as entered)</div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-bold text-gray-900 uppercase truncate">{name || "—"}</div>
            <button onClick={onBack} className="text-xs font-semibold underline shrink-0" style={{ color: WA.accent }}>Edit</button>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Make sure this matches your PAN card exactly.</div>
        </div>

        <label className="text-[11px] uppercase font-bold tracking-wider text-gray-500 mt-6 block">PAN number</label>
        <input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
          placeholder={defaultPan}
          className="w-full border-b-2 pb-2 mt-1 text-lg tracking-[0.25em] font-mono outline-none bg-transparent"
          style={{ borderColor: WA.accent }} />
        <div className="text-[11px] text-gray-500 mt-2">Format: ABCDE1234F</div>

        <button onClick={() => setPan(defaultPan)}
          className="mt-3 text-xs text-gray-500 underline">
          Use my registered PAN
        </button>
      </div>
      <div className="p-6">
        <button onClick={submit} disabled={!panOk || !nameOk || checking}
          className="w-full text-white font-bold py-3.5 rounded-full disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: WA.accent }}>
          {checking ? (<><Loader2 className="w-4 h-4 animate-spin" /> Validating…</>) : "Validate & Continue"}
        </button>
      </div>
    </div>
  );
}

/* ====================== PAYWALL (NEW + LAPSED) ====================== */
function ExpiredScreen({ user, name, onRestart, onLogout }:
  { user: DemoUser; name?: string; onRestart: () => void; onLogout: () => void }) {
  const isLapsed = !!user.expired;
  const displayName = (name && name.trim()) ? name.trim().split(" ")[0] : user.name;
  const chip = isLapsed
    ? { label: "Trial Ended", bg: "#FEE2E2", color: "#B91C1C", dot: "bg-red-600" }
    : { label: "New Member", bg: "#DCFCE7", color: "#166534", dot: "bg-emerald-600" };
  const subtitle = isLapsed
    ? "Hum aapki credit journey already start kar chuke hain. Isse rukne na de."
    : "Aapki credit journey shuru karne ke liye bas ek chhota sa step baaki hai.";
  const cta = isLapsed ? "Restart Subscription" : "Start My Journey";

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto">
      <div className="flex items-center justify-between px-5 pt-5">
        <button onClick={onLogout} className="text-sm text-gray-500 font-medium">Logout</button>
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: chip.bg, color: chip.color }}>
          <span className={`w-1.5 h-1.5 rounded-full ${chip.dot}`} /> {chip.label}
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 px-6 pt-6 pb-4 flex flex-col items-center text-center">
        <img src={groLogo} alt="GroScore" className="w-24 h-auto mb-3" />
        <h1 className="text-3xl font-extrabold text-gray-900">Hey {displayName}!</h1>
        <div className="w-16 h-px bg-gray-200 my-3" />
        <p className="text-gray-600 text-[15px] leading-relaxed max-w-xs">{subtitle}</p>

        <div className="mt-6 w-full rounded-2xl border border-emerald-100" style={{ background: "#F1FBF4" }}>
          <Row icon={FileText} text={isLapsed
            ? <><b>Credit report analyze</b> kiya hai aur dispute plan banaya hai</>
            : <>Personal <b>credit report + dispute plan</b> aapke liye tayar</>} />
          <div className="h-px bg-white" />
          <Row icon={User} text={<><b>Credit Coach</b> aapka score <b>750+</b> le jaane ko tayar hai</>} />
          <div className="h-px bg-white" />
          <Row icon={TrendingUp} text={<><b>24×7 support</b> + monthly progress tracking</>} />
          <div className="h-px bg-white" />
          <div className="flex items-center justify-center gap-3 px-4 py-4">
            <span className="text-gray-400 line-through text-lg">₹299</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="text-3xl font-extrabold text-gray-900">₹99</span>
            <span className="text-gray-600 text-sm">/month</span>
            <span className="ml-2 text-[11px] font-bold px-2 py-1 rounded-md" style={{ background: "#DCFCE7", color: "#166534" }}>67% OFF</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        <button onClick={onRestart}
          className="w-full text-white font-bold py-4 rounded-full text-base shadow-md active:scale-[0.98] transition"
          style={{ background: WA.accent }}>
          {cta}
        </button>
        <p className="text-center text-gray-400 text-[11px] mt-3">Secure payment via Razorpay · Cancel anytime</p>
      </div>
    </div>
  );
}

function Row({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-emerald-700" />
      </div>
      <div className="text-[14px] text-gray-800 leading-snug">{text}</div>
    </div>
  );
}

/* ====================== RAZORPAY CHECKOUT ====================== */
function RazorpayScreen({ user, onBack, onSuccess }:
  { user: DemoUser; onBack: () => void; onSuccess: () => void }) {
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [processing, setProcessing] = useState(false);
  const pay = () => {
    setProcessing(true);
    setTimeout(onSuccess, 1800);
  };
  return (
    <div className="flex-1 flex flex-col bg-neutral-50">
      <div className="flex items-center gap-3 px-4 h-14 text-white" style={{ background: "#072654" }}>
        <button onClick={onBack} className="p-1 -ml-1"><ChevronLeft className="w-6 h-6" /></button>
        <div className="flex-1">
          <div className="font-bold text-[15px] leading-tight">Razorpay</div>
          <div className="text-[11px] opacity-80">GroScore by GroMo</div>
        </div>
        <Lock className="w-4 h-4 opacity-80" />
      </div>

      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase font-semibold text-gray-500">Total payable</div>
          <div className="text-2xl font-extrabold text-gray-900">₹99<span className="text-sm text-gray-500 font-medium">/month</span></div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-gray-500">Paying as</div>
          <div className="text-sm font-semibold text-gray-800">{user.name}</div>
          <div className="text-[11px] text-gray-500">+91 {user.phone.slice(0,5)} {user.phone.slice(5)}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-[11px] uppercase font-bold tracking-wider text-gray-500">Payment methods</div>
        {[
          { k: "upi" as const, title: "UPI", sub: "GPay · PhonePe · Paytm · BHIM", badge: "Recommended" },
          { k: "card" as const, title: "Cards", sub: "Credit / Debit / ATM", badge: "" },
          { k: "netbanking" as const, title: "Netbanking", sub: "All Indian banks", badge: "" },
        ].map((opt) => (
          <button key={opt.k} onClick={() => setMethod(opt.k)}
            className={`w-full text-left rounded-xl border-2 p-4 bg-white flex items-center gap-3 ${method === opt.k ? "border-[#072654]" : "border-gray-200"}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === opt.k ? "border-[#072654]" : "border-gray-300"}`}>
              {method === opt.k && <div className="w-2.5 h-2.5 rounded-full bg-[#072654]" />}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                {opt.title}
                {opt.badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#DCFCE7", color: "#166534" }}>{opt.badge}</span>}
              </div>
              <div className="text-xs text-gray-500">{opt.sub}</div>
            </div>
          </button>
        ))}

        {method === "upi" && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="text-[11px] uppercase font-bold tracking-wider text-gray-500">UPI ID</label>
            <input defaultValue={`${user.name.toLowerCase()}@okhdfc`} className="w-full border-b-2 pb-2 mt-1 text-base outline-none" style={{ borderColor: "#072654" }} />
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <button onClick={pay} disabled={processing}
          className="w-full text-white font-bold py-3.5 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: "#072654" }}>
          {processing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>) : "Pay ₹99"}
        </button>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-gray-500">
          <Lock className="w-3 h-3" /> 256-bit encrypted · Powered by Razorpay
        </div>
      </div>
    </div>
  );
}

function PaymentSuccess({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 animate-in zoom-in duration-300" style={{ background: "#DCFCE7" }}>
        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Payment successful</h2>
      <p className="text-gray-600 mt-2 text-sm">₹99 charged · Subscription active</p>
      <p className="text-gray-400 mt-6 text-xs">Taking you to Arjun…</p>
    </div>
  );
}

/* ====================== PERMISSIONS (WhatsApp style) ====================== */
function PermAllScreen({ onAllow, onDeny }: { onAllow: () => void; onDeny: () => void }) {
  const items = [
    { icon: MessageSquare, title: "SMS access", reason: "Read bank SMS to detect bills, EMI dues and credit-card alerts." },
    { icon: Phone, title: "Phone state", reason: "Verify your SIM matches the registered number." },
    { icon: Bell, title: "Notifications", reason: "Send reminders for due dates and score updates." },
    { icon: Mic, title: "Microphone", reason: "Talk to Arjun on voice calls inside the app." },
  ];
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <WATopBar title="Required permissions" />
      <div className="px-6 pt-5 pb-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          GroScore needs the following permissions so Arjun can help you. You can revoke them anytime from your phone settings.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="flex items-start gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#E8F5E9" }}>
                <Icon className="w-5 h-5" style={{ color: WA.green }} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="font-semibold text-[15px] text-gray-900">{it.title}</div>
                <div className="text-xs text-gray-500 leading-snug mt-0.5">{it.reason}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-5 space-y-2 border-t border-gray-100">
        <button onClick={onAllow}
          className="w-full text-white font-bold py-3.5 rounded-full"
          style={{ background: WA.accent }}>
          Allow all
        </button>
        <button onClick={onDeny} className="w-full text-gray-600 font-medium py-2.5">
          Don't allow
        </button>
      </div>
    </div>
  );
}

function PermBlocked({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <WATopBar title="Permissions required" />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: "#FEE2E2" }}>
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Arjun can't help without these</h2>
        <p className="text-gray-600 mt-3 text-sm leading-relaxed max-w-xs">
          GroScore reads SMS for bills, sends reminders, and uses voice for coaching calls. These permissions are required to continue.
        </p>
      </div>
      <div className="p-6">
        <button onClick={onRetry}
          className="w-full text-white font-bold py-3.5 rounded-full"
          style={{ background: WA.accent }}>
          Grant permissions
        </button>
      </div>
    </div>
  );
}

function EmailPerm({ onDone }: { onDone: () => void }) {
  return _EmailPermImpl(onDone);
}

function EmailIntro({ onContinue, onSkip }: { onContinue: () => void; onSkip: () => void }) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="px-6 pt-8 flex-1 flex flex-col">
        {/* Hero illustration with Arjun + Gmail */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="relative">
            <img src={kabirImg} alt="Arjun" className="w-16 h-16 rounded-full object-cover shadow-md" />
          </div>
          <div className="text-2xl text-gray-400">→</div>
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center">
            <svg className="w-9 h-9" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22 6.98v10.04c0 .54-.44.98-.98.98H18V9.91l-6 4.5-6-4.5v8.09H2.98A.98.98 0 0 1 2 17.02V6.98c0-.27.11-.52.29-.7l.69-.69L12 12.5l9.02-6.91.69.69c.18.18.29.43.29.7z"/>
              <path fill="#EA4335" d="M18 9.91 12 14.4l-6-4.5V6l6 4.5L18 6z"/>
            </svg>
          </div>
        </div>
        <div className="rounded-2xl border-2 px-3 py-2 self-center" style={{ borderColor: WA.green, background: "#E7F8EE", color: WA.green }}>
          <span className="text-[11px] font-bold uppercase tracking-wider">Arjun is requesting access</span>
        </div>
        <h2 className="text-[22px] font-bold text-gray-900 mt-5 leading-tight text-center">
          Verify your email ID
        </h2>

        <div className="mt-5 rounded-2xl border border-gray-200 bg-[#FAFAFA] p-4 space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#E7F8EE" }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: WA.green }} />
            </div>
            <div className="text-[13px] font-semibold text-gray-900 pt-1">
              Never miss a payment <span style={{ color: "#2563EB" }}>due date</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#E7F8EE" }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: WA.green }} />
            </div>
            <div className="text-[13px] font-semibold text-gray-900 pt-1">
              Check <span style={{ color: "#2563EB" }}>fake loans</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#E7F8EE" }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: WA.green }} />
            </div>
            <div className="text-[13px] font-semibold text-gray-900 pt-1">
              Find <span style={{ color: "#2563EB" }}>hidden charges</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#E7F8EE" }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: WA.green }} />
            </div>
            <div className="text-[13px] font-semibold text-gray-900 pt-1">
              Earn <span style={{ color: "#2563EB" }}>rewards & cashbacks</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[13px] font-semibold text-gray-900">
          Trusted by 6 Lakh+ Users <span className="text-gray-400 mx-1">|</span>{" "}
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: WA.green }} />
            100% Safe & Secure
          </span>
        </div>
      </div>
      <div className="p-6 space-y-3">
        <button onClick={onContinue} className="w-full text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2" style={{ background: "#4285F4" }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        <p className="text-center text-[11px] text-gray-500 leading-relaxed px-2">
          GoodScore reads only loan statements and bills from your email. We don&apos;t store any data
        </p>
      </div>
    </div>
  );
}

function LoadingScreen({ label, onDone }: { label: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 text-center">
      <Loader2 className="w-10 h-10 animate-spin" style={{ color: WA.green }} />
      <p className="mt-5 text-sm font-medium text-gray-700">{label}</p>
    </div>
  );
}

function _EmailPermImpl(onDone: () => void) {
  return (
    <div className="flex-1 flex flex-col relative bg-gray-300">
      <div className="absolute inset-0 px-6 pt-6 opacity-30 pointer-events-none bg-white">
        <div className="text-sm font-semibold text-gray-900">Enter your PAN details</div>
      </div>
      <div className="absolute inset-x-3 top-10 bottom-3 bg-[#1f1f1f] rounded-2xl shadow-2xl text-white overflow-y-auto">
        <div className="px-5 py-3 flex items-center gap-2 border-b border-white/10 text-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4c-.2 1.3-.9 2.4-1.9 3.1v2.6h3.1c1.8-1.7 2.9-4.1 2.9-7.4z"/>
            <path fill="#34A853" d="M12 22c2.6 0 4.7-.8 6.3-2.3l-3.1-2.4c-.8.6-2 .9-3.3.9-2.5 0-4.7-1.7-5.4-4H3.4v2.6C5 19.9 8.2 22 12 22z"/>
            <path fill="#FBBC05" d="M6.6 14.2c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.8H3.4C2.6 9.3 2.2 11 2.2 12.3s.4 3 1.2 4.5l3-2.6z"/>
            <path fill="#EA4335" d="M12 6.4c1.4 0 2.7.5 3.7 1.4l2.7-2.7C16.7 3.5 14.6 2.6 12 2.6 8.2 2.6 5 4.7 3.4 7.8l3.2 2.6c.7-2.3 2.9-4 5.4-4z"/>
          </svg>
          <span className="font-medium">Sign in with Google</span>
        </div>
        <div className="px-6 pt-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: WA.accent }}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-[26px] font-normal mt-5 leading-tight">Sign in to GroScore</h2>
          <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-white/5 w-fit">
            <div className="w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-[11px] font-bold text-white">R</div>
            <span className="text-sm">rahul.k@gmail.com</span>
          </div>
          <p className="text-[13px] text-white/80 mt-5">
            Google will allow GroScore to access this info about you
          </p>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 mt-0.5 text-white/70" />
              <div className="text-sm font-medium">Name and profile picture</div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 mt-0.5 text-white/70" />
              <div className="text-sm font-medium">Email address</div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 mt-0.5 text-white/70" />
              <div>
                <div className="text-sm font-medium">Read bill & statement emails</div>
                <div className="text-[11px] text-white/60">Detect EMI, bills and credit-card statements</div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-white/60 mt-5 leading-relaxed">
            Review GroScore's <span className="text-[#8ab4f8]">privacy policy</span> and <span className="text-[#8ab4f8]">Terms of Service</span> to understand how GroScore will process and protect your data.
          </p>
          <p className="text-[11px] text-white/60 mt-3">
            Learn more about <span className="text-[#8ab4f8]">Sign in with Google</span>.
          </p>
        </div>
        <div className="px-5 py-4 flex justify-end gap-3 mt-2">
          <button onClick={onDone} className="px-5 py-2 rounded-full border border-white/30 text-[#8ab4f8] text-sm font-medium">
            Cancel
          </button>
          <button onClick={onDone} className="px-6 py-2 rounded-full text-sm font-semibold" style={{ background: "#8ab4f8", color: "#1f1f1f" }}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ====================== SCORE JOURNEY ====================== */
/* ====================== NTC CHECKLIST ====================== */
function NTCChecklistScreen({ user, onDone }: { user: DemoUser; onDone: () => void }) {
  const isNTC = user.key === "ntc";
  const steps = isNTC
    ? [
        { icon: Search, label: "Checking credit bureau" },
        { icon: UserPlus, label: "No score yet — that's okay" },
        { icon: Wallet, label: "Preparing your build-up plan" },
        { icon: BadgeCheck, label: "Arjun is ready to help" },
      ]
    : [
        { icon: Search, label: "Fetching credit report" },
        { icon: AlertTriangle, label: "Analyzing your 6 issues" },
        { icon: Wallet, label: "Preparing dispute plan" },
        { icon: BadgeCheck, label: "Arjun is ready to help" },
      ];

  const [done, setDone] = useState(0); // number of completed steps
  const total = steps.length;

  useEffect(() => {
    if (done >= total) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 900);
    return () => clearTimeout(t);
  }, [done, total, onDone]);

  const progress = done / total;
  const dash = 2 * Math.PI * 70;

  const title = isNTC ? "No score? No problem." : "We've analyzed your report";
  const subtitle = isNTC
    ? "You're new to credit — that's a clean slate. We'll help you build it together, step by step."
    : "Arjun has your full picture now. Let's turn things around, one step at a time.";

  return (
    <div className="flex-1 flex flex-col bg-white px-6 pt-6 pb-8 overflow-y-auto">
      <div className="text-[11px] font-bold tracking-[0.2em] text-gray-400">GROSCORE</div>

      <div className="mt-6 flex justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#F1F5F9" strokeWidth="6" />
            <circle
              cx="80" cy="80" r="70" fill="none"
              stroke={WA.accent} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={dash * (1 - progress)}
              style={{ transition: "stroke-dashoffset 0.7s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-md" style={{ background: WA.accent }}>
              <Wallet className="w-11 h-11 text-white" />
            </div>
          </div>
        </div>
      </div>

      <h1 className="mt-6 text-[26px] font-extrabold text-gray-900 text-center leading-tight">{title}</h1>
      <p className="mt-3 text-[15px] text-gray-600 text-center leading-relaxed px-2">{subtitle}</p>

      <div className="mt-7 space-y-3">
        {steps.map((s, i) => {
          const isDone = i < done;
          const isActive = i === done;
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-300 ${
                isActive ? "border-emerald-200 bg-emerald-50/40 shadow-sm" :
                isDone ? "border-gray-100 bg-white" : "border-gray-100 bg-white opacity-60"
              }`}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: isDone || isActive ? WA.accent : "#E5E7EB" }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-[15px] font-bold text-gray-900">{s.label}</div>
              {isDone ? (
                <CheckCircle2 className="w-6 h-6" style={{ color: WA.green }} />
              ) : isActive ? (
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: WA.green }} />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-[13px] text-gray-500">
        1.2 lakh+ Indians started here. You're in good hands 💚
      </p>
    </div>
  );
}



/* ====================== CALLS ====================== */
function IncomingCall({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center text-white"
      style={{ background: `linear-gradient(180deg, ${WA.greenDark}, #022019)` }}>
      <div className="mt-12 px-4 py-1.5 rounded-full bg-white/10 text-xs font-medium">GroScore audio call</div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "2s" }} />
          <img src={kabirImg} alt="Arjun" className="relative w-36 h-36 rounded-full object-cover border-4 border-white/30" />
        </div>
        <h2 className="text-3xl font-semibold mt-6">Arjun</h2>
        <p className="text-white/70 mt-1 text-sm">Calling…</p>
      </div>
      <div className="flex items-center justify-around w-full px-12 pb-12">
        <div className="flex flex-col items-center gap-2">
          <button onClick={onDecline} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          <span className="text-xs">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button onClick={onAccept} className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: WA.accent }}>
            <Phone className="w-7 h-7 text-white" />
          </button>
          <span className="text-xs">Accept</span>
        </div>
      </div>
    </div>
  );
}

function ActiveCall({ user, onEnd }: { user: DemoUser; onEnd: () => void }) {
  const lines = user.key === "distressed"
    ? ["Namaste Sonu! Main Arjun.", "Aapka score 413 hai — par tension mat lo.", "6 cheezein theek ho sakti hain.", "Sabse pehle ek galat entry hata dete hain…", "Main step-by-step guide karunga, theek hai?"]
    : ["Namaste Rahul! Main Arjun.", "Aapki report dekhi — abhi credit history nahi hai.", "Aap bank ke liye 'invisible' ho.", "Main ek guaranteed secured card dilwa deta hoon.", "3-4 mahine mein aapka score ban jayega…"];
  const [i, setI] = useState(0);
  const [sec, setSec] = useState(0);
  useEffect(() => { const iv = setInterval(() => setSec((s) => s + 1), 1000); return () => clearInterval(iv); }, []);
  useEffect(() => { const iv = setInterval(() => setI((x) => Math.min(x + 1, lines.length - 1)), 2800); return () => clearInterval(iv); }, [lines.length]);
  const mm = Math.floor(sec / 60).toString().padStart(2, "0");
  const ss = (sec % 60).toString().padStart(2, "0");
  return (
    <div className="flex-1 flex flex-col text-white" style={{ background: `linear-gradient(180deg, ${WA.greenDark}, #022019)` }}>
      <div className="flex-1 flex flex-col items-center pt-14">
        <img src={kabirImg} alt="Arjun" className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-xl" />
        <h2 className="text-2xl font-semibold mt-5">Arjun</h2>
        <p className="text-white/70 mt-1 text-sm">{mm}:{ss}</p>
      </div>
      <div className="mx-5 mb-6 rounded-2xl bg-white/10 backdrop-blur p-4 min-h-[100px]">
        <div className="text-[10px] uppercase text-white/60 mb-2 tracking-wider">Live subtitles</div>
        <p className="text-[15px] leading-snug">{lines[i]}</p>
      </div>
      <div className="flex items-center justify-around pb-10">
        <button className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center"><MicOff className="w-5 h-5" /></button>
        <button onClick={onEnd} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
          <PhoneOff className="w-7 h-7" />
        </button>
        <button className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center"><Volume2 className="w-5 h-5" /></button>
      </div>
    </div>
  );
}

/* ====================== CHAT ====================== */
function ChatScreen(props: {
  user: DemoUser; chat: ChatMsg[]; setChat: React.Dispatch<React.SetStateAction<ChatMsg[]>>;
  chatPhase: ChatPhase; setChatPhase: React.Dispatch<React.SetStateAction<ChatPhase>>;
  reportUpdated: boolean; tasksUpdated: boolean;
  menuOpen: boolean; setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onAcceptCall: () => void; onDeclineCall: () => void;
  openReport: () => void; openTasks: () => void; openHeader: () => void; openCall: () => void;
  tasks: typeof distressedTasks; onMenu: (k: string) => void; typing: boolean;
  onTaskAction: (taskId: string) => void;
  onPickFd: (card: FdCard) => void;
  onCallbackSelect: (opt: string) => void;
  onBuildCredit: () => void;
}) {
  const { user, chat, setChat, chatPhase, setChatPhase, menuOpen, setMenuOpen,
    onAcceptCall, onDeclineCall, openHeader, openCall, openReport, openTasks, tasks, onMenu, typing, onTaskAction, onPickFd, onCallbackSelect, onBuildCredit } = props;
  const [draft, setDraft] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const [sheet, setSheet] = useState<null | "report" | "tasks" | "updates" | "savings">(null);
  const [savingsPlan, setSavingsPlan] = useState(50);
  const [mandateOpen, setMandateOpen] = useState(false);
  const [mandateStep, setMandateStep] = useState<"review" | "otp" | "success">("review");
  const updates = updatesFeed(user.key);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, typing]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setChat((c) => [...c, { id: "u" + Date.now(), from: "user", kind: "text", text, time: nowTime() }]);
    setDraft("");
    const isNTC = user.key === "ntc";
    const q = text.toLowerCase();
    const reply = async (items: Array<Omit<ChatMsg, "time" | "id">>) => {
      for (const it of items) {
        await new Promise((r) => setTimeout(r, 700));
        setChat((c) => [...c, { ...it, id: "c" + Date.now() + Math.random(), time: nowTime() } as ChatMsg]);
      }
    };
    const isGreeting = /\b(hi|hii|hello|hey|hola|namaste|namaskar|salaam|hlo)\b/.test(q);
    const asksScore = /(score|cibil|report|credit\s*report|kitna|kya\s*hai|show|dikha)/.test(q) && !/task/.test(q);
    const asksTasks = /(task|tasks|to\s*do|todo|kaam|karna|action|plan|list)/.test(q);
    const asksSavings = /(saving|savings|autopay|fd|deposit|jama)/.test(q);
    const asksThanks = /(thank|thanks|shukriya|dhanyawad)/.test(q);

    (async () => {
      if (isGreeting) {
        await reply([
          { from: "coach", kind: "text", text: `Namaste ${user.name} 🙏` },
          { from: "coach", kind: "text", text: isNTC
              ? "Batao, kaise madad karu? Aap poochh sakte ho — 'mera score', 'mere tasks', ya 'daily savings' 💚"
              : "Kaise madad karu? Aap likh sakte ho — 'mera score', 'mere tasks', ya 'savings plan' 💚" },
        ]);
        return;
      }
      if (asksScore) {
        if (isNTC) {
          await reply([
            { from: "coach", kind: "text", text: "Abhi aapki credit history nahi hai — isliye score generate nahi hua." },
            { from: "coach", kind: "text", text: "Tension mat lo, yeh normal hai first-time users ke liye. Ek secured card se 60–90 din mein score ban jayega 💪" },
            { from: "coach", kind: "text", text: "Chalo, main aapko build karne mein help karta hoon 👇" },
          ]);
          setTimeout(() => onBuildCredit(), 2600);
        } else {
          await reply([
            { from: "coach", kind: "text", text: `Aapka current score hai ${user.score} — band: ${user.band}.` },
            { from: "coach", kind: "text", text: "Yeh rahi aapki poori report 👇" },
            { from: "coach", kind: "report", text: "Credit Report.pdf" },
            { from: "coach", kind: "text", text: "Kuch samajh nahi aaye toh bata dena — main breakdown kar dunga." },
          ]);
        }
        return;
      }
      if (asksTasks) {
        const todo = tasks.filter((t) => t.status === "todo");
        if (todo.length === 0) {
          await reply([{ from: "coach", kind: "text", text: "Abhi koi pending task nahi hai 🎉 Sab caught up ho!" }]);
          return;
        }
        await reply([
          { from: "coach", kind: "text", text: `Aapke paas ${todo.length} pending task${todo.length > 1 ? "s" : ""} hain — priority order mein:` },
        ]);
        for (const t of todo.slice(0, 3)) {
          await reply([{ from: "coach", kind: "task", meta: { taskId: t.id } }]);
        }
        if (todo.length > 3) {
          await reply([{ from: "coach", kind: "text", text: `Aur ${todo.length - 3} tasks bhi hain — 'Tasks' tab mein dekh lena.` }]);
        }
        await reply([{ from: "coach", kind: "text", text: "Kaunsa pehle karna hai? Tap kar do 👆" }]);
        return;
      }
      if (asksSavings) {
        await reply([
          { from: "coach", kind: "text", text: "Aapka daily savings autopay abhi ₹50/day pe chal raha hai ✅" },
          { from: "coach", kind: "text", text: "Chaho toh ₹60 ya ₹100/day tak badha sakte ho — FD tezi se banegi aur card limit bhi zyada milegi." },
          { from: "coach", kind: "text", text: "Menu se 'Daily Savings' kholo aur amount update kar do 👍" },
        ]);
        return;
      }
      if (asksThanks) {
        await reply([{ from: "coach", kind: "text", text: "Bilkul, mera kaam hi yahi hai 💚 Aur kuch chahiye toh bata dena." }]);
        return;
      }
      await reply([
        { from: "coach", kind: "text", text: "Samjha 🙂 Main aapki madad kar sakta hoon in cheezon mein:" },
        { from: "coach", kind: "text", text: isNTC
            ? "• Credit score build karna\n• Secured card lena\n• Daily savings setup\n• Kisi bhi credit-related sawaal ka jawab"
            : "• Credit score aur report samajhna\n• Pending tasks fix karna\n• Daily savings & FD\n• Kisi bhi credit-related sawaal ka jawab" },
        { from: "coach", kind: "text", text: "Aap simple likh do — 'mera score', 'mere tasks', ya 'savings' 👇" },
      ]);
    })();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Frozen header */}
      <div className="relative flex items-center gap-2 px-2 h-14 text-white shrink-0 z-20" style={{ background: WA.green }}>
        <button onClick={openHeader} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
          <div className="relative shrink-0">
            <img src={kabirImg} alt="" className="w-9 h-9 rounded-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[17px] leading-tight truncate">Arjun</div>
            <div className="text-[11px] text-white/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
              online
            </div>
          </div>
        </button>
        <button onClick={openCall} className="p-2"><Phone className="w-5 h-5" /></button>
        <button onClick={() => setMenuOpen((v) => !v)} className="p-2"><MoreVertical className="w-5 h-5" /></button>
        {menuOpen && (
          <div className="absolute top-12 right-2 bg-white rounded-lg shadow-2xl py-1 min-w-[200px] z-30 text-gray-900">
            <MenuItem icon={User} label="My Profile" onClick={() => onMenu("profile")} />
            <MenuItem icon={Settings} label="Manage Subscription" onClick={() => onMenu("sub")} />
            <MenuItem icon={MessageCircle} label="Help" onClick={() => onMenu("help")} />
            <MenuItem icon={LogOut} label="Logout" onClick={() => onMenu("logout")} />
          </div>
        )}
      </div>

      {/* Chat body — frozen between header/footer, scrolls inside */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-1.5"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: DOODLE_URL,
          backgroundSize: "300px 300px",
          backgroundRepeat: "repeat",
        }}>
        <div className="flex justify-center my-2">
          <div className="bg-white rounded-md px-2.5 py-1 text-[11px] text-gray-600 shadow-sm">Today</div>
        </div>
        <div className="flex justify-center my-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-1.5 text-[11px] text-gray-700 shadow-sm flex items-center gap-1.5 max-w-[80%] text-center">
            <Lock className="w-3 h-3" />
            Messages are end-to-end encrypted. No one outside this chat, not even GroScore, can read them.
          </div>
        </div>
        {chat.map((m) => (
          <Bubble key={m.id} m={m} tasks={tasks}
            onTaskAction={onTaskAction}
            onAcceptCall={() => { onAcceptCall(); setChatPhase("in-call"); }}
            onDeclineCall={onDeclineCall}
            onPickFd={(card) => {
              onPickFd(card);
            }}
            onCallbackSelect={onCallbackSelect}
          />
        ))}
        {typing && (
          <div className="flex justify-start items-end gap-2">
            <img src={kabirImg} alt="Arjun" className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0" />
            <div className="rounded-full shadow-sm bg-white px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Frozen footer composer */}
      <div className="px-2 py-2 flex items-center gap-2 shrink-0 relative" style={{ background: "#F0F0F0" }}>
        <div className="flex-1 flex items-center bg-white rounded-full px-3 py-2 shadow-sm">
          <Smile className="w-5 h-5 text-gray-500" />
          <input value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask me anything…"
            className="flex-1 outline-none px-2 bg-transparent text-[15px]" />
          <Camera className="w-5 h-5 text-gray-500" />
        </div>
        <div className="relative">
          {(() => {
            const todoCount = tasks.filter((t) => t.status === "todo").length;
            const reportCount = user.hasScore
              ? distressedFactors.filter((f) => f.status === "Needs fix").length
              : 0;
            const updatesCount = updates.length;
            const savingsCount = 1;
            const totalCount = todoCount + reportCount + updatesCount + savingsCount;
            const reportSub = user.hasScore
              ? `Score ${user.score} · ${user.band}`
              : "NTC profile · build score";
            const tasksSub = todoCount > 0 ? `${todoCount} pending action${todoCount > 1 ? "s" : ""}` : "All caught up";
            const updatesSub = updates[updates.length - 1]?.title || "No updates yet";
            const savingsSub = "₹30–₹50/day · ₹2,500 goal";
            return (
              <>
                {quickOpen && !draft.trim() && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setQuickOpen(false)} />
                    <div className="absolute bottom-[52px] right-0 bg-white rounded-xl shadow-2xl py-1 min-w-[240px] z-40 border border-black/5">
                      <QuickItem icon={FileText} label="Credit Report" subtitle={reportSub} count={reportCount} onClick={() => { setQuickOpen(false); setSheet("report"); }} />
                      <QuickItem icon={CheckCircle2} label="Tasks" subtitle={tasksSub} count={todoCount} onClick={() => { setQuickOpen(false); setSheet("tasks"); }} />
                      <QuickItem icon={Sparkles} label="Updates" subtitle={updatesSub} count={updatesCount} onClick={() => { setQuickOpen(false); setSheet("updates"); }} />
                      <QuickItem icon={Wallet} label="Daily Savings" subtitle={savingsSub} count={savingsCount} onClick={() => { setQuickOpen(false); setSheet("savings"); }} />
                    </div>
                  </>
                )}
                <button onClick={() => { if (draft.trim()) send(); else setQuickOpen((v) => !v); }}
                  className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow relative"
                  style={{ background: WA.green }}>
                  {draft.trim() ? <Send className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                  {!draft.trim() && totalCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#F0F0F0]">
                      {totalCount}
                    </span>
                  )}
                </button>
              </>
            );
          })()}
        </div>
      </div>

      {sheet && (
        <>
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setSheet(null)} />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl z-50 max-h-[75%] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="pt-2 pb-1 flex justify-center"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
            <div className="px-4 py-2 flex items-center justify-between border-b">
              <div className="font-semibold text-[15px] text-gray-900">
                {sheet === "report" && "Credit Report"}
                {sheet === "tasks" && "Your Tasks"}
                {sheet === "updates" && "Updates"}
                {sheet === "savings" && "Daily Savings"}
              </div>
              <button onClick={() => setSheet(null)} className="p-1"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {sheet === "report" && (
                <div className="space-y-3">
                  {user.hasScore ? (
                    <>
                      <ScoreGaugeCard value={user.score ?? 413} />
                      {distressedFactors.map((f) => (
                        <div key={f.name} className="flex items-center justify-between border-b border-gray-100 py-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{f.name}</div>
                            <div className="text-[11px] text-gray-500">{f.note}</div>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{f.status}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="rounded-xl p-4 text-white text-center" style={{ background: WA.green }}>
                      <div className="text-xs opacity-90">Credit Profile</div>
                      <div className="text-2xl font-bold mt-1">NTC</div>
                      <div className="text-xs mt-1 opacity-90">No history yet — let's build one 💪</div>
                    </div>
                  )}
                </div>
              )}
              {sheet === "tasks" && (
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <button key={t.id} onClick={() => { setSheet(null); onTaskAction(t.id); }}
                      className="w-full text-left border border-gray-200 rounded-xl p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{t.title}</div>
                          <div className="text-[12px] text-gray-500 mt-0.5">{t.desc}</div>
                        </div>
                        {t.impact > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white shrink-0" style={{ background: WA.green }}>+{t.impact}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {sheet === "updates" && (
                <div className="space-y-2">
                  {updates.map((u) => (
                    <div key={u.id} className="border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{u.tag}</div>
                        <div className="text-[11px] text-gray-500">{u.when}</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1.5">{u.title}</div>
                      <div className="text-[12px] text-gray-600 mt-0.5">{u.desc}</div>
                    </div>
                  ))}
                </div>
              )}
              {sheet === "savings" && (
                <div className="space-y-4">
                  <div className="rounded-xl p-4" style={{ background: "#F7FBF8" }}>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Saved so far</div>
                        <div className="text-2xl font-extrabold text-gray-900 mt-0.5">₹450</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Goal</div>
                        <div className="text-base font-bold text-gray-900 mt-0.5">₹2,500</div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: "18%", background: WA.green }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[12px] text-gray-600">
                      <span>18% funded</span>
                      <span>~51 days left @ ₹{savingsPlan}/day</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Pick your daily amount</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { d: 50, goal: 2500, days: 50, tag: "Current" },
                      { d: 60, goal: 3000, days: 50, tag: "Increase" },
                      { d: 100, goal: 5000, days: 50, tag: "Boost" },
                    ].map((p) => {
                      const active = savingsPlan === p.d;
                      return (
                        <button
                          key={p.d}
                          onClick={() => setSavingsPlan(p.d)}
                          className={`rounded-xl px-2 py-3 text-center border-2 transition ${active ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-900"}`}
                          style={active ? { background: WA.green } : undefined}
                        >
                          <div className="text-[10px] font-semibold opacity-70 uppercase tracking-wide">{p.tag}</div>
                          <div className="text-[11px] font-semibold opacity-80 mt-0.5">₹{p.d}/day</div>
                          <div className="text-[15px] font-extrabold mt-0.5">₹{p.goal.toLocaleString("en-IN")}</div>
                          <div className="text-[10px] opacity-80 mt-0.5">{p.days} days</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: "#EEF6FF" }}>
                    <div className="text-lg leading-none">💰</div>
                    <div className="text-[12.5px] text-gray-700 leading-snug">
                      Your savings sit in an <b>FD earning 7.25% p.a.</b> — you keep the interest and the FD becomes the security for your card.
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t">
              <button onClick={() => {
                const s = sheet;
                if (s === "savings") { setMandateStep("review"); setMandateOpen(true); return; }
                setSheet(null);
                if (s === "report") {
                  if (!user.hasScore) onBuildCredit();
                  else openReport();
                } else if (s === "tasks") openTasks();
              }}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold" style={{ background: WA.green }}>
                {sheet === "report"
                  ? (user.hasScore ? "Open full report" : "Build credit score")
                  : sheet === "tasks" ? "Open full tasks"
                  : sheet === "savings" ? `Update autopay · ₹${savingsPlan}/day`
                  : "Open full updates"}
              </button>
            </div>
          </div>
        </>
      )}
      {mandateOpen && (
        <div className="absolute inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60">
          <div className="w-full bg-white rounded-t-2xl sm:rounded-2xl max-w-md shadow-2xl flex flex-col max-h-[85%]">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-bold" style={{ background: "#0C2451" }}>R</div>
                <div className="font-semibold text-[15px] text-gray-900">Razorpay · Autopay</div>
              </div>
              <button onClick={() => setMandateOpen(false)} className="p-1"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {mandateStep === "review" && (
                <div className="space-y-4">
                  <div className="rounded-xl p-4 border border-gray-200">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Existing mandate</div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <div className="text-[15px] font-bold text-gray-900">₹40 / day</div>
                      <div className="text-[11px] text-gray-500">Active · HDFC ••2461</div>
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "#F7FBF8" }}>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">New mandate</div>
                    <div className="mt-2 space-y-1.5 text-[13px] text-gray-700">
                      <div className="flex justify-between"><span>Amount</span><b className="text-gray-900">₹{savingsPlan} / day</b></div>
                      <div className="flex justify-between"><span>Frequency</span><b className="text-gray-900">Daily · until cancelled</b></div>
                      <div className="flex justify-between"><span>Max debit</span><b className="text-gray-900">₹{savingsPlan * 31} / month</b></div>
                      <div className="flex justify-between"><span>Bank</span><b className="text-gray-900">HDFC ••2461</b></div>
                      <div className="flex justify-between"><span>Destination</span><b className="text-gray-900">Fi FD · 7.25% p.a.</b></div>
                    </div>
                  </div>
                  <div className="text-[11.5px] text-gray-500 leading-snug">
                    By continuing, you authorise Razorpay to update your existing UPI Autopay mandate. You'll approve the change in your UPI app.
                  </div>
                  <button
                    onClick={() => setMandateStep("otp")}
                    className="w-full py-3 rounded-lg text-white font-semibold" style={{ background: "#0C2451" }}
                  >
                    Continue on UPI app
                  </button>
                </div>
              )}
              {mandateStep === "otp" && (
                <div className="space-y-4 py-6 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#EEF2FF" }}>
                    <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#0C2451", borderTopColor: "transparent" }} />
                  </div>
                  <div className="font-semibold text-gray-900">Waiting for approval in your UPI app</div>
                  <div className="text-[12.5px] text-gray-500 leading-snug">Open Google Pay / PhonePe / Paytm and approve the updated mandate of ₹{savingsPlan}/day.</div>
                  <button onClick={() => setMandateStep("success")} className="text-[13px] font-semibold" style={{ color: WA.green }}>
                    I've approved — continue
                  </button>
                </div>
              )}
              {mandateStep === "success" && (
                <div className="space-y-4 py-4 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl" style={{ background: WA.green }}>✓</div>
                  <div className="font-semibold text-gray-900">Autopay updated</div>
                  <div className="text-[12.5px] text-gray-500 leading-snug">
                    ₹{savingsPlan} will be debited every day from HDFC ••2461 and moved into your Fi FD earning 7.25% p.a.
                  </div>
                  <button
                    onClick={() => { setMandateOpen(false); setSheet(null); }}
                    className="w-full py-3 rounded-lg text-white font-semibold" style={{ background: WA.green }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickItem({ icon: Icon, label, subtitle, count, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; subtitle?: string; count?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-700" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-gray-900 leading-tight">{label}</div>
        {subtitle && <div className="text-[11px] text-gray-500 mt-0.5 truncate">{subtitle}</div>}
      </div>
      {typeof count === "number" && count > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
          {count}
        </span>
      )}
    </button>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-black/5 text-left">
      <Icon className="w-4 h-4 text-gray-600" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function Bubble({ m, tasks, onAcceptCall, onDeclineCall, onPickFd, onTaskAction, onCallbackSelect }:
  { m: ChatMsg; tasks: { id: string; title: string; impact: number; desc: string; status: string }[]; onAcceptCall: () => void; onDeclineCall: () => void; onPickFd: (card: FdCard) => void; onTaskAction: (id: string) => void; onCallbackSelect?: (opt: string) => void }) {
  if (m.from === "system") {
    if (m.kind === "callLog") {
      return (
        <div className="flex justify-center my-2">
          <div className="bg-white rounded-md px-3 py-1.5 text-[11px] text-gray-600 shadow-sm flex items-center gap-1.5">
            <Phone className="w-3 h-3" /> {m.text}
          </div>
        </div>
      );
    }
    return (
      <div className="flex justify-center my-2">
        <div className="bg-white rounded-md px-2.5 py-1 text-[11px] text-gray-600 shadow-sm">{m.text}</div>
      </div>
    );
  }
  const isUser = m.from === "user";
  if (m.kind === "fdCarousel") {
    return (
      <div className="-mx-3 px-3 my-2">
        <FdCarousel onPick={onPickFd} />
        <div className="text-[10px] text-gray-500 text-right mt-1 mr-1">{m.time}</div>
      </div>
    );
  }
  if (m.kind === "callRequest") {
    return (
      <div className="flex justify-start">
        <div className="rounded-lg shadow-sm bg-white px-3 py-2.5 max-w-[85%]">
          <p className="text-[14px] text-gray-800">Can I call you now to walk you through your profile?</p>
          <div className="flex gap-2 mt-3">
            <button onClick={onDeclineCall}
              className="flex-1 py-2 rounded-md border border-gray-200 text-sm font-semibold text-gray-700 flex items-center justify-center gap-1.5">
              <X className="w-4 h-4" /> Not now
            </button>
            <button onClick={onAcceptCall}
              className="flex-1 py-2 rounded-md text-white text-sm font-semibold flex items-center justify-center gap-1.5"
              style={{ background: WA.accent }}>
              <Phone className="w-4 h-4" /> Accept call
            </button>
          </div>
          <div className="text-[10px] text-gray-500 text-right mt-1.5">{m.time}</div>
        </div>
      </div>
    );
  }
  if (m.kind === "callbackOptions") {
    const options = ["Abhi", "30 min baad", "Shaam ko 7 baje", "Koi aur time"];
    return (
      <div className="flex justify-start">
        <div className="rounded-lg shadow-sm bg-white px-3 py-2.5 max-w-[85%]">
          <p className="text-[14px] text-gray-800 mb-2">Kab call karu? 👇</p>
          <div className="flex flex-col gap-2">
            {options.map((opt) => (
              <button key={opt} onClick={() => onCallbackSelect?.(opt)}
                className="text-left px-3 py-2 rounded-md text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition active:scale-[0.98]">
                {opt}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-gray-500 text-right mt-1.5">{m.time}</div>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[82%] rounded-lg shadow-sm px-2.5 pt-1.5 pb-1 ${isUser ? "" : "bg-white"}`}
        style={isUser ? { background: WA.bubbleOut } : undefined}>
        {m.kind === "report" && <DocCard title={m.text || "Credit Report.pdf"} subtitle="Tap to view" img={reportPreview} />}
        {m.kind === "plan" && <DocCard title={m.text || "Action Plan.pdf"} subtitle="Personalized roadmap" img={actionPlanPreview} />}
        {m.kind === "projection" && <ProjectionCard />}
        {m.kind === "videoIntro" && <VideoIntroCard />}
        {m.kind === "applyLink" && <ApplyLinkCard meta={m.meta as { bank: string; name: string; url: string; color: string }} />}
        {m.kind === "task" && <TaskCard task={tasks.find((x) => x.id === (m.meta as { taskId?: string } | undefined)?.taskId)} onAction={onTaskAction} />}
        {m.kind === "emailDraft" && <EmailDraftCard taskId={(m.meta as { taskId?: string } | undefined)?.taskId} />}
        {m.kind === "text" && <p className="text-[14.5px] leading-snug whitespace-pre-wrap text-gray-900 px-1">{m.text}</p>}
        <div className="text-[10px] text-gray-500 text-right mt-0.5 flex items-center justify-end gap-1 px-1">
          {m.time}
          {isUser && <CheckCheck className="w-3.5 h-3.5" style={{ color: WA.tick }} />}
        </div>
      </div>
    </div>
  );
}

function DocCard({ title, subtitle, img }: { title: string; subtitle: string; img: string }) {
  return (
    <div className="w-[250px]">
      <img src={img} alt="" className="w-full h-32 object-cover rounded-md" loading="lazy" />
      <div className="mt-2 bg-black/5 rounded-md px-2.5 py-2 flex items-center gap-2">
        <div className="w-8 h-9 bg-red-500 rounded flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-semibold text-[13px] text-gray-900">{title}</div>
          <div className="text-[11px] text-gray-500">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function ProjectionCard() {
  return (
    <div className="w-[260px]">
      <img src={scoreProjection} alt="Score projection" className="w-full h-36 object-cover rounded-md" loading="lazy" />
      <div className="mt-2 px-1">
        <div className="font-semibold text-[13px] text-gray-900">Your score projection</div>
        <div className="text-[11px] text-gray-500">413 → 720 in ~6 months · if all tasks done</div>
      </div>
    </div>
  );
}

function VideoIntroCard() {
  const url = "https://www.youtube.com/watch?v=f8RnRuaxee8";
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block w-[260px]">
      <div className="relative rounded-md overflow-hidden bg-black">
        <div className="h-36 w-full flex items-center justify-center relative"
          style={{ background: `linear-gradient(135deg, ${WA.green}, #054C44)` }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="relative z-10 text-center text-white px-3">
            <div className="text-[10px] uppercase tracking-widest opacity-80">Watch · 2 min</div>
            <div className="font-bold text-[15px] leading-tight mt-1">What is NTC?</div>
            <div className="text-[11px] opacity-90 mt-0.5">Why banks can't see you yet</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
              <div className="w-0 h-0" style={{ borderLeft: "14px solid #054C44", borderTop: "9px solid transparent", borderBottom: "9px solid transparent", marginLeft: 3 }} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 px-1 flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-sm bg-red-600 flex items-center justify-center">
          <div className="w-0 h-0" style={{ borderLeft: "4px solid white", borderTop: "3px solid transparent", borderBottom: "3px solid transparent", marginLeft: 1 }} />
        </div>
        <div className="text-[11px] text-gray-600 truncate">youtube.com · GroScore Academy</div>
      </div>
    </a>
  );
}

function ApplyLinkCard({ meta }: { meta: { bank: string; name: string; url: string; color: string } }) {
  const [applied, setApplied] = useState(false);
  return (
    <div className="w-[260px]">
      <div className="rounded-md overflow-hidden bg-black/[0.04]">
        <div className="h-14 flex items-center px-3 text-white" style={{ background: `linear-gradient(135deg, ${meta.color}, #000)` }}>
          <div className="text-[13px] font-bold leading-tight">{meta.bank}</div>
        </div>
        <div className="px-3 py-2">
          <div className="text-[13px] font-semibold text-gray-900 leading-tight">{meta.name}</div>
          <div className="text-[11px] text-gray-500 truncate">🔗 {meta.url}</div>
        </div>
      </div>
      <button onClick={() => setApplied(true)} disabled={applied}
        className="mt-1.5 w-full text-white text-[14px] font-bold py-2 rounded-md flex items-center justify-center gap-1.5"
        style={{ background: applied ? "#9CA3AF" : WA.accent }}>
        {applied ? "✓ Application started" : <>Apply Now <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}

function TaskCard({ task, onAction }: { task: { id: string; title: string; impact: number; desc: string } | undefined; onAction?: (id: string) => void }) {
  if (!task) return null;
  return (
    <div className="w-[250px]">
      {/* WhatsApp-style "reply quote" strip */}
      <div className="rounded-md overflow-hidden bg-black/[0.04]">
        <div className="flex">
          <div className="w-1" style={{ background: WA.green }} />
          <div className="flex-1 px-2.5 py-1.5 min-w-0">
            <div className="text-[12px] font-semibold truncate" style={{ color: WA.green }}>Task</div>
            <div className="text-[13px] text-gray-900 font-medium truncate">{task.title}</div>
            <div className="text-[11.5px] text-gray-500 truncate">{task.desc}</div>
          </div>
          {task.impact > 0 && (
            <div className="px-2 self-center text-[11px] font-bold" style={{ color: WA.green }}>+{task.impact}</div>
          )}
        </div>
      </div>
      <button onClick={() => onAction?.(task.id)}
        className="mt-1 w-full text-[14px] font-semibold py-1.5 flex items-center justify-center gap-1.5 border-t border-black/5"
        style={{ color: WA.accent }}>
        Take action <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function EmailDraftCard({ taskId }: { taskId?: string }) {
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(true);
  // default = IndusInd enquiry dispute
  const to = "grievance.redressal@indusind.com";
  const subject = "Unauthorised hard enquiry on my credit report — request to remove";
  const body = `Dear IndusInd Bank Team,

I am writing regarding an unauthorised hard enquiry on my credit report from your institution.

My details:
• Name: Sonu Kumar
• Registered Phone: 98765 00002
• PAN: ABCPS5678F
• Enquiry date: 12 Jun 2026

I have not applied for any loan or credit card with IndusInd Bank. Kindly investigate this unauthorised enquiry and remove it from my credit bureau records (CIBIL, Experian, Equifax, CRIF) at the earliest. This is impacting my credit score unfairly.

Please share an acknowledgement within 7 working days.

Sincerely,
Sonu Kumar`;
  return (
    <div className="w-[280px] rounded-md overflow-hidden border border-gray-200">
      {/* header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#EA4335" }}>M</div>
          <span className="text-[13px] font-semibold text-gray-900">Email draft ready</span>
        </div>
        {sent ? (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: WA.green }}>Sent</span>
        ) : (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#E8F5E9", color: WA.green }}>Draft</span>
        )}
      </div>
      {/* body */}
      <div className="bg-white px-3 py-2.5 text-[12px] text-gray-800 space-y-1.5">
        <div><span className="text-gray-500">To: </span>{to}</div>
        <div><span className="text-gray-500">Subject: </span>{subject}</div>
        {open && (
          <div className="mt-2 bg-gray-50 rounded-md p-2.5 border border-gray-100">
            <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Email preview
            </div>
            <pre className="text-[11.5px] text-gray-800 whitespace-pre-wrap font-sans leading-snug">{body}</pre>
          </div>
        )}
        <button onClick={() => setOpen((v) => !v)} className="text-[11px] font-semibold pt-1" style={{ color: WA.green }}>
          {open ? "Show less ▲" : "Show full draft ▼"}
        </button>
      </div>
      {/* actions */}
      <div className="bg-white px-3 py-2.5 flex gap-2 border-t border-gray-100">
        <button onClick={() => setSent(true)} disabled={sent}
          className="flex-1 py-2 rounded-full text-[12px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
          style={{ background: sent ? "#9CA3AF" : WA.green, color: "white" }}>
          <Mail className="w-3.5 h-3.5" /> {sent ? "Email sent" : "Send email"}
        </button>
        <button className="flex-1 py-2 rounded-full text-[12px] font-semibold border flex items-center justify-center gap-1.5"
          style={{ borderColor: WA.green, color: WA.green }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Check status
        </button>
      </div>
      {sent && (
        <div className="bg-emerald-50 px-3 py-2 text-[11px] flex items-center gap-1.5" style={{ color: WA.green }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Sent! Expect a reply in 2–5 business days. {String(taskId ?? "")}
        </div>
      )}
    </div>
  );
}

/* ====================== FD CARD CAROUSEL ====================== */
function FdCarousel({ onPick }: { onPick: (card: FdCard) => void }) {
  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {fdCards.map((c) => (
          <button key={c.id} onClick={() => onPick(c)}
            className="snap-start shrink-0 w-[230px] rounded-xl overflow-hidden border border-gray-200 bg-white shadow text-left active:scale-[0.98] transition">
            <div className="h-24 p-3 text-white relative" style={{ background: `linear-gradient(135deg, ${c.color}, #000)` }}>
              <div className="text-[10px] opacity-80">{c.bank}</div>
              <div className="font-bold text-sm leading-tight mt-1">{c.name}</div>
              <div className="absolute bottom-2 right-3 text-[10px] bg-white/20 rounded px-2 py-0.5">{c.approval}</div>
            </div>
            <div className="p-3">
              <div className="text-[10px] uppercase text-gray-500 font-semibold">Min FD</div>
              <div className="font-bold text-gray-900">₹{c.minDeposit.toLocaleString("en-IN")}</div>
              <ul className="mt-2 space-y-1">
                {c.benefits.slice(0, 2).map((b) => (
                  <li key={b} className="text-[11px] text-gray-700 flex gap-1.5"><CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" style={{ color: WA.accent }} />{b}</li>
                ))}
              </ul>
              <div className="mt-3 text-xs font-semibold text-center py-1.5 rounded" style={{ background: "#E8F5E9", color: WA.green }}>
                View details
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function FdDetailSheet({ card, onClose }: { card: FdCard; onClose: () => void }) {
  const [applied, setApplied] = useState(false);
  return (
    <div className="absolute inset-0 z-40 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl max-h-[85%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <div className="rounded-xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${card.color}, #000)` }}>
            <div className="text-xs opacity-80">{card.bank}</div>
            <div className="font-bold text-lg mt-1">{card.name}</div>
            <div className="mt-6 tracking-widest text-sm">•••• •••• •••• ••••</div>
            <div className="flex items-end justify-between mt-3 text-xs">
              <div><div className="opacity-70">Min FD</div><div className="font-semibold">₹{card.minDeposit.toLocaleString("en-IN")}</div></div>
              <div className="font-semibold">{card.approval}</div>
            </div>
          </div>
          <div className="mt-5">
            <div className="text-xs uppercase font-semibold text-gray-500">Benefits</div>
            <ul className="mt-2 space-y-2">
              {card.benefits.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-gray-800">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: WA.accent }} />{b}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="text-[10px] uppercase text-gray-500 font-semibold">Fees</div>
              <div className="font-semibold text-gray-900 mt-1">{card.fee}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <div className="text-[10px] uppercase text-gray-500 font-semibold">Approval</div>
              <div className="font-semibold text-gray-900 mt-1">{card.approval}</div>
            </div>
          </div>
          <div className="mt-5 p-3 rounded-lg flex gap-2" style={{ background: "#FEF3C7" }}>
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-700" />
            <div className="text-xs text-yellow-900">Your FD earns interest and is refunded when you close the card. KYC required.</div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 sticky bottom-0 bg-white">
          {applied ? (
            <div className="text-center text-sm font-semibold py-3 rounded-full" style={{ background: "#E8F5E9", color: WA.green }}>
              ✓ Application submitted! Arjun will follow up in chat.
            </div>
          ) : (
            <button onClick={() => setApplied(true)}
              className="w-full text-white font-bold py-3.5 rounded-full" style={{ background: WA.accent }}>
              Apply with {card.bank}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====================== REPORT ====================== */
function ReportScreen({ user, onBack, onStartChat }: { user: DemoUser; onBack: () => void; onStartChat: () => void }) {
  const isNTC = user.key === "ntc";
  if (isNTC) {
    const steps = [
      { title: "Get a secured card", desc: "Against a small FD — guaranteed approval" },
      { title: "Use it for daily purchases", desc: "Groceries, fuel, recharges — keep usage under 30%" },
      { title: "Pay full bill on time", desc: "Every on-time payment = positive mark" },
      { title: "Score appears in 90 days", desc: "Bureaus start tracking you — you become visible" },
    ];
    return (
      <div className="flex-1 min-h-0 flex flex-col bg-gray-50">
        <div className="flex items-center gap-3 px-3 h-14 text-white shrink-0" style={{ background: WA.green }}>
          <button onClick={onBack}><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="font-semibold text-[17px] flex-1">Credit Report</h1>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {/* Hero: No score yet */}
          <button
            onClick={onStartChat}
            className="w-full text-left rounded-2xl p-6 active:scale-[0.99] transition"
            style={{ background: "#E8F5EE" }}
          >
            <div className="w-20 h-20 rounded-full bg-white mx-auto flex items-center justify-center text-4xl shadow-sm">🌱</div>
            <h2 className="text-2xl font-extrabold text-gray-900 text-center mt-4">No credit score yet</h2>
            <p className="text-[15px] text-gray-600 text-center mt-2 leading-relaxed px-2">
              Don't worry, {user.name}! You're "new to credit" — banks just haven't seen you yet. We'll help you build a strong score from zero.
            </p>
          </button>

          {/* Secured Card explainer */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <button onClick={onStartChat} className="w-full text-left">
              <div className="font-bold text-gray-900 text-[17px]">Start with a Secured Card 💳</div>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                The fastest, guaranteed way to build your score in 3–4 months.
              </p>
            </button>
            <div className="mt-4 space-y-3">
              {steps.map((s, i) => (
                <button
                  key={s.title}
                  onClick={onStartChat}
                  className="w-full flex items-start gap-3 text-left rounded-xl p-2 -mx-2 hover:bg-gray-50 active:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm shrink-0" style={{ background: "#E8F5EE", color: WA.green }}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-[15px]">{s.title}</div>
                    <div className="text-[13px] text-gray-500 leading-snug mt-0.5">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={onStartChat}
              className="mt-5 w-full text-white font-bold py-4 rounded-full shadow-md active:scale-[0.98] transition"
              style={{ background: WA.accent }}
            >
              Get a Secured Card
            </button>
          </div>

          <DailySavingsBlock onStartChat={onStartChat} isNTC />

          {/* Wrong report */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="font-bold text-gray-900 text-[17px]">Wrong report? Let's fix it.</div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              If you already have loans or cards, your PAN or name may be incorrect. Update them so we can fetch the right report.
            </p>
            <button
              onClick={onStartChat}
              className="mt-4 w-full text-white font-bold py-4 rounded-full shadow-md active:scale-[0.98] transition"
              style={{ background: WA.accent }}
            >
              Update Name & PAN
            </button>
          </div>

          {/* Support ticket */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="font-bold text-gray-900 text-[17px]">Still see an error?</div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Raise a ticket and our support team will look into it within 24 hours.
            </p>
            <button
              onClick={onStartChat}
              className="mt-4 w-full text-white font-bold py-4 rounded-full shadow-md active:scale-[0.98] transition"
              style={{ background: WA.accent }}
            >
              Raise a Ticket
            </button>
          </div>

          <div className="h-4" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-gray-50">
      <div className="flex items-center gap-3 px-3 h-14 text-white shrink-0" style={{ background: WA.green }}>
        <button onClick={onBack}><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="font-semibold text-[17px] flex-1">Credit Report</h1>
        <Download className="w-5 h-5" />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <ScoreReportBody user={user} onStartChat={onStartChat} />
        <div className="h-4" />
      </div>
    </div>
  );
}

function ScoreReportBody({ user, onStartChat }: { user: DemoUser; onStartChat: () => void }) {
  const [tab, setTab] = useState<"cards" | "loans" | "enquiries">("cards");
  const cards = [
    { bank: "HDFC Bank", initial: "H", color: "#DC2626", last4: "4521", used: 128000, limit: 150000, pct: 85, tone: "danger" as const },
    { bank: "Axis Bank", initial: "A", color: "#8B1E3F", last4: "9289", used: 72000, limit: 120000, pct: 60, tone: "amber" as const },
    { bank: "SBI Card", initial: "S", color: "#1E3A8A", last4: "1102", used: 24000, limit: 80000, pct: 30, tone: "ok" as const },
  ];
  const loans = [
    { name: "Personal Loan", lender: "HDFC Bank", outstanding: 210000, emi: 8420, sanctioned: 300000, status: "On time", tone: "ok" as const },
    { name: "Consumer Loan", lender: "Bajaj Finserv", outstanding: 42000, emi: 3200, sanctioned: 55000, status: "On time", tone: "ok" as const },
    { name: "Auto Loan", lender: "ICICI Bank", outstanding: 228000, emi: 12800, sanctioned: 600000, status: "1 DPD", tone: "amber" as const },
    { name: "Two-wheeler Loan", lender: "TVS Credit", outstanding: 18000, emi: 1650, sanctioned: 65000, status: "On time", tone: "ok" as const },
  ];
  const enquiries = [
    { lender: "Kotak Bank", product: "Credit Card", date: "12 May 2026" },
    { lender: "IDFC FIRST", product: "Personal Loan", date: "28 Apr 2026" },
    { lender: "RBL Bank", product: "Credit Card", date: "14 Apr 2026" },
    { lender: "Bajaj Markets", product: "Consumer Loan", date: "02 Apr 2026" },
    { lender: "Paytm", product: "BNPL", date: "21 Mar 2026" },
  ];
  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const totalOutstanding = loans.reduce((s, l) => s + l.outstanding, 0);
  const toneBg = (t: "ok" | "amber" | "danger") => t === "danger" ? "#DC2626" : t === "amber" ? "#F59E0B" : WA.green;
  const toneChipBg = (t: "ok" | "amber" | "danger") => t === "danger" ? "#FEE2E2" : t === "amber" ? "#FEF3C7" : "#DCFCE7";
  const toneChipText = (t: "ok" | "amber" | "danger") => t === "danger" ? "#B91C1C" : t === "amber" ? "#B45309" : "#166534";
  const fmt = (n: number) => "₹ " + n.toLocaleString("en-IN");

  return (
    <>
      <ScoreGaugeCard value={user.score ?? 413} />

      <div className="grid grid-cols-3 gap-3">
        {[
          { v: "61%", l: "Utilisation" },
          { v: "97%", l: "On-time EMIs" },
          { v: "5", l: "Enquiries / 6m" },
        ].map((s) => (
          <div key={s.l} className="bg-white rounded-2xl p-3 shadow-sm">
            <div className="text-[22px] font-extrabold text-gray-900 leading-tight">{s.v}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-full p-1 shadow-sm grid grid-cols-3 gap-1">
        {([
          { k: "cards", label: "Cards", count: cards.length },
          { k: "loans", label: "Loans", count: loans.length },
          { k: "enquiries", label: "Enquiries", count: enquiries.length },
        ] as const).map((t) => {
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`py-2.5 rounded-full text-[13px] font-semibold flex items-center justify-center gap-1.5 transition ${active ? "text-white" : "text-gray-700"}`}
              style={active ? { background: WA.green } : undefined}
            >
              {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {tab === "cards" && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <span className="text-[13px] text-gray-500">Total limit</span>
            <span className="text-[15px] font-extrabold text-gray-900">{fmt(totalLimit)}</span>
          </div>
          {cards.map((c) => (
            <div key={c.last4} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-lg font-extrabold" style={{ background: c.color }}>{c.initial}</div>
                  <div>
                    <div className="font-bold text-gray-900">{c.bank}</div>
                    <div className="text-[12px] text-gray-500 tracking-widest">•••• {c.last4}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-extrabold" style={{ color: toneBg(c.tone) }}>{c.pct}%</div>
                  <div className="text-[10px] font-semibold text-gray-400 tracking-wider">USED</div>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: toneBg(c.tone) }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px] text-gray-500">
                <span className="font-semibold text-gray-700">{fmt(c.used)}</span>
                <span>Limit {fmt(c.limit)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "loans" && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <span className="text-[13px] text-gray-500">Total outstanding</span>
            <span className="text-[15px] font-extrabold text-gray-900">{fmt(totalOutstanding)}</span>
          </div>
          {loans.map((l) => (
            <div key={l.name} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900">{l.name}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{l.lender}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: toneChipBg(l.tone), color: toneChipText(l.tone) }}>{l.status}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                <div>
                  <div className="text-gray-400">Outstanding</div>
                  <div className="font-bold text-gray-900 mt-0.5">{fmt(l.outstanding)}</div>
                </div>
                <div>
                  <div className="text-gray-400">EMI</div>
                  <div className="font-bold text-gray-900 mt-0.5">{fmt(l.emi)}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400">Sanctioned</div>
                  <div className="font-bold text-gray-900 mt-0.5">{fmt(l.sanctioned)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "enquiries" && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-gray-100">
            <div>
              <div className="font-bold text-gray-900">Hard enquiries</div>
              <div className="text-[12px] text-gray-500 mt-0.5">Last 6 months</div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide" style={{ background: "#FEE2E2", color: "#B91C1C" }}>HIGH</span>
          </div>
          {enquiries.map((e) => (
            <div key={e.lender + e.date} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-bold text-gray-900 text-[14px]">{e.lender}</div>
                <div className="text-[12px] text-gray-500 mt-0.5">{e.product}</div>
              </div>
              <div className="text-[12px] text-gray-500">{e.date}</div>
            </div>
          ))}
        </div>
      )}

      <DailySavingsBlock onStartChat={onStartChat} isNTC={false} />
    </>
  );
}

function BigGauge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, (value - 300) / 600));
  const angle = 180 + pct * 180;
  const radius = 110;
  const cx = 130, cy = 130;
  const rad = (angle * Math.PI) / 180;
  const needleX = cx + radius * Math.cos(rad);
  const needleY = cy + radius * Math.sin(rad);
  return (
    <svg viewBox="0 0 260 150" className="w-full max-w-[280px]">
      <path d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`} fill="none" stroke="#F3F4F6" strokeWidth="14" strokeLinecap="round" />
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${needleX} ${needleY}`}
        fill="none"
        stroke="#DC2626"
        strokeWidth="14"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ScoreGaugeCard({ value, delta = 12 }: { value: number; delta?: number }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[17px] font-extrabold text-gray-900">Credit Score</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style={{ background: "#DC2626" }}>E</div>
            <div className="text-[12px] text-gray-500">Powered by Equifax</div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide" style={{ background: "#FEE2E2", color: "#B91C1C" }}>POOR</span>
      </div>
      <div className="mt-5 relative flex flex-col items-center">
        <BigGauge value={value} />
        <div className="absolute inset-x-0 top-8 text-center">
          <div className="text-[54px] font-extrabold text-gray-900 leading-none">{value}</div>
          <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold" style={{ background: "#DCFCE7", color: "#166534" }}>
            <TrendingUp className="w-3.5 h-3.5" />
            {delta} pts this month
          </div>
        </div>
        <div className="mt-2 w-full flex items-center justify-between text-[11px] text-gray-400 px-2">
          <span>300</span><span>600</span><span>750</span><span>900</span>
        </div>
      </div>
    </div>
  );
}

function DailySavingsBlock({ onStartChat, isNTC }: { onStartChat: () => void; isNTC: boolean }) {
  const plans = [
    { d: 50, goal: 2500, days: 50, tag: "Current" },
    { d: 60, goal: 3000, days: 50, tag: "Increase" },
    { d: 100, goal: 5000, days: 50, tag: "Boost" },
  ];
  const [selected, setSelected] = useState(50);
  const plan = plans.find((p) => p.d === selected)!;
  // Illustrative: ₹450 saved, ~30 days in, avg balance ~₹225 → interest at 7.25% p.a.
  const savedSoFar = 450;
  const interestEarned = 2.68;
  const pct = Math.round((savedSoFar / plan.goal) * 100);
  const daysLeft = Math.max(0, Math.ceil((plan.goal - savedSoFar) / plan.d));
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: "#FFF4E5" }}>🪙</div>
        <div className="flex-1">
          <div className="font-bold text-gray-900 text-[17px]">Daily Savings</div>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {isNTC
              ? <>Save just <b>₹30–₹50 a day</b> and unlock your Secured Card FD in ~{plan.days} days — no big lump sum needed.</>
              : <>Build a safety cushion — save <b>₹30–₹50 a day</b> into an FD earning 7.25% p.a. and unlock a higher-limit Secured Card.</>}
          </p>
        </div>
      </div>

      {/* Till now: balance + interest earned */}
      <div className="mt-4 rounded-xl p-4" style={{ background: "#F7FBF8" }}>
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Till now</div>
        <div className="mt-1 flex items-baseline justify-between">
          <div>
            <div className="text-[11px] text-gray-500">Balance</div>
            <div className="text-2xl font-extrabold text-gray-900">₹{savedSoFar.toLocaleString("en-IN")}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-500">Interest earned</div>
            <div className="text-base font-bold" style={{ color: WA.green }}>+ ₹{interestEarned.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-500">Goal</div>
            <div className="text-base font-bold text-gray-900">₹{plan.goal.toLocaleString("en-IN")}</div>
          </div>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: WA.green }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px] text-gray-600">
          <span>{pct}% funded</span>
          <span>~{daysLeft} days left @ ₹{plan.d}/day</span>
        </div>
      </div>

      {/* Plan chips — tap to pick */}
      <div className="mt-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Pick your daily amount</div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {plans.map((p) => {
          const active = p.d === selected;
          return (
            <button
              key={p.d}
              onClick={() => setSelected(p.d)}
              className={`rounded-xl px-2 py-3 text-center border-2 transition active:scale-[0.98] ${active ? "text-white" : "bg-white border-gray-200 text-gray-900"}`}
              style={active ? { background: WA.green, borderColor: WA.green } : undefined}
            >
              <div className="text-[10px] font-semibold opacity-70 uppercase tracking-wide">{p.tag}</div>
              <div className="text-[11px] font-semibold opacity-80 mt-0.5">₹{p.d}/day</div>
              <div className="text-[15px] font-extrabold mt-0.5">₹{p.goal.toLocaleString("en-IN")}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{p.days} days</div>
            </button>
          );
        })}
      </div>

      {/* Interest note */}
      <div className="mt-3 flex items-start gap-2 rounded-xl p-3" style={{ background: "#EEF6FF" }}>
        <div className="text-lg leading-none">💰</div>
        <div className="text-[12.5px] text-gray-700 leading-snug">
          Your savings sit in an <b>FD earning 7.25% p.a.</b> — you keep the interest and the FD becomes the security for your card.
        </div>
      </div>

      {/* Autopay CTA — a different flow, not an "add card" button */}
      <button
        onClick={onStartChat}
        className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-bold active:scale-[0.98] transition"
        style={{ borderColor: WA.green, color: WA.green, background: "#F7FBF8" }}
      >
        <Zap className="w-4 h-4" />
        Setup autopay · ₹{plan.d}/day
      </button>
      <button
        onClick={onStartChat}
        className="mt-2 w-full py-3 rounded-2xl font-semibold text-[13px] text-gray-700 bg-gray-100 active:scale-[0.98] transition"
      >
        Start now — deposit ₹{plan.d} today
      </button>
      <div className="mt-2 text-center text-[11px] text-gray-500">Auto-debit via UPI · Pause anytime · 100% refundable</div>
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, (value - 300) / 600));
  const angle = -90 + pct * 180;
  return (
    <div className="relative w-24 h-14 overflow-hidden">
      <div className="absolute inset-0 rounded-t-full border-[10px] border-gray-100 border-b-0" />
      <div className="absolute inset-0 rounded-t-full" style={{
        background: `conic-gradient(from -90deg, #DC2626 0deg, #F59E0B 90deg, ${WA.accent} 180deg, transparent 180deg)`,
        WebkitMask: "radial-gradient(circle at 50% 100%, transparent 30px, black 31px)",
        mask: "radial-gradient(circle at 50% 100%, transparent 30px, black 31px)",
      }} />
      <div className="absolute left-1/2 bottom-0 w-0.5 h-12 bg-gray-900 origin-bottom" style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} />
    </div>
  );
}

/* ====================== TASKS ====================== */
function TasksScreen({ user, tasks, onComplete, onBack, onTaskAction }:
  { user: DemoUser; tasks: { id: string; title: string; impact: number; desc: string; status: string }[]; onComplete: (id: string) => void; onBack: () => void; onTaskAction?: (id: string) => void }) {
  const done = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const projected = user.key === "distressed" ? 413 + 263 : 0;
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex items-center gap-3 px-3 h-14 text-white" style={{ background: WA.green }}>
        <button onClick={onBack}><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="font-semibold text-[17px] flex-1">Tasks</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-sm text-gray-500">Complete these to improve your profile</div>
          {user.key === "distressed" ? (
            <div className="mt-2 text-3xl font-extrabold">
              413 <span className="text-gray-400">→</span> <span style={{ color: WA.green }}>~{projected}</span>
            </div>
          ) : (
            <div className="mt-2 text-lg font-bold">Build your first score 🚀</div>
          )}
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full" style={{ width: `${(done / total) * 100}%`, background: WA.accent }} />
          </div>
          <div className="text-xs text-gray-500 mt-2">{done} of {total} done</div>
        </div>
        {tasks.map((t) => (
          <button key={t.id} onClick={() => onTaskAction?.(t.id)}
            className="w-full text-left bg-white rounded-2xl p-4 shadow-sm active:bg-gray-50 transition">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-gray-500 mt-1">{t.desc}</div>
              </div>
              {t.impact > 0 && (
                <div className="px-2 py-1 rounded-full text-white text-xs font-bold" style={{ background: WA.green }}>+{t.impact}</div>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                t.status === "done" ? "" : "bg-gray-100 text-gray-700"
              }`} style={t.status === "done" ? { background: "#E8F5E9", color: WA.green } : undefined}>
                {t.status === "done" ? "Done" : "To do"}
              </span>
              {t.status !== "done" ? (
                <span className="text-sm font-semibold" style={{ color: WA.green }}>Take action →</span>
              ) : (
                <CheckCircle2 className="w-5 h-5" style={{ color: WA.accent }} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ====================== KABIR PROFILE (WhatsApp contact info) ====================== */
function ArjunProfile({ user, tasks, onBack, openReport, openTasks }:
  { user: DemoUser; tasks: { id: string; title: string; impact: number; desc: string; status: string }[]; onBack: () => void; openReport: () => void; openTasks: () => void }) {
  const updates = updatesFeed(user.key);
  const pendingTasks = tasks.filter(t => t.status !== "done").length;
  return (
    <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
      <div className="text-white shrink-0" style={{ background: WA.green }}>
        <div className="flex items-center gap-3 px-3 h-14">
          <button onClick={onBack}><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="font-semibold text-[17px] flex-1">Contact info</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Cover + Avatar */}
        <div className="relative">
          <div
            className="h-52 w-full relative overflow-hidden flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(160deg, #0a1f1a 0%, #14362c 40%, #0d201a 100%)" }}
          >
            {/* Faint doodle watermarks */}
            <img src={groLogo} alt="" className="absolute w-24 opacity-[0.05] top-3 left-3" style={{ filter: "brightness(0) invert(1)" }} />
            <img src={groLogo} alt="" className="absolute w-20 opacity-[0.05] top-6 right-2" style={{ filter: "brightness(0) invert(1)" }} />
            <img src={groLogo} alt="" className="absolute w-28 opacity-[0.05] bottom-2 left-4" style={{ filter: "brightness(0) invert(1)" }} />
            <img src={groLogo} alt="" className="absolute w-24 opacity-[0.05] bottom-4 right-3" style={{ filter: "brightness(0) invert(1)" }} />
            {/* Foreground logo + tagline */}
            <img src={groLogo} alt="GroScore" className="w-48 relative z-10" style={{ filter: "brightness(0) invert(1)" }} />
            <p className="mt-2 text-white/85 text-[13px] relative z-10">Bharat ka apna financial dost</p>
          </div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <img src={kabirImg} alt="Arjun" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
          </div>
        </div>

        {/* Name + Tagline */}
        <div className="mt-14 text-center px-5">
          <h2 className="text-[22px] font-bold text-gray-900">Arjun</h2>
          <p className="text-sm text-gray-500 mt-1">Your personalised financial planning coach</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mt-5 px-5">
          <ActionPill icon={MessageCircle} label="Chat" onClick={onBack} />
          <ActionPill icon={Phone} label="Call" onClick={onBack} />
          <ActionPill icon={Bell} label="Report" onClick={openReport} />
          <ActionPill icon={Share} label="Share" />
        </div>

        {/* About */}
        <AboutGroScore />

        {/* Credit Report shortcut */}
        <button onClick={openReport} className="w-full bg-white mt-3 mx-3 rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#E8F5E9" }}>
            <FileText className="w-5 h-5" style={{ color: WA.green }} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-sm">Credit Report</div>
            <div className="text-xs text-gray-500">
              {user.key === "ntc" ? "No score yet · build your first" : `Score ${user.score} · Poor band · 6 issues`}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* Tasks */}
        <button onClick={openTasks} className="w-full bg-white mt-3 mx-3 rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#E8F5E9" }}>
            <CheckCircle2 className="w-5 h-5" style={{ color: WA.green }} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-sm">Active tasks</div>
            <div className="text-xs text-gray-500">{pendingTasks} pending · tap to manage</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* Updates */}
        <div className="bg-white mt-3 mx-3 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 text-xs uppercase font-semibold text-gray-400">Updates</div>
          {updates.map((u, i) => (
            <div key={u.id} className={`flex gap-3 px-4 py-3 ${i > 0 ? "border-t border-gray-100" : ""}`}>
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: i === 0 ? WA.accent : "#D1D5DB" }} />
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-900">{u.title}</div>
                <div className="text-xs text-gray-600 mt-0.5">{u.desc}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{u.when}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Attachments */}
        <div className="bg-white mt-3 mx-3 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="text-xs uppercase font-semibold text-gray-400">Attachments</div>
            <span className="text-xs font-semibold" style={{ color: WA.green }}>See all ›</span>
          </div>
          <div className="px-4 pb-4 grid grid-cols-3 gap-2">
            {user.key === "distressed" ? (
              <>
                <AttachThumb img={reportPreview} label="Credit Report" />
                <AttachThumb img={scoreProjection} label="Projection" />
                <AttachThumb img={actionPlanPreview} label="Tasks" />
              </>
            ) : (
              <>
                <AttachThumb img={scoreProjection} label="Projection" />
                <AttachThumb img={actionPlanPreview} label="Card list" />
              </>
            )}
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}

function AttachThumb({ img, label }: { img: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <img src={img} alt={label} loading="lazy" className="w-full h-20 object-cover rounded-lg" />
      <div className="text-[10px] text-gray-600 truncate text-center">{label}</div>
    </div>
  );
}

function MiniProfilePopup({ user, onCall, onCancel }:
  { user: DemoUser; onCall: () => void; onCancel: () => void }) {
  const isNTC = user.key === "ntc";
  const issueCount = distressedTasks.length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full text-white flex items-center justify-center text-lg font-bold shrink-0" style={{ background: WA.green }}>
            {user.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 text-[15px] truncate">{user.name}</div>
            <div className="text-xs text-gray-500">+91 {user.phone.slice(0, 5)} {user.phone.slice(5)}</div>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mini credit profile card */}
        <div className="mx-5 rounded-2xl p-4" style={{ background: "#F3F4F6" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase font-semibold text-gray-500 tracking-wide">Credit Score</div>
              <div className="text-[28px] font-extrabold text-gray-900 leading-none mt-1">
                {isNTC ? "—" : user.score}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: isNTC ? "#E5E7EB" : "#FEE2E2", color: isNTC ? "#374151" : "#B91C1C" }}>
              {isNTC ? "No score yet" : user.band}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3 text-[13px] text-gray-700">
            <span>{isNTC ? "0 loans" : "3 loans"}</span>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <span>{isNTC ? "0 cards" : "0 cards"}</span>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <span>{isNTC ? "0 enquiries" : "5 enquiries"}</span>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold" style={{ background: isNTC ? "#E0E7FF" : "#FEE2E2", color: isNTC ? "#3730A3" : "#991B1B" }}>
              {isNTC ? "No credit history" : `${issueCount} issues to fix`}
            </span>
          </div>
        </div>

        {/* Reassurance */}
        <div className="px-5 pt-4">
          <p className="text-[14px] text-gray-800 leading-relaxed">
            It's okay, you are not rejected for a loan. Your score is just less. We will help you build it.
          </p>
        </div>

        {/* Buttons */}
        <div className="px-5 pt-4 pb-5 space-y-2">
          <button
            onClick={onCall}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-full shadow-md active:scale-[0.98] transition"
            style={{ background: WA.accent }}
          >
            <Phone className="w-4 h-4" />
            Ask our finance expert
          </button>
          <button
            onClick={onCancel}
            className="w-full font-medium py-3 rounded-full text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AboutGroScore() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white mt-5 mx-3 rounded-2xl p-4 shadow-sm">
      <div className="text-xs uppercase font-semibold text-gray-400 mb-2">About GroScore</div>
      <p className="text-gray-800 text-[15px] leading-relaxed">
        GroScore – Bharat ka apna financial dost.
      </p>
      {expanded && (
        <>
          <p className="text-gray-800 text-[15px] leading-relaxed mt-3">
            The money system isn't built for you. GroScore is. We read your credit report, show you in simple language what to fix, and help you save, manage dues, and grow your score. Your 24x7 assistant answers anything, in your language. And as you get stronger, we open the right loans, cards, and savings for you – not what banks push.
          </p>
          <p className="text-gray-800 text-[15px] leading-relaxed mt-3">
            Not just credit. Your whole financial life, on your side.
          </p>
          <p className="text-gray-800 text-[15px] leading-relaxed mt-3">
            groscore.in
          </p>
        </>
      )}
      <button
        onClick={() => setExpanded(v => !v)}
        className="mt-3 text-sm font-semibold"
        style={{ color: WA.green }}
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </div>
  );
}

function ActionPill({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex-1 bg-white rounded-2xl py-3 shadow-sm flex flex-col items-center gap-1.5 active:scale-[0.97] transition">
      <span style={{ color: WA.green }}>
        <Icon className="w-5 h-5" />
      </span>
      <span className="text-[11px] font-medium text-gray-700">{label}</span>
    </button>
  );
}

/* ====================== PROFILE / SUB / HELP ====================== */
function Profile({ user, onBack }: { user: DemoUser; onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex items-center gap-3 px-3 h-14 text-white" style={{ background: WA.green }}>
        <button onClick={onBack}><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="font-semibold text-[17px]">My Profile</h1>
      </div>
      <div className="p-5 space-y-3">
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full text-white flex items-center justify-center text-2xl font-bold" style={{ background: WA.green }}>{user.name[0]}</div>
          <div>
            <div className="font-bold text-lg">{user.name}</div>
            <div className="text-sm text-gray-500">+91 {user.phone.slice(0,5)} {user.phone.slice(5)}</div>
            <div className="text-sm text-gray-500">PAN · {maskPan(user.pan)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Subscription({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex items-center gap-3 px-3 h-14 text-white" style={{ background: WA.green }}>
        <button onClick={onBack}><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="font-semibold text-[17px]">Manage Subscription</h1>
      </div>
      <div className="p-5 space-y-4">
        <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${WA.green}, ${WA.greenDark})` }}>
          <div className="text-xs uppercase opacity-80">Active plan</div>
          <div className="text-2xl font-bold mt-1">GroScore Plus</div>
          <div className="opacity-90 text-sm mt-1">₹99/mo · AutoPay active</div>
          <div className="mt-4 text-xs opacity-75">Next renewal · 20 Jul 2026</div>
        </div>
        <button className="w-full bg-white border border-gray-200 font-semibold py-3 rounded-xl">Change plan</button>
        <button className="w-full bg-white border border-gray-200 font-medium py-3 rounded-xl text-red-600">Cancel subscription</button>
      </div>
    </div>
  );
}

function Help({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex items-center gap-3 px-3 h-14 text-white" style={{ background: WA.green }}>
        <button onClick={onBack}><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="font-semibold text-[17px]">Help</h1>
      </div>
      <div className="p-5 space-y-3">
        {["How is my score calculated?", "How do disputes work?", "Is my data safe?", "Contact support"].map((q) => (
          <div key={q} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <span className="font-medium">{q}</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ====================== DEV NAV ====================== */
const ALL_SCREENS: Array<{ key: Screen; label: string; section: string }> = [
  { key: "landing", label: "1. Landing", section: "Onboarding" },
  { key: "phone", label: "2. Phone number", section: "Onboarding" },
  { key: "otp", label: "3. OTP (auto-fill)", section: "Onboarding" },
  { key: "name", label: "4. Name", section: "Onboarding" },
  { key: "fetch", label: "5. PAN card confirm", section: "Onboarding" },
  { key: "panInput", label: "5b. PAN manual entry", section: "Onboarding" },
  { key: "perm-all", label: "6a. Permissions (SMS · Phone · Notif · Mic)", section: "Permissions" },
  { key: "perm-blocked", label: "6b. Permissions blocked", section: "Permissions" },
  { key: "perm-email-intro", label: "6c. Gmail intro", section: "Permissions" },
  { key: "loading-email", label: "6c·. Loading (Gmail)", section: "Permissions" },
  { key: "perm-email", label: "6d. Google sign-in sheet", section: "Permissions" },
  { key: "loading-journey", label: "6d·. Loading (Journey)", section: "Permissions" },
  { key: "score-journey", label: "6d. Score journey", section: "Permissions" },
  
  
  { key: "chat", label: "7. Chat", section: "Main" },
  { key: "call-incoming", label: "8. Incoming call", section: "Calls" },
  { key: "call-active", label: "9. Active call", section: "Calls" },
  { key: "report", label: "10. Credit Report", section: "Main" },
  { key: "tasks", label: "11. Tasks", section: "Main" },
  { key: "arjun-profile", label: "12. Arjun profile", section: "Main" },
  { key: "profile", label: "13. My Profile", section: "Menu" },
  { key: "subscription", label: "14. Manage Subscription", section: "Menu" },
  { key: "help", label: "15. Help", section: "Menu" },
];

function DevNav({ current, go, hasUser, loadDemo }:
  { current: Screen; go: (s: Screen) => void; hasUser: boolean; loadDemo: (k: "ntc" | "distressed") => void }) {
  const [open, setOpen] = useState(false);
  const needsUser = (s: Screen) =>
    ["chat", "report", "tasks", "arjun-profile", "profile", "call-incoming", "call-active"].includes(s);
  return (
    <>
      <button onClick={() => setOpen((v) => !v)}
        className="absolute top-16 right-2 z-50 bg-black/85 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg backdrop-blur"
        aria-label="Dev nav">
        ☰ Jump
      </button>
      {open && (
        <div className="absolute inset-0 z-40 bg-black/40 flex items-start justify-center pt-12 px-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white flex items-center justify-between">
              <div>
                <div className="font-bold">Jump to screen</div>
                <div className="text-[11px] text-gray-500">Dev navigation · prototype</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-sm text-gray-500 px-2">✕</button>
            </div>
            <div className="p-3 border-b border-gray-100">
              <div className="text-[11px] uppercase font-bold text-gray-500 mb-2">Load demo (skip onboarding)</div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { loadDemo("ntc"); setOpen(false); }}
                  className="font-semibold py-2 rounded-lg text-sm" style={{ background: "#E8F5E9", color: WA.green }}>
                  Rahul · NTC
                </button>
                <button onClick={() => { loadDemo("distressed"); setOpen(false); }}
                  className="text-white font-semibold py-2 rounded-lg text-sm" style={{ background: WA.green }}>
                  Sonu · Score 413
                </button>
              </div>
            </div>
            {Object.entries(
              ALL_SCREENS.reduce<Record<string, typeof ALL_SCREENS>>((acc, s) => {
                (acc[s.section] ||= []).push(s);
                return acc;
              }, {}),
            ).map(([section, items]) => (
              <div key={section} className="py-2">
                <div className="px-4 py-1 text-[11px] uppercase font-bold text-gray-500">{section}</div>
                {items.map((s) => {
                  const disabled = needsUser(s.key) && !hasUser;
                  const active = s.key === current;
                  return (
                    <button key={s.key} disabled={disabled}
                      onClick={() => { go(s.key); setOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between
                        ${active ? "" : "hover:bg-black/5"} ${disabled ? "opacity-40" : ""}`}
                      style={active ? { background: "#E8F5E9" } : undefined}>
                      <span className="text-sm">{s.label}</span>
                      {active && <span className="text-[10px] text-white font-bold px-2 py-0.5 rounded-full" style={{ background: WA.green }}>here</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
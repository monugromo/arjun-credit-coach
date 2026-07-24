export type DemoKey = "ntc" | "ntc2" | "ntc3" | "distressed" | "expired" | "direct";

export interface DemoUser {
  key: DemoKey;
  phone: string;
  name: string;
  pan: string;
  dob?: string;
  hasScore: boolean;
  score?: number;
  band?: string;
  expired?: boolean;
  updated?: { name: string; pan: string; dob: string };
}

export const DEMOS: Record<string, DemoUser> = {
  "9876500001": {
    key: "ntc",
    phone: "9876500001",
    name: "Rahul",
    pan: "ABCPR1234F",
    dob: "12/08/1998",
    hasScore: false,
  },
  "9876500002": {
    key: "distressed",
    phone: "9876500002",
    name: "Sonu",
    pan: "ABCPS5678F",
    dob: "24/03/1992",
    hasScore: true,
    score: 413,
    band: "Poor",
  },
  "9876500003": {
    key: "expired",
    phone: "9876500003",
    name: "Darpan",
    pan: "ABCPD9012F",
    hasScore: true,
    score: 612,
    band: "Fair",
    expired: true,
  },
  "9876500004": {
    key: "direct",
    phone: "9876500004",
    name: "Priya",
    pan: "ABCPP3456F",
    hasScore: true,
    score: 748,
    band: "Good",
  },
  "9876500005": {
    key: "ntc2",
    phone: "9876500005",
    name: "Aarav",
    pan: "ABCPA7788F",
    dob: "05/11/2000",
    hasScore: false,
    updated: {
      name: "Aarav Mehta",
      pan: "AMHPA7788F",
      dob: "05/11/2000",
    },
  },
  "9876500006": {
    key: "ntc3",
    phone: "9876500006",
    name: "Kavya",
    pan: "ABCPK4321F",
    dob: "18/07/1996",
    hasScore: false,
    updated: {
      name: "Kavya Sharma",
      pan: "KVYPS4321F",
      dob: "18/07/1996",
    },
  },
};

export const maskPan = (pan: string) => pan.slice(0, 3) + "xxxx" + pan.slice(-1);

export interface ChatMsg {
  id: string;
  from: "coach" | "user" | "system";
  kind?: "text" | "report" | "plan" | "projection" | "task" | "dispute" | "secured" | "callLog" | "callRequest" | "fdCarousel" | "emailDraft" | "callbackOptions" | "applyLink" | "videoIntro";
  text?: string;
  time: string;
  meta?: Record<string, unknown>;
}

const t = (h: number, m: number) =>
  `${h > 12 ? h - 12 : h}:${m.toString().padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;

export const initialChat = (key: DemoKey): ChatMsg[] => {
  if (key === "direct") {
    return [
      { id: "s0", from: "system", text: "Today", time: "", kind: "text" },
      {
        id: "p1",
        from: "coach",
        kind: "text",
        text: "Welcome back, Priya! 👋",
        time: t(20, 28),
      },
      {
        id: "p2",
        from: "coach",
        kind: "text",
        text: "Aapka credit score 748 hai — Good band mein. Keep it up!",
        time: t(20, 28),
      },
      {
        id: "p3",
        from: "coach",
        kind: "text",
        text: "Koi bhi sawaal ho credit ya loan ke baare mein, bas pooch lena 💚",
        time: t(20, 29),
      },
    ];
  }
  if (key === "distressed") {
    return [
      { id: "s0", from: "system", text: "Today", time: "", kind: "text" },
      {
        id: "d1",
        from: "coach",
        kind: "text",
        text: "Aapka onboarding complete ho gaya hai, Sonu!",
        time: t(20, 28),
      },
      {
        id: "d2",
        from: "coach",
        kind: "text",
        text: "Aapka personalized credit report next 1-2 minutes mein aa jayega 💚",
        time: t(20, 28),
      },
      {
        id: "d3",
        from: "coach",
        kind: "text",
        text: "Report milte hi dekh lena, aur bataana agar kuch samajh na aaye.",
        time: t(20, 29),
      },
    ];
  }
  if (key === "ntc2") {
    return [
      { id: "s0", from: "system", text: "Today", time: "", kind: "text" },
      { id: "a1", from: "coach", kind: "text", text: "Welcome to GroScore, Aarav! 👋", time: t(20, 28) },
      { id: "a2", from: "coach", kind: "text", text: "Abhi aapka koi credit history nahi hai — bilkul fresh start. Chinta mat karo, hum mil ke banayenge 💚", time: t(20, 28) },
      { id: "a3", from: "coach", kind: "text", text: "Main aapko 2 minute mein call karta hoon, pehla step samjha doonga.", time: t(20, 29) },
    ];
  }
  if (key === "ntc3") {
    return [
      { id: "s0", from: "system", text: "Today", time: "", kind: "text" },
      { id: "k1", from: "coach", kind: "text", text: "Welcome to GroScore, Kavya! 👋", time: t(20, 28) },
      { id: "k2", from: "coach", kind: "text", text: "Aapki updated bureau details confirm ho gayi hain — ab hum credit journey shuru karte hain 💚", time: t(20, 28) },
      { id: "k3", from: "coach", kind: "text", text: "Main aapko 2 minute mein call karta hoon, pehla step samjha doonga.", time: t(20, 29) },
    ];
  }
  return [
    { id: "s0", from: "system", text: "Today", time: "", kind: "text" },
    {
      id: "n1",
      from: "coach",
      kind: "text",
      text: "Aapka onboarding complete ho gaya hai, Rahul!",
      time: t(20, 28),
    },
    {
      id: "n2",
      from: "coach",
      kind: "text",
      text: "Aapki credit profile check kar raha hoon — abhi credit history nahi hai, par tension mat lo 💚",
      time: t(20, 28),
    },
    {
      id: "n3",
      from: "coach",
      kind: "text",
      text: "Main aapko 2 minute mein call karta hoon, sab samjha doonga.",
      time: t(20, 29),
    },
  ];
};

export const distressedTasks = [
  { id: "t3", title: "Unrecognised enquiry — IndusInd", impact: 25, status: "todo", desc: "Aapne apply nahi kiya? Dispute kar do" },
  { id: "t2", title: "Pay overdue EMI — HDFC Personal Loan", impact: 70, status: "todo", desc: "₹4,820 overdue · pay today" },
  { id: "t1", title: "Written-off account — Hari & Co", impact: 115, status: "todo", desc: "Yeh galat lagta hai — bureau ko likho" },
  { id: "t4", title: "Reduce enquiry pressure", impact: 13, status: "todo", desc: "Next 60 din naya loan apply mat karo" },
  { id: "t5", title: "Old closed account update", impact: 18, status: "todo", desc: "Bajaj loan closed hai par 'active' dikh raha hai" },
  { id: "t6", title: "Credit utilization < 30%", impact: 22, status: "todo", desc: "Card spend kam karo is mahine" },
];

export const ntcTasks = [
  { id: "n1", title: "Get your first secured card", impact: 0, status: "todo", desc: "SBM Secured · guaranteed approval" },
  { id: "n4", title: "Set autopay for card bill", impact: 0, status: "todo", desc: "Never miss a payment" },
];

export const distressedFactors = [
  { name: "Payment History", weight: 35, status: "Needs fix", color: "danger", note: "8 accounts past due" },
  { name: "Credit Utilization", weight: 30, status: "OK", color: "amber", note: "62% used" },
  { name: "Credit Age", weight: 15, status: "Great", color: "primary", note: "5 yr avg" },
  { name: "Credit Mix", weight: 10, status: "Great", color: "primary", note: "Loans + cards" },
  { name: "Enquiries", weight: 10, status: "OK", color: "amber", note: "5 in 6 months" },
];

export interface FdCard {
  id: string;
  bank: string;
  name: string;
  minDeposit: number;
  benefits: string[];
  fee: string;
  approval: string;
  color: string;
}

export const fdCards: FdCard[] = [
  {
    id: "sbm",
    bank: "SBM Bank",
    name: "SBM Secured Credit Card",
    minDeposit: 2000,
    benefits: ["Instant approval against FD", "Reports to all 4 bureaus", "1% cashback on all spends"],
    fee: "₹0 joining · ₹0 annual",
    approval: "Guaranteed",
    color: "#0E5B3A",
  },
  {
    id: "fi",
    bank: "Fi Federal",
    name: "Fi Federal Secured Card",
    minDeposit: 5000,
    benefits: ["Up to 90% of FD as limit", "FD earns 7.25% p.a.", "No forex markup"],
    fee: "₹0 joining · ₹500 annual (waived)",
    approval: "Same-day",
    color: "#1A5CFF",
  },
  {
    id: "jupiter",
    bank: "CSB Bank",
    name: "Jupiter Edge CSB Secured",
    minDeposit: 3000,
    benefits: ["No annual fee, ever", "Auto-pay reminders in-app", "Builds CIBIL in 3 months"],
    fee: "₹0 joining · ₹0 annual",
    approval: "24 hours",
    color: "#FF6B2C",
  },
  {
    id: "icici",
    bank: "ICICI Bank",
    name: "ICICI Coral against FD",
    minDeposit: 10000,
    benefits: ["2 PAYBACK points / ₹100", "Movie & dining offers", "Limit upgrades after 6 months"],
    fee: "₹500 joining · ₹500 annual",
    approval: "48 hours",
    color: "#B62025",
  },
];

export const updatesFeed = (key: DemoKey) => {
  const base = [
    { id: "u1", title: "Onboarding complete", desc: "Profile verified with PAN", when: "Just now", tag: "Profile" },
    { id: "u2", title: "First call with Arjun", desc: "3:12 min · summary saved", when: "Today", tag: "Call" },
  ];
  if (key === "distressed") {
    return [
      ...base,
      { id: "u3", title: "Credit report fetched", desc: "Score 413 · 6 issues detected", when: "Today", tag: "Report" },
      { id: "u4", title: "Action plan ready", desc: "6 tasks · ~263 point lift potential", when: "Today", tag: "Tasks" },
    ];
  }
  return [
    ...base,
    { id: "u3", title: "NTC profile detected", desc: "No credit history yet — that's okay", when: "Today", tag: "Report" },
    { id: "u4", title: "4 secured cards shortlisted", desc: "Pick one to start building score", when: "Today", tag: "Cards" },
  ];
};
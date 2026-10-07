import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, CalendarCheck, CheckCircle2, ChevronRight, CreditCard, Download, FileText, Info, Layers, List, MessageCircle, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DemoUser } from "@/lib/groscore-data";

const cards = [
  { bank: "HDFC Bank", last4: "4521", used: 128000, limit: 150000, pct: 85, tone: "danger" },
  { bank: "Axis Bank", last4: "9289", used: 72000, limit: 120000, pct: 60, tone: "warning" },
  { bank: "SBI Card", last4: "1102", used: 24000, limit: 80000, pct: 30, tone: "positive" },
] as const;
const loans = [
  { name: "Personal Loan", lender: "HDFC Bank", outstanding: 210000, emi: 8420, sanctioned: 300000, status: "On time", tone: "positive" },
  { name: "Consumer Loan", lender: "Bajaj Finserv", outstanding: 42000, emi: 3200, sanctioned: 55000, status: "On time", tone: "positive" },
  { name: "Auto Loan", lender: "ICICI Bank", outstanding: 228000, emi: 12800, sanctioned: 600000, status: "1 DPD", tone: "warning" },
  { name: "Two-wheeler Loan", lender: "TVS Credit", outstanding: 18000, emi: 1650, sanctioned: 65000, status: "On time", tone: "positive" },
] as const;
const enquiries = [
  { lender: "Kotak Bank", product: "Credit Card", date: "12 May 2026" },
  { lender: "IDFC FIRST", product: "Personal Loan", date: "28 Apr 2026" },
  { lender: "RBL Bank", product: "Credit Card", date: "14 Apr 2026" },
  { lender: "Bajaj Markets", product: "Consumer Loan", date: "02 Apr 2026" },
  { lender: "Paytm", product: "BNPL", date: "21 Mar 2026" },
];
const factors = [
  { key: "payment", title: "Payment history", subtitle: "97% of EMIs paid on time", value: "97%", unit: "ON TIME", tone: "warning", icon: CalendarCheck, explanation: "Your report shows 97% of EMI payments made on time. Check your loan accounts for any delayed payments.", advice: "Keep every payment on time", note: "Set up reminders or auto-pay for your next bills." },
  { key: "usage", title: "Credit usage", subtitle: "61% of your limit", value: "61%", unit: "USED", tone: "warning", icon: CreditCard, explanation: "Your report shows 61% credit utilisation. Individual card balances and limits are listed below.", advice: "Make room on your cards", note: "Pay down outstanding balances and keep new spending manageable." },
  { key: "mix", title: "Credit mix", subtitle: "3 cards · 4 loans", value: "7", unit: "ACCOUNTS", tone: "positive", icon: Layers, explanation: "Your report contains three credit cards and four loans. Each account contributes to your credit history.", advice: "Look after the credit you have", note: "You don't need to open a new account just to change your credit mix." },
  { key: "enquiries", title: "New enquiries", subtitle: "5 in last 6 months", value: "5", unit: "PULLS", tone: "danger", icon: FileText, explanation: "Five credit enquiries appear on your report in the last six months. Review them below to check that you recognise each one.", advice: "Review recent applications", note: "If an enquiry looks unfamiliar, talk to Arjun." },
] as const;
type Tab = "cards" | "loans" | "enquiries";
type View = "score" | "trend" | "accounts" | typeof factors[number]["key"];
type Account = { kind: "card"; index: number } | { kind: "loan"; index: number };
const money = (amount: number) => "₹" + amount.toLocaleString("en-IN");
const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0);
const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstanding, 0);

function BureauFooter() {
  return <footer className="report-bureau"><span>Powered by</span><span className="report-bureau-mark">E</span><strong>EQUIFAX</strong></footer>;
}

export function CreditReport({ user, onBack, onStartChat, savings }: { user: DemoUser; onBack: () => void; onStartChat: () => void; savings: ReactNode }) {
  const [view, setView] = useState<View>("score");
  const [tab, setTab] = useState<Tab>("cards");
  const [account, setAccount] = useState<Account | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scoreScroll = useRef(0);
  const accountsScroll = useRef(0);
  const score = user.score ?? 413;
  const isNTC = user.key === "ntc";
  const factor = factors.find((item) => item.key === view);
  const currentCard = account?.kind === "card" ? cards[account.index] : undefined;
  const currentLoan = account?.kind === "loan" ? loans[account.index] : undefined;
  const band = user.band ?? "Poor";
  const navigate = (next: View, nextTab: Tab = tab) => {
    if (view === "score" || view === "trend") scoreScroll.current = scrollRef.current?.scrollTop ?? 0;
    setAccount(null); setView(next); setTab(nextTab);
    scrollRef.current?.scrollTo({ top: 0 });
  };
  const goBack = () => {
    if (account) {
      setAccount(null);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: accountsScroll.current }));
    } else if (view !== "score" && view !== "trend") {
      setView("score");
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scoreScroll.current }));
    } else onBack();
  };
  const openAccount = (next: Account) => {
    accountsScroll.current = scrollRef.current?.scrollTop ?? 0;
    setAccount(next); scrollRef.current?.scrollTo({ top: 0 });
  };
  const download = () => {
    const text = [`GroScore Credit Report - ${user.name}`, `Bureau: Equifax`, `Credit score: ${score}/900`, `Band: ${band}`, "Monthly change: +12 points", "Utilisation: 61%", "On-time EMIs: 97%", "Enquiries in last 6 months: 5", "", "CREDIT CARDS", ...cards.map(c => `${c.bank} ending ${c.last4}: used ${money(c.used)}, limit ${money(c.limit)}`), "", "LOANS", ...loans.map(l => `${l.lender} - ${l.name}: outstanding ${money(l.outstanding)}, EMI ${money(l.emi)}, sanctioned ${money(l.sanctioned)}, ${l.status}`), "", "ENQUIRIES", ...enquiries.map(e => `${e.lender} - ${e.product} - ${e.date}`)].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "GroScore-credit-report.txt"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const cardRows = <div className="report-account-list">{cards.map((card, index) => <Button variant="ghost" key={card.last4} className="report-account-row" onClick={() => openAccount({ kind: "card", index })}>
    <span className="report-account-top"><span className="report-icon"><CreditCard /></span><span className="report-row-label"><strong>{card.bank}</strong><small>Credit card · •••• {card.last4}</small></span><span className={`report-metric report-tone-${card.tone}`}><strong>{card.pct}%</strong><small>USED</small></span><ChevronRight className="report-chevron" /></span>
    <span className="report-utilisation"><span className={`report-fill report-fill-${card.tone}`} style={{ width: `${card.pct}%` }} /></span>
    <span className="report-account-bottom"><span>{money(card.used)} used</span><span>Limit {money(card.limit)}</span></span>
  </Button>)}</div>;
  const loanRows = <div className="report-account-list">{loans.map((loan, index) => <Button variant="ghost" key={loan.name} className="report-account-row" onClick={() => openAccount({ kind: "loan", index })}>
    <span className="report-account-top"><span className="report-icon"><Wallet /></span><span className="report-row-label"><strong>{loan.lender}</strong><small>{loan.name}</small></span><span className={`report-status report-tone-${loan.tone}`}>{loan.status}</span><ChevronRight className="report-chevron" /></span>
    <span className="report-loan-values"><span><small>Outstanding</small><strong>{money(loan.outstanding)}</strong></span><span><small>EMI</small><strong>{money(loan.emi)}</strong></span><span><small>Sanctioned</small><strong>{money(loan.sanctioned)}</strong></span></span>
  </Button>)}</div>;
  const enquiryRows = <div className="report-account-list">{enquiries.map(enquiry => <div className="report-enquiry-row" key={enquiry.lender}><span className="report-icon"><FileText /></span><span className="report-row-label"><strong>{enquiry.lender}</strong><small>{enquiry.product}</small></span><time>{enquiry.date}</time></div>)}</div>;

  return <div className="credit-report flex min-h-0 flex-1 flex-col bg-card text-foreground" data-testid="credit-report">
    <header className="flex h-14 shrink-0 items-center gap-3 bg-primary-deep px-3 text-primary-foreground">
      <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10 hover:text-primary-foreground" aria-label="Back from credit report" onClick={goBack}><ArrowLeft /></Button>
      <h1 className="flex-1 text-[17px] font-semibold">Credit Report</h1>
      {!isNTC && <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10 hover:text-primary-foreground" title="Download credit report" aria-label="Download credit report" onClick={download}><Download /></Button>}
    </header>
    <div className="report-scroll min-h-0 flex-1 overflow-y-auto" ref={scrollRef}>
      {isNTC ? <>
        <section className="report-section report-ntc-intro"><div className="report-brand">GroScore</div><span className="report-icon report-ntc-icon"><FileText /></span><h2>No credit score yet</h2><p>You're new to credit, {user.name}. Start with a secured card to build your credit history.</p><Button className="report-primary" onClick={onStartChat}>Get a Secured Card <ArrowUpRight /></Button></section>
        <section className="report-section"><h3>Start with a secured card</h3><p className="report-description">Against a small FD, with guaranteed approval. Build your score in 3-4 months.</p><ol className="report-steps">{[
          ["Get a secured card", "Against a small FD - guaranteed approval"], ["Use it for daily purchases", "Keep usage under 30%"], ["Pay full bill on time", "Every on-time payment builds your history"], ["Score appears in 90 days", "Bureaus start tracking your credit history"],
        ].map(([title, description], index) => <li key={title}><Button variant="ghost" className="report-step" onClick={onStartChat}><span>{index + 1}</span><span><strong>{title}</strong><small>{description}</small></span><ChevronRight /></Button></li>)}</ol></section>
        <section className="report-section report-savings">{savings}</section>
        <section className="report-section"><h3>Already have loans or cards?</h3><p className="report-description">Your PAN or name may be incorrect. Update them to fetch the right report.</p><Button variant="link" className="report-text-action" onClick={onStartChat}>Update Name & PAN <ArrowUpRight /></Button></section>
        <section className="report-section"><h3>Still see an error?</h3><p className="report-description">Our support team will look into it within 24 hours.</p><Button variant="link" className="report-text-action" onClick={onStartChat}>Raise a Ticket <ArrowUpRight /></Button></section>
      </> : account && (currentCard || currentLoan) ? <>
        <section className="report-section report-detail-heading"><span className="report-eyebrow">ACCOUNT DETAILS</span><h2>{currentCard?.bank ?? currentLoan?.lender}</h2><p>{currentCard ? `Credit card · •••• ${currentCard.last4}` : currentLoan?.name}</p></section>
        <div className="report-detail-stats"><div><small>{currentCard ? "CREDIT LIMIT" : "SANCTIONED"}</small><strong>{money(currentCard?.limit ?? currentLoan?.sanctioned ?? 0)}</strong></div><div><small>{currentCard ? "BALANCE USED" : "OUTSTANDING"}</small><strong>{money(currentCard?.used ?? currentLoan?.outstanding ?? 0)}</strong></div></div>
        <section className="report-section"><h3>{currentCard ? "Credit usage" : "Payment status"}</h3>{currentCard ? <><div className={`report-detail-number report-tone-${currentCard.tone}`}>{currentCard.pct}<span>% used</span></div><div className="report-utilisation"><span className={`report-fill report-fill-${currentCard.tone}`} style={{ width: `${currentCard.pct}%` }} /></div></> : <><p className={`report-payment-status report-tone-${currentLoan?.tone}`}><CheckCircle2 />{currentLoan?.status}</p><dl className="report-details"><div><dt>Monthly EMI</dt><dd>{money(currentLoan?.emi ?? 0)}</dd></div></dl></>}</section>
        <section className="report-section"><p className="report-description">These details are shown in your credit report.</p><Button variant="link" className="report-text-action" onClick={onStartChat}>Something looks off? Talk to Arjun <ArrowUpRight /></Button></section>
      </> : factor ? <>
        <section className="report-section report-detail-heading"><span className="report-eyebrow">WHAT'S SHAPING YOUR SCORE</span><h2>{factor.title}</h2><p>{factor.explanation}</p><div className={`report-detail-number report-tone-${factor.tone}`}>{factor.value}<span>{factor.unit.toLowerCase()}</span></div><div className="report-advice"><Info /><div><strong>{factor.advice}</strong><p>{factor.note}</p></div></div></section>
        <section className="report-section report-factor-accounts"><div className="report-section-title"><h3>{view === "enquiries" ? "Recent enquiries" : "By account"}</h3><span>{view === "usage" ? "3 cards" : view === "enquiries" ? "5 enquiries" : view === "mix" ? "7 accounts" : "4 loans"}</span></div>{view === "usage" ? cardRows : view === "enquiries" ? enquiryRows : view === "mix" ? <>{cardRows}{loanRows}</> : loanRows}</section>
        <section className="report-section"><Button variant="link" className="report-text-action" onClick={onStartChat}><MessageCircle />Talk to Arjun</Button></section>
      </> : view === "accounts" ? <>
        <section className="report-section report-detail-heading"><span className="report-eyebrow">YOUR CREDIT ACCOUNTS</span><h2>Your cards & loans</h2><p>3 cards · 4 loans</p></section>
        <div className="report-account-tabs" role="tablist" aria-label="Credit accounts">{([ ["cards", "Cards", cards.length], ["loans", "Loans", loans.length], ["enquiries", "Enquiries", enquiries.length] ] as const).map(([key, label, count]) => <Button variant="ghost" key={key} role="tab" aria-selected={tab === key} className={tab === key ? "report-tab is-active" : "report-tab"} onClick={() => setTab(key)}>{label}<span>{count}</span></Button>)}</div>
        <section className="report-section report-account-panel" role="tabpanel" aria-label={tab}><div className="report-section-title"><span>{tab === "cards" ? "Total limit" : tab === "loans" ? "Total outstanding" : "Last 6 months"}</span><strong>{tab === "cards" ? money(totalLimit) : tab === "loans" ? money(totalOutstanding) : "5 enquiries"}</strong></div>{tab === "cards" ? cardRows : tab === "loans" ? loanRows : enquiryRows}</section>
        <section className="report-section report-savings">{savings}</section>
      </> : <>
        <section className="report-section report-score-hero"><div className="report-brand-row"><div className="report-brand">GroScore</div><Button variant="ghost" size="icon" aria-label="About your credit score" onClick={() => setShowInfo(!showInfo)}><Info /></Button></div><div className="report-score-value"><strong>{score}</strong><span>of 900</span></div><div className="report-score-tags"><span className={`report-score-band ${band === "Poor" ? "report-tone-danger" : band === "Fair" ? "report-tone-warning" : "report-tone-positive"}`}>{band}</span><span className="report-score-change"><ArrowUpRight />12 pts this month</span></div><div className="report-range" aria-label={`Credit score ${score} out of 900`}><div className="report-range-track"><span /><span /><span /><span /></div><span className="report-range-marker" style={{ left: `${Math.max(0, Math.min(100, (score - 300) / 6))}%` }} /><div className="report-range-labels"><span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span></div><div className="report-range-endpoints"><span>300</span><span>900</span></div></div><div className="report-source"><FileText /><span>Your Equifax credit report</span></div>{showInfo && <div className="report-info"><Button variant="ghost" size="icon" aria-label="Close score information" onClick={() => setShowInfo(false)}><X /></Button><p>Your score and accounts are based on the information in your Equifax credit report. Checking this report does not create a credit enquiry.</p></div>}</section>
        <div className="report-overview-tabs" role="tablist" aria-label="Report overview"><Button variant="ghost" role="tab" aria-selected={view === "score"} className={view === "score" ? "report-tab is-active" : "report-tab"} onClick={() => setView("score")}>Score</Button><Button variant="ghost" role="tab" aria-selected={view === "trend"} className={view === "trend" ? "report-tab is-active" : "report-tab"} onClick={() => setView("trend")}>Trend</Button></div>
        {view === "trend" ? <section className="report-section report-trend" role="tabpanel" aria-label="Trend"><span className="report-eyebrow">THIS MONTH</span><h2 className="report-tone-positive">+12 <span>points</span></h2><h3>Your score is moving up</h3><p className="report-description">Your report shows a 12-point increase this month. Earlier monthly scores aren't available here yet.</p><Button variant="link" className="report-text-action" onClick={() => setView("score")}>See what's shaping your score <ChevronRight /></Button></section> : <section className="report-section report-factors" role="tabpanel" aria-label="Score"><h3 className="report-factors-title">What's shaping it</h3><div>{factors.map(item => <Button variant="ghost" className="report-factor-row" key={item.key} onClick={() => navigate(item.key)}><span className="report-icon"><item.icon /></span><span className="report-row-label"><strong>{item.title}</strong><small>{item.subtitle}</small></span><span className={`report-status-word report-tone-${item.tone}`}>{item.tone === "positive" ? "Good" : item.tone === "warning" ? "Fair" : "Poor"}</span><ChevronRight className="report-chevron" /></Button>)}</div></section>}
        <div className="report-accounts-link-wrap"><Button variant="ghost" className="report-accounts-link" onClick={() => navigate("accounts", "cards")}><List />Show credit cards and loans</Button></div>
        <section className="report-section report-savings"><details><summary>Daily Savings <span>₹450 saved <ChevronRight /></span></summary><div>{savings}</div></details></section>
      </>}
      <BureauFooter />
    </div>
  </div>;
}
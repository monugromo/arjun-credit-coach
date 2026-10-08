import { useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, CalendarCheck, CheckCircle2, ChevronRight, CreditCard, Download, FileText, Info, Layers, Lightbulb, List, MessageCircle, RefreshCw, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DemoUser } from "@/lib/groscore-data";
import equifaxLogo from "@/assets/equifax-logo.png.asset.json";
import paymentIllustration from "@/assets/payment-history-reference.png.asset.json";

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
// Demo bureau pull date; replace with the real report date from the backend.
const REPORT_LAST_PULLED = "2026-10-05T00:00:00";
const REFRESH_CYCLE_DAYS = 30;
const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const money = (amount: number) => "₹" + amount.toLocaleString("en-IN");
const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0);
const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstanding, 0);

function BureauFooter() {
  return <footer className="report-bureau"><span>Powered by</span><img className="report-bureau-logo" src={equifaxLogo.url} alt="Equifax" /></footer>;
}

export function CreditReport({ user, onBack, onStartChat }: { user: DemoUser; onBack: () => void; onStartChat: () => void }) {
  const [view, setView] = useState<View>("score");
  const [tab, setTab] = useState<Tab>("cards");
  const [account, setAccount] = useState<Account | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [slide, setSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [lastPulled, setLastPulled] = useState(() => new Date(REPORT_LAST_PULLED));
  const daysLeft = Math.max(0, REFRESH_CYCLE_DAYS - Math.floor((Date.now() - lastPulled.getTime()) / 86400000));
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
        <section className="report-section"><h3>Already have loans or cards?</h3><p className="report-description">Your PAN or name may be incorrect. Update them to fetch the right report.</p><Button variant="link" className="report-text-action" onClick={onStartChat}>Update Name & PAN <ArrowUpRight /></Button></section>
        <section className="report-section"><h3>Still see an error?</h3><p className="report-description">Our support team will look into it within 24 hours.</p><Button variant="link" className="report-text-action" onClick={onStartChat}>Raise a Ticket <ArrowUpRight /></Button></section>
      </> : account && (currentCard || currentLoan) ? <>
        <section className="report-section report-detail-heading"><span className="report-eyebrow">ACCOUNT DETAILS</span><h2>{currentCard?.bank ?? currentLoan?.lender}</h2><p>{currentCard ? `Credit card · •••• ${currentCard.last4}` : currentLoan?.name}</p></section>
        <div className="report-detail-stats"><div><small>{currentCard ? "CREDIT LIMIT" : "SANCTIONED"}</small><strong>{money(currentCard?.limit ?? currentLoan?.sanctioned ?? 0)}</strong></div><div><small>{currentCard ? "BALANCE USED" : "OUTSTANDING"}</small><strong>{money(currentCard?.used ?? currentLoan?.outstanding ?? 0)}</strong></div></div>
        <section className="report-section"><h3>{currentCard ? "Credit usage" : "Payment status"}</h3>{currentCard ? <><div className={`report-detail-number report-tone-${currentCard.tone}`}>{currentCard.pct}<span>% used</span></div><div className="report-utilisation"><span className={`report-fill report-fill-${currentCard.tone}`} style={{ width: `${currentCard.pct}%` }} /></div></> : <><p className={`report-payment-status report-tone-${currentLoan?.tone}`}><CheckCircle2 />{currentLoan?.status}</p><dl className="report-details"><div><dt>Monthly EMI</dt><dd>{money(currentLoan?.emi ?? 0)}</dd></div></dl></>}</section>
        <section className="report-section"><p className="report-description">These details are shown in your credit report.</p><Button variant="link" className="report-text-action" onClick={onStartChat}>Something looks off? Talk to Arjun <ArrowUpRight /></Button></section>
      </> : factor ? <>
        <section className="report-section rf-hero">
          <div className="rf-hero-text"><h2>{factor.title}</h2><p>{view === "payment" ? "Paying on time impacts your credit score the most. It shows that you are a trustworthy borrower." : factor.explanation}</p></div>
          {view === "payment" ? <img className="rf-history-illustration" src={paymentIllustration.url} alt="" width={199} height={174} /> : <span className="rf-hero-art" aria-hidden><factor.icon /></span>}
        </section>
        <section className="report-section rf-metric">
          <small>{view === "payment" ? "Payments on time" : factor.unit}</small>
          <div className="rf-metric-row"><strong>{factor.value}</strong></div>
          <span className={`rf-pill rf-pill-${factor.tone}`}>{factor.tone === "positive" ? "Good" : factor.tone === "warning" ? "Fair" : "Needs work"}<Info size={14} /></span>
          <div className="rf-tip"><Lightbulb /><p>{view === "payment" ? "You should always pay the full credit card bill and EMI by the due date." : `${factor.advice}. ${factor.note}`}</p></div>
        </section>
        <section className="report-section rf-accounts"><div className="rf-group">{view === "usage" ? cardRows : view === "enquiries" ? enquiryRows : view === "mix" ? <>{cardRows}{loanRows}</> : <div className="report-account-list">{loans.map((loan, index) => <Button variant="ghost" key={loan.name} className="rf-history-account" onClick={() => openAccount({ kind: "loan", index })}><Wallet /><span className="report-row-label"><strong>{loan.lender}</strong><small>{loan.name}</small></span><span className="rf-history-status">{loan.status}</span><ChevronRight /></Button>)}</div>}</div></section>
      </> : view === "accounts" ? <>
        <section className="report-section report-detail-heading"><span className="report-eyebrow">YOUR CREDIT ACCOUNTS</span><h2>Your cards & loans</h2><p>3 cards · 4 loans</p></section>
        <div className="report-account-tabs" role="tablist" aria-label="Credit accounts">{([ ["cards", "Cards", cards.length], ["loans", "Loans", loans.length], ["enquiries", "Enquiries", enquiries.length] ] as const).map(([key, label, count]) => <Button variant="ghost" key={key} role="tab" aria-selected={tab === key} className={tab === key ? "report-tab is-active" : "report-tab"} onClick={() => setTab(key)}>{label}<span>{count}</span></Button>)}</div>
        <section className="report-section report-account-panel" role="tabpanel" aria-label={tab}><div className="report-section-title"><span>{tab === "cards" ? "Total limit" : tab === "loans" ? "Total outstanding" : "Last 6 months"}</span><strong>{tab === "cards" ? money(totalLimit) : tab === "loans" ? money(totalOutstanding) : "5 enquiries"}</strong></div>{tab === "cards" ? cardRows : tab === "loans" ? loanRows : enquiryRows}</section>
      </> : <>
        <section className="report-section report-score-hero">
          <div className="report-meta-row"><span /><Button variant="ghost" size="icon" aria-label="About your credit score" onClick={() => setShowInfo(!showInfo)}><Info /></Button></div>
          <div className="report-carousel" ref={carouselRef} onScroll={(e) => { const el = e.currentTarget; setSlide(Math.round(el.scrollLeft / el.clientWidth)); }}>
            <div className="report-slide">
              <div className="report-score-value"><strong>{score}</strong><span>of 900</span></div>
              <div className="report-score-meta">
                <span className={`report-band report-tone-${band === "Poor" ? "danger" : band === "Fair" ? "warning" : "positive"}`}><i aria-hidden />{band}</span>
                <span className="report-change"><ArrowUpRight />+12 this month</span>
              </div>
              <div className="report-range" aria-label={`Credit score ${score} out of 900`}><div className="report-range-track" /><span className="report-range-marker" style={{ left: `${Math.max(0, Math.min(100, (score - 300) / 6))}%` }} /><div className="report-range-labels"><span>Poor</span><span>Fair</span><span>Good</span><span>Excellent</span></div></div>
            </div>
            <div className="report-slide">
              <div className="report-trend-card">
                <div className="report-trend-head"><strong>Monthly trend</strong><span className="report-tone-positive">+12 this month</span></div>
                <svg viewBox="0 0 280 130" className="report-trend-chart" role="img" aria-label={`Score moved from ${score - 12} to ${score}`}>
                  <line x1="20" y1="30" x2="260" y2="30" className="grid" /><line x1="20" y1="100" x2="260" y2="100" className="grid" />
                  <line x1="40" y1="100" x2="240" y2="40" className="path" />
                  <circle cx="40" cy="100" r="4" className="dot" /><circle cx="240" cy="40" r="6" className="dot" />
                  <line x1="240" y1="46" x2="240" y2="112" className="drop" />
                  <rect x="214" y="8" width="52" height="24" rx="6" className="tag" /><text x="240" y="25" textAnchor="middle" className="tag-text">{score}</text>
                  <text x="40" y="84" textAnchor="middle" className="label">{score - 12}</text>
                  <text x="40" y="126" textAnchor="middle" className="axis">Last month</text><text x="240" y="126" textAnchor="middle" className="axis is-now">Now</text>
                </svg>
              </div>
            </div>
          </div>
          <div className="report-dots">{[0, 1].map(i => <button key={i} type="button" aria-label={i ? "Show trend" : "Show score"} className={slide === i ? "is-active" : ""} onClick={() => carouselRef.current?.scrollTo({ left: i * carouselRef.current.clientWidth, behavior: "smooth" })} />)}</div>
          <div className="report-refresh-row">
            {daysLeft > 0 ? <span className="report-updated">Next update in {daysLeft} {daysLeft === 1 ? "day" : "days"}</span> : <Button variant="link" className="report-refresh" onClick={() => setLastPulled(new Date())}><RefreshCw />Refresh now</Button>}
          </div>
          {showInfo && <div className="report-info"><Button variant="ghost" size="icon" aria-label="Close score information" onClick={() => setShowInfo(false)}><X /></Button><p>Your score and accounts are based on the information in your Equifax credit report. Checking this report does not create a credit enquiry.</p><ul className="report-info-bands"><li><i className="report-status-dot report-tone-danger" aria-hidden /><strong>Poor</strong> 300-549 - lenders see high risk</li><li><i className="report-status-dot report-tone-warning" aria-hidden /><strong>Fair</strong> 550-649 - some lenders may approve</li><li><i className="report-status-dot report-tone-positive" aria-hidden /><strong>Good</strong> 650-749 - most lenders approve</li><li><i className="report-status-dot report-tone-positive" aria-hidden /><strong>Excellent</strong> 750-900 - best rates and offers</li></ul></div>}
        </section>
        <section className="report-section report-factors" role="tabpanel" aria-label="Score"><h3 className="report-factors-title">What's shaping it</h3><div>{factors.map(item => <Button variant="ghost" className="report-factor-row" key={item.key} onClick={() => navigate(item.key)}><span className="report-icon"><item.icon /></span><span className="report-row-label"><strong>{item.title}</strong><small>{item.subtitle}</small></span><span className={`report-status-word report-tone-${item.tone}`}><i className="report-status-dot" aria-hidden />{item.tone === "positive" ? "Good" : item.tone === "warning" ? "Fair" : "Poor"}</span><ChevronRight className="report-chevron" /></Button>)}</div></section>
        <div className="report-accounts-link-wrap"><Button variant="ghost" className="report-accounts-link" onClick={() => navigate("accounts", "cards")}><List />Show credit cards and loans</Button></div>
      </>}
      <BureauFooter />
    </div>
  </div>;
}
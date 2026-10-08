import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, CalendarCheck, CheckCircle2, ChevronRight, Clock, CreditCard, Download, FileText, Info, Layers, MessageCircle, RefreshCw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { DemoUser } from "@/lib/groscore-data";
import { distressedFactors } from "@/lib/groscore-data";
import equifaxLogo from "@/assets/equifax-logo.png.asset.json";
import paymentIllustration from "@/assets/report-payment.png";
import usageIllustration from "@/assets/report-usage.png";
import mixIllustration from "@/assets/report-mix.png";
import enquiryIllustration from "@/assets/report-enquiries.png";
import ageIllustration from "@/assets/report-age.png";
import { gaugeScoreAt, GAUGE_DURATION_MS } from "@/lib/report-animation";
import { recentScoreRecords, scoreRecordDate, SCORE_TREND_TICKS, scoreTrendY } from "@/lib/report-trend";
import { ReportBankMark } from "@/components/report-bank-mark";
import { creditUsageTone } from "@/lib/report-usage";
import { ReportAccountDetail } from "@/components/report-account-detail";
import { demoAccountInformation } from "@/lib/report-account-information";

const cards = [
  { bank: "HDFC Bank", last4: "4521", used: 128000, limit: 150000, pct: 85, tone: "danger" },
  { bank: "Axis Bank", last4: "9289", used: 72000, limit: 120000, pct: 60, tone: "warning" },
  { bank: "SBI Card", last4: "1102", used: 24000, limit: 80000, pct: 30, tone: "positive" },
] as const;
const loans = [
  { name: "Personal Loan", lender: "HDFC Bank", last4: "6620", outstanding: 210000, emi: 8420, sanctioned: 300000, status: "On time", tone: "positive" },
  { name: "Consumer Loan", lender: "Bajaj Finserv", last4: "3418", outstanding: 42000, emi: 3200, sanctioned: 55000, status: "On time", tone: "positive" },
  { name: "Auto Loan", lender: "ICICI Bank", last4: "9034", outstanding: 228000, emi: 12800, sanctioned: 600000, status: "1 DPD", tone: "warning" },
  { name: "Two-wheeler Loan", lender: "TVS Credit", last4: "7745", outstanding: 18000, emi: 1650, sanctioned: 65000, status: "On time", tone: "positive" },
  { name: "Gold Loan", lender: "SBI", last4: "5512", outstanding: 96000, emi: 4100, sanctioned: 150000, status: "On time", tone: "positive" },
  { name: "Education Loan", lender: "Kotak Bank", last4: "8807", outstanding: 310000, emi: 9200, sanctioned: 400000, status: "On time", tone: "positive" },
] as const;
const enquiries = [
  { lender: "Kotak Bank", product: "Credit Card", date: "12 May 2026" },
  { lender: "IDFC FIRST", product: "Personal Loan", date: "28 Apr 2026" },
  { lender: "RBL Bank", product: "Credit Card", date: "14 Apr 2026" },
  { lender: "Bajaj Markets", product: "Consumer Loan", date: "02 Apr 2026" },
  { lender: "Paytm", product: "BNPL", date: "21 Mar 2026" },
];
const factors = [
  { key: "payment", title: "Payment history", subtitle: "97% of EMIs paid on time", value: "97%", unit: "ON TIME", tone: "warning", icon: CalendarCheck, explanation: "Paying on time impacts your CIBIL score the most. It shows that you are a trustworthy borrower.", advice: "Keep every payment on time", note: "Set up reminders or auto-pay for your next bills." },
  { key: "usage", title: "Credit usage", subtitle: "61% of your limit", value: "61%", unit: "USED", tone: "warning", icon: CreditCard, explanation: "Credit usage tells you how much credit you used out of your total credit limit.", advice: "Make room on your cards", note: "Pay down outstanding balances and keep new spending manageable." },
  { key: "mix", title: "Credit mix", subtitle: "3 cards · 6 loans", value: "9", unit: "ACCOUNTS", tone: "positive", icon: Layers, explanation: "Credit mix shows all your credit cards and loans and how diverse they are.", advice: "Look after the credit you have", note: "You don't need to open a new account just to change your credit mix." },
  { key: "enquiries", title: "New enquiries", subtitle: "5 in the last 6 months", value: "5", unit: "PULLS", tone: "danger", icon: FileText, explanation: "An enquiry occurs when a lending institution checks your credit report when you've applied for a credit product (loans, credit cards, etc.)", advice: "Review recent applications", note: "If an enquiry looks unfamiliar, talk to Arjun." },
  { key: "age", title: "Credit age", subtitle: "Not available", value: "Not available", unit: "AVERAGE AGE", tone: "positive", icon: Clock, explanation: "Credit age reflects how long credit accounts have been open. A longer history helps demonstrate consistent credit management over time.", advice: "Look after your credit history", note: "" },
] as const;
const factorIllustrations = { payment: paymentIllustration, usage: usageIllustration, mix: mixIllustration, enquiries: enquiryIllustration, age: ageIllustration };
const bands = [
  { name: "Poor", tone: "danger", width: 41.5, center: 20.75 },
  { name: "Fair", tone: "warning", width: 16.5, center: 49.75 },
  { name: "Good", tone: "positive", width: 16.5, center: 66.25 },
  { name: "Excellent", tone: "positive", width: 25, center: 87.25 },
] as const;
type Tab = "cards" | "loans" | "enquiries";

type View = "score" | "trend" | "accounts" | typeof factors[number]["key"];
type Account = { kind: "card"; index: number } | { kind: "loan"; index: number };
// Demo bureau pull date; replace with the real report date from the backend.
const REPORT_LAST_PULLED = "2026-10-05T00:00:00";
const REFRESH_CYCLE_DAYS = 30;
const money = (amount: number) => "₹" + amount.toLocaleString("en-IN");
const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0);
const totalUsed = cards.reduce((sum, card) => sum + card.used, 0);
const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstanding, 0);

function BureauFooter() {
  return <footer className="report-bureau"><span>Powered by</span><img className="report-bureau-logo" src={equifaxLogo.url} alt="Equifax" /></footer>;
}

const openedScoreGauges = new Set<string>();

function ScoreGauge({ score, animationKey, band, onInfo }: { score: number; animationKey: string; band: string; onInfo: () => void }) {
  const [displayScore, setDisplayScore] = useState(score);
  const angle = Math.max(0, Math.min(180, (score - 300) / 600 * 180));
  useEffect(() => {
    if (openedScoreGauges.has(animationKey)) return;
    openedScoreGauges.add(animationKey);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let completed = false;
    const started = Date.now();
    const update = () => {
      const elapsed = Date.now() - started;
      const value = gaugeScoreAt(elapsed, score);
      setDisplayScore(value);
    };
    update();
    const timer = window.setInterval(update, 16);
    const finish = window.setTimeout(() => { completed = true; setDisplayScore(score); window.clearInterval(timer); }, GAUGE_DURATION_MS);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(finish);
      if (!completed) openedScoreGauges.delete(animationKey);
      setDisplayScore(score);
    };
  }, [animationKey, angle, score]);
  const point = (angle: number, radius: number) => {
    const radians = angle * Math.PI / 180;
    return [160 - radius * Math.cos(radians), 150 - radius * Math.sin(radians)];
  };
  let start = 0;
  return <><svg viewBox="0 0 320 175" className="report-score-gauge" role="img" aria-label={`Credit score ${score} out of 900`}>
    {bands.map(item => {
      const end = start + item.width / 99.5 * 180;
      const a = point(start + 1, 116);
      const b = point(end - 1, 116);
      const path = `M ${a[0]} ${a[1]} A 116 116 0 0 1 ${b[0]} ${b[1]}`;
      start = end;
      return <g key={item.name} className={`report-tone-${item.tone}`}><path d={path} className="report-gauge-soft" /><path d={path} className="report-gauge-edge" /></g>;
    })}
    <g transform="translate(160 150)"><g className="report-gauge-needle" transform={`rotate(${(displayScore - 300) / 600 * 180})`}><path d="M -99 -7 L -99 7 L -113 0 Z" className="report-gauge-pointer" /></g></g>
    <text x="15" y="164" className="report-gauge-label">300</text><text x="282" y="164" className="report-gauge-label">900</text>
  </svg><div className="report-gauge-value"><strong>{Math.round(displayScore)}</strong><div className="report-gauge-band"><span>{band}</span><Button variant="ghost" size="icon" aria-label="About your credit score" aria-haspopup="dialog" onClick={onInfo}><Info /></Button></div></div></>;
}

export function CreditReport({ user, onBack, onStartChat, bankLogos = {} }: { user: DemoUser; onBack: () => void; onStartChat: () => void; bankLogos?: Record<string, string> }) {
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
  const trendRecords = recentScoreRecords(user.scoreHistory ?? [{ date: REPORT_LAST_PULLED, score }]);
  const trendPoints = trendRecords.map((record, index) => ({ ...record, x: trendRecords.length === 1 ? 172 : 48 + index * 248 / (trendRecords.length - 1), y: scoreTrendY(record.score) }));
  const trendFirst = trendRecords[0];
  const trendLast = trendRecords[trendRecords.length - 1];
  const trendChange = trendFirst && trendLast && trendRecords.length > 1 ? trendLast.score - trendFirst.score : undefined;
  const isNTC = user.key === "ntc";
  const creditAge = user.key === "distressed" ? distressedFactors.find(item => item.name === "Credit Age") : undefined;
  const reportFactors = factors.map(item => item.key === "age" ? { ...item, value: creditAge?.note.replace("yr avg", "years") ?? "Not available", subtitle: creditAge?.note.replace("yr avg", "years average age") ?? "Not available" } : item);
  const factor = reportFactors.find((item) => item.key === view);
  const factorTotal = view === "payment" ? `${loans.length} loan accounts` : view === "usage" ? `${cards.length} credit cards` : view === "mix" || view === "age" ? `${cards.length + loans.length} total accounts` : `${enquiries.length} enquiries · Last 6 months`;
  const currentCard = account?.kind === "card" ? cards[account.index] : undefined;
  const currentLoan = account?.kind === "loan" ? loans[account.index] : undefined;
  const band = user.band ?? "Poor";
  const firstName = user.name.split(" ")[0];
  const scoreHeadline = band === "Excellent" ? `${firstName}, your score is in excellent shape` : band === "Good" ? `${firstName}, your score is in a good place` : band === "Fair" ? `${firstName}, your score can still improve` : `${firstName}, your score needs work`;

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
    <span className="report-account-top"><ReportBankMark name={card.bank} logoUrl={bankLogos[card.bank]} /><span className="report-row-label"><strong>{card.bank}</strong><small>{money(card.limit)} limit</small></span><span className={`report-account-status report-tone-${creditUsageTone(card.pct)}`}><strong>{card.pct}%</strong><small>Utilisation</small></span></span>
  </Button>)}</div>;
  const loanRows = <div className="report-account-list">{loans.map((loan, index) => <Button variant="ghost" key={loan.name} className="report-account-row" onClick={() => openAccount({ kind: "loan", index })}>
    <span className="report-account-top"><ReportBankMark name={loan.lender} logoUrl={bankLogos[loan.lender]} /><span className="report-row-label"><strong>{loan.lender}</strong><small>Account xx{loan.last4}</small></span><span className={`report-account-status report-tone-${loan.tone}`}>{loan.status}</span></span>
  </Button>)}</div>;
  const enquiryRows = <div className="report-account-list">{enquiries.map(enquiry => <div className="report-enquiry-row" key={enquiry.lender}><ReportBankMark name={enquiry.lender} logoUrl={bankLogos[enquiry.lender]} /><span className="report-row-label"><strong>{enquiry.lender}</strong><small>{enquiry.product}</small></span><time>{enquiry.date}</time></div>)}</div>;

  return <div className={`credit-report flex min-h-0 flex-1 flex-col bg-card text-foreground${user.reportDesign === "comparison" ? " report-comparison" : ""}`} data-testid="credit-report">
    <header className="flex h-14 shrink-0 items-center gap-3 bg-primary-deep px-3 text-primary-foreground">
      <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10 hover:text-primary-foreground" aria-label="Back from credit report" onClick={goBack}><ArrowLeft /></Button>
      <h1 className="flex-1 text-[17px] font-semibold">Credit report</h1>
      {!isNTC && <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10 hover:text-primary-foreground" title="Download credit report" aria-label="Download credit report" onClick={download}><Download /></Button>}
    </header>
    <div className="report-scroll min-h-0 flex-1 overflow-y-auto" ref={scrollRef}>
      {isNTC ? <>
        <section className="report-section report-ntc-intro"><div className="report-brand">GroScore</div><span className="report-icon report-ntc-icon"><FileText /></span><h2>No credit score yet</h2><p>You're new to credit, {user.name}. Start with a secured card to build your credit history.</p><Button className="report-primary" onClick={onStartChat}>Get a secured card <ArrowUpRight /></Button></section>
        <section className="report-section"><h3>Start with a secured card</h3><p className="report-description">Against a small FD, with guaranteed approval. Build your score in 3-4 months.</p><ol className="report-steps">{[
          ["Get a secured card", "Against a small FD - guaranteed approval"], ["Use it for daily purchases", "Keep usage under 30%"], ["Pay the full bill on time", "Every on-time payment builds your history"], ["Score appears in 90 days", "Bureaus start tracking your credit history"],
        ].map(([title, description], index) => <li key={title}><Button variant="ghost" className="report-step" onClick={onStartChat}><span>{index + 1}</span><span><strong>{title}</strong><small>{description}</small></span><ChevronRight /></Button></li>)}</ol></section>
        <section className="report-section"><h3>Already have loans or cards?</h3><p className="report-description">Your PAN or name may be incorrect. Update them to fetch the right report.</p><Button variant="link" className="report-text-action" onClick={onStartChat}>Update name & PAN <ArrowUpRight /></Button></section>
        <section className="report-section"><h3>Still see an error?</h3><p className="report-description">Our support team will look into it within 24 hours.</p><Button variant="link" className="report-text-action" onClick={onStartChat}>Raise a ticket <ArrowUpRight /></Button></section>
      </> : account && (currentCard || currentLoan) ? <>
        {currentCard ? <ReportAccountDetail kind="card" account={currentCard} information={demoAccountInformation[currentCard.last4]} logoUrl={bankLogos[currentCard.bank]} seed={`${currentCard.bank}-${currentCard.last4}`} onStartChat={onStartChat} /> : currentLoan ? <ReportAccountDetail kind="loan" account={currentLoan} information={demoAccountInformation[currentLoan.last4]} logoUrl={bankLogos[currentLoan.lender]} seed={`${currentLoan.lender}-${currentLoan.last4}`} onStartChat={onStartChat} /> : null}
      </> : factor ? <>
        <section className="report-section rf-hero">
          <div className="rf-hero-heading"><div className="rf-hero-text"><h2>{factor.title}</h2><span className="rf-total-count">{factorTotal}</span></div><img className="rf-history-illustration" src={factorIllustrations[factor.key]} alt="" loading="lazy" width={512} height={512} /></div>
          <p className="rf-explanation">{factor.explanation}</p>
        </section>
        <section className="report-section rf-metric">
          <small>{view === "payment" ? "Payments on time" : view === "usage" ? "Credit usage" : view === "mix" ? "Credit mix" : view === "age" ? "Average credit age" : "Enquiries"}</small>
          <div className={`rf-metric-row${view === "usage" || view === "mix" || view === "age" ? " rf-metric-expanded" : ""}`}>
            <strong>{view === "usage" ? `${money(totalUsed)} / ${money(totalLimit)}` : view === "mix" ? `${cards.length} credit cards · ${loans.length} loans` : view === "enquiries" ? enquiries.length : factor.value}</strong>
            {view === "usage" && <span>{factor.value} reported usage</span>}
          </div>
          {(view !== "age" || creditAge) && <span className={`rf-pill rf-pill-${factor.tone}`}>{factor.tone === "positive" ? "Good" : factor.tone === "warning" ? "Fair" : "Needs work"}<Info size={14} /></span>}
        </section>
        <section className="report-section rf-accounts">
          <h3 className="rf-list-heading">{view === "age" ? "Account age" : view === "usage" ? "Credit cards" : view === "enquiries" ? "Recent enquiries" : view === "mix" ? "Credit accounts" : "Loan accounts"}</h3>
          <div className="report-account-stack">{view === "age" ? <p className="report-description">Account opening dates are not available.</p> : view === "usage" ? cardRows : view === "enquiries" ? enquiryRows : view === "mix" ? <><div className="rf-account-group"><h4>Credit cards <span>{cards.length}</span></h4>{cardRows}</div><div className="rf-account-group"><h4>Loans <span>{loans.length}</span></h4>{loanRows}</div></> : loanRows}</div>
        </section>
      </> : view === "accounts" ? <>
        <section className="report-section report-detail-heading"><span className="report-eyebrow">Credit accounts</span><h2>Full credit details</h2><p>{cards.length} credit cards · {loans.length} loans</p></section>
        <div className="report-account-tabs" role="tablist" aria-label="Credit accounts">{([ ["cards", "Cards", cards.length], ["loans", "Loans", loans.length], ["enquiries", "Enquiries", enquiries.length] ] as const).map(([key, label, count]) => <Button variant="ghost" key={key} role="tab" aria-selected={tab === key} className={tab === key ? "report-tab is-active" : "report-tab"} onClick={() => setTab(key)}>{label}<span>{count}</span></Button>)}</div>
        <section className="report-section report-account-panel" role="tabpanel" aria-label={tab}>{tab !== "enquiries" && <p className="report-lifecycle-note"><Info aria-hidden="true" /><span>Account information uses sample statuses and dates. Payment status is shown separately.</span></p>}<div className="report-section-title"><span>{tab === "cards" ? "Total limit" : tab === "loans" ? "Total outstanding" : "Last 6 months"}</span><strong>{tab === "cards" ? money(totalLimit) : tab === "loans" ? money(totalOutstanding) : "5 enquiries"}</strong></div>{tab === "cards" ? cardRows : tab === "loans" ? loanRows : enquiryRows}</section>
      </> : <>
        <section className="report-section report-score-hero">
          <div className="report-score-head"><p className="report-score-headline"><span className="report-score-greeting">{firstName},</span>{scoreHeadline.slice(firstName.length + 2)}</p></div>
          <div className="report-score-panel">
          <div className="report-hero-bureau"><img src={equifaxLogo.url} alt="Equifax" /></div>
          <div className="report-carousel" ref={carouselRef} onScroll={(e) => { const el = e.currentTarget; setSlide(Math.round(el.scrollLeft / el.clientWidth)); }}>
            <div className="report-slide">
              <div className="report-gauge-wrap">
                <ScoreGauge score={score} animationKey={user.phone} band={band} onInfo={() => setShowInfo(true)} />
              </div>
            </div>
            <div className="report-slide">
              <div className="report-trend-card">
                <div className="report-trend-head"><strong>Score trend</strong>{trendChange !== undefined && <span>{trendChange > 0 ? "+" : ""}{trendChange} points</span>}</div>
                <svg viewBox="0 0 320 156" className="report-trend-chart" role="img" aria-label={trendRecords.length ? `Score trend: ${trendRecords.map(record => `${scoreRecordDate(record.date)}, ${record.score}`).join("; ")}` : "No recorded score history"}>
                  {SCORE_TREND_TICKS.map(value => <g key={value}><line x1="32" y1={scoreTrendY(value)} x2="308" y2={scoreTrendY(value)} className="grid" /><text x="25" y={scoreTrendY(value) + 4} textAnchor="end" className="label">{value}</text></g>)}
                  <line x1="32" y1="120" x2="308" y2="120" className="baseline" />
                  {trendPoints.length > 1 && <path d={trendPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")} fill="none" className="path" />}
                  {trendPoints.map(point => {
                    return <g key={point.date}>
                      <line x1={point.x} y1={point.y} x2={point.x} y2="120" className="grid" />
                      <circle cx={point.x} cy={point.y} r="4" className="dot" />
                      <text x={point.x} y={point.y - 13} textAnchor="middle" className="score-label">{point.score}</text>
                      <text x={point.x} y="142" textAnchor="middle" className="axis">{scoreRecordDate(point.date)}</text>
                    </g>;
                  })}
                </svg>
              </div>
            </div>
          </div>
          <div className="report-score-change" aria-label="Score change: up 12 points"><strong>+12 <span>points</span></strong></div>
          <div className="report-dots" aria-label="Score views">{[0, 1].map(index => <Button key={index} variant="ghost" size="icon" aria-label={index === 0 ? "Show score overview" : "Show score trend"} aria-pressed={slide === index} onClick={() => { const el = carouselRef.current; if (el) el.scrollTo({ left: index * el.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }}><span className={slide === index ? "is-active" : ""} /></Button>)}</div>
          <div className="report-refresh-row">
            {daysLeft > 0 ? <span className="report-updated">Next update in {daysLeft} {daysLeft === 1 ? "day" : "days"}</span> : <Button variant="link" className="report-refresh" onClick={() => setLastPulled(new Date())}><RefreshCw />Refresh now</Button>}
          </div>
          <div className="report-hero-actions"><Button variant="outline" onClick={() => navigate("accounts", "cards")}>Full credit details</Button><Button variant="outline" onClick={onBack}><MessageCircle />Talk to Arjun</Button></div>
          </div>
          <Dialog open={showInfo} onOpenChange={setShowInfo}><DialogContent className="credit-report report-score-dialog"><DialogTitle>What your score means</DialogTitle><DialogDescription>Your score and accounts are based on the information in your Equifax credit report. Checking this report does not create a credit enquiry.</DialogDescription><ul className="report-info-bands"><li><i className="report-status-dot report-tone-danger" aria-hidden /><strong>Poor</strong><span>300-549 - lenders see high risk</span></li><li><i className="report-status-dot report-tone-warning" aria-hidden /><strong>Fair</strong><span>550-649 - some lenders may approve</span></li><li><i className="report-status-dot report-tone-positive" aria-hidden /><strong>Good</strong><span>650-749 - most lenders approve</span></li><li><i className="report-status-dot report-tone-positive" aria-hidden /><strong>Excellent</strong><span>750-900 - best rates and offers</span></li></ul></DialogContent></Dialog>
        </section>


        <section className="report-section report-factors" role="tabpanel" aria-label="Score"><h3 className="report-factors-title">Credit report summary</h3><div>{reportFactors.map(item => <Button variant="ghost" className="report-factor-row" key={item.key} onClick={() => navigate(item.key)}><span className="report-icon"><item.icon /></span><span className="report-row-label"><strong>{item.title}</strong><small>{item.subtitle}</small></span><span className="report-status-word">{item.key === "age" && !creditAge ? "—" : item.tone === "positive" ? "Good" : item.tone === "warning" ? "Fair" : "Poor"}</span><ChevronRight className="report-chevron" /></Button>)}</div></section>
      </>}
      <BureauFooter />
    </div>
  </div>;
}
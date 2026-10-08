import { useState, type CSSProperties } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Info, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ReportBankMark } from "@/components/report-bank-mark";
import { creditUsageTone } from "@/lib/report-usage";
import cardArt from "@/assets/account-reference/credit-card.jpg.asset.json";
import personalArt from "@/assets/account-reference/personal.jpg.asset.json";
import vehicleArt from "@/assets/account-reference/vehicle.jpg.asset.json";
import homeArt from "@/assets/account-reference/home.jpg.asset.json";

type CardDetails = { bank: string; last4: string; limit: number; used: number; pct: number };
type LoanDetails = { lender: string; name: string; last4: string; sanctioned: number; outstanding: number; emi: number; status: string; tone: string };
type Props = ({ kind: "card"; account: CardDetails } | { kind: "loan"; account: LoanDetails }) & { logoUrl?: string; onStartChat: () => void };
const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const loanArtwork: Record<string, string> = { "Personal Loan": personalArt.url, "Consumer Loan": personalArt.url, "Auto Loan": vehicleArt.url, "Vehicle Loan": vehicleArt.url, "Two-wheeler Loan": vehicleArt.url, "Home Loan": homeArt.url };

function UsageIndicator({ pct, tone, label }: { pct: number; tone: string; label: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const bubbleStyle: CSSProperties = { left: `clamp(18px, ${clamped}%, calc(100% - 18px))` };
  return (
    <div className={`account-usage-indicator report-tone-${tone}`}>
      <div className="account-usage-track" role="img" aria-label={`${clamped}%`}>
        <div className="account-usage-fill" style={{ width: `${clamped}%` }} />
        <span className="account-usage-bubble" style={bubbleStyle}>{clamped}%</span>
      </div>
      <p className="account-usage-label">{label}</p>
    </div>
  );
}

export function ReportAccountDetail(props: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const card = props.kind === "card" ? props.account : undefined;
  const loan = props.kind === "loan" ? props.account : undefined;
  const lender = card?.bank ?? loan?.lender ?? "";
  const product = loan?.name.replace("Loan", "loan") ?? "Credit card";
  const artwork = loan ? loanArtwork[loan.name] ?? personalArt.url : cardArt.url;
  return <div className="report-account-detail">
    <section className="report-section account-detail-hero">
      <div className="account-detail-identity">
        <ReportBankMark name={lender} logoUrl={props.logoUrl} />
        <div className="account-detail-copy"><div className="account-detail-title"><h2>{lender}</h2><Button variant="ghost" size="icon" aria-label="About this account" onClick={() => setShowInfo(true)}><Info /></Button></div><p className="account-detail-subtitle"><span>{product}</span><span>(A/C No. XXXX{props.account.last4})</span></p></div>
      </div>
      <img className="account-detail-art" src={artwork} alt={`${product} illustration`} />
      <dl className="account-detail-balances">
        <div><dt>{card ? "Total Spends" : "Sanctioned amount"}</dt><dd>{money(card?.used ?? loan?.sanctioned ?? 0)}</dd></div>
        <div><dt>{card ? "Credit limit" : "Current balance"}</dt><dd>{money(card?.limit ?? loan?.outstanding ?? 0)}</dd></div>
      </dl>
      {card && <UsageIndicator pct={card.pct} tone={creditUsageTone(card.pct)} label={`Total used ${money(card.used)}`} />}
    </section>
    {loan && <section className="report-section account-detail-usage">
      <h3>Loan outstanding</h3>
      <UsageIndicator pct={loan.sanctioned > 0 ? ((loan.sanctioned - loan.outstanding) / loan.sanctioned) * 100 : 0} tone="positive" label={`${money(Math.max(0, loan.sanctioned - loan.outstanding))} principal paid`} />
    </section>}
    <section className="report-section account-detail-history">
      <h3>Payment history</h3>
      {loan && <div className="account-detail-payment"><span>Latest payment status</span><strong className={`report-tone-${loan.tone}`}>{loan.status === "On time" ? <CheckCircle2 /> : <Clock />}{loan.status}</strong></div>}
      <div className="account-history-unavailable"><CalendarCheck aria-hidden="true" /><div><strong>Monthly history not available</strong><p>Month-by-month payment records are not included in this report.</p></div></div>
    </section>
    <section className="report-section account-detail-facts">
      <h3>Account information</h3>
      <dl>
        {loan && <div><dt>Monthly EMI</dt><dd>{money(loan.emi)}</dd></div>}
        <div><dt>Account status</dt><dd className="account-value-unavailable">Not reported</dd></div>
        <div><dt>Account opened on</dt><dd className="account-value-unavailable">Not reported</dd></div>
        <div><dt>Account closed on</dt><dd className="account-value-unavailable">Not reported</dd></div>
        <div><dt>Last updated by bureau</dt><dd className="account-value-unavailable">Not reported</dd></div>
      </dl>
    </section>
    <section className="report-section account-detail-support"><p>This information is based on what the lender reports to Equifax.</p><Button variant="outline" onClick={props.onStartChat}><MessageCircle />Report an issue to Arjun</Button></section>
    <Dialog open={showInfo} onOpenChange={setShowInfo}><DialogContent className="credit-report report-score-dialog"><DialogTitle>About this account</DialogTitle><DialogDescription>Balances and payment information are supplied by {lender} to Equifax. Payment status is separate from whether an account is active or closed. Account status and account-specific dates are not included in the available report.</DialogDescription></DialogContent></Dialog>
  </div>;
}
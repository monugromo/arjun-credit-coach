import { useState, type CSSProperties } from "react";
import { Check, X, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ReportBankMark } from "@/components/report-bank-mark";
import { creditUsageTone } from "@/lib/report-usage";
import type { AccountInformation } from "@/lib/report-account-information";
import cardArt from "@/assets/account-art/account-credit-card.png.asset.json";
import personalArt from "@/assets/account-art/account-personal.png.asset.json";
import vehicleArt from "@/assets/account-art/account-vehicle.png.asset.json";
import homeArt from "@/assets/account-art/account-home.png.asset.json";
import goldArt from "@/assets/account-art/gold.png.asset.json";
import otherArt from "@/assets/account-art/other.png.asset.json";

type CardDetails = { bank: string; last4: string; limit: number; used: number; pct: number };
type LoanDetails = { lender: string; name: string; last4: string; sanctioned: number; outstanding: number; emi: number; status: string; tone: string };
type Props = ({ kind: "card"; account: CardDetails } | { kind: "loan"; account: LoanDetails }) & { information?: AccountInformation; logoUrl?: string; seed?: string; onStartChat: () => void };
const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const loanArtwork: Record<string, string> = { "Personal Loan": personalArt.url, "Consumer Loan": personalArt.url, "Auto Loan": vehicleArt.url, "Vehicle Loan": vehicleArt.url, "Two-wheeler Loan": vehicleArt.url, "Home Loan": homeArt.url, "Gold Loan": goldArt.url, "Education Loan": otherArt.url, "Other Loan": otherArt.url };

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

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth();
const HISTORY_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

type MonthStatus = "ontime" | "delayed" | "unreported";
const hashSeed = (value: string) => { let h = 7; for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };
const sampleMonthStatuses = (seed: string, year: number): MonthStatus[] => MONTHS.map((_, i) => {
  if (year > CURRENT_YEAR || (year === CURRENT_YEAR && i > CURRENT_MONTH)) return "unreported";
  return hashSeed(`${seed}:${year}:${i}`) % 100 < 18 ? "delayed" : "ontime";
});

export function ReportAccountDetail(props: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const [historyYear, setHistoryYear] = useState(CURRENT_YEAR);
  const card = props.kind === "card" ? props.account : undefined;
  const loan = props.kind === "loan" ? props.account : undefined;
  const lender = card?.bank ?? loan?.lender ?? "";
  const product = loan?.name.replace("Loan", "loan") ?? "Credit card";
  const artwork = loan ? loanArtwork[loan.name] ?? personalArt.url : cardArt.url;
  const statuses = sampleMonthStatuses(props.seed ?? lender, historyYear);
  const lastReportedIndex = (() => { for (let i = CURRENT_MONTH; i >= 0; i--) if (statuses[i] !== "unreported") return i; return -1; })();
  return <div className="report-account-detail">
    <section className="report-section account-detail-hero">
      <div className="account-detail-identity">
        <ReportBankMark name={lender} logoUrl={props.logoUrl} />
        <div className="account-detail-copy"><div className="account-detail-title"><h2>{lender}</h2><Button variant="ghost" size="icon" aria-label="About this account" onClick={() => setShowInfo(true)}><Info /></Button></div><p className="account-detail-subtitle"><span>{product}</span><span>A/C No. XXXX{props.account.last4}</span></p></div>
      </div>
      <div className="account-art-stage">
        <div className="account-art-stage-bg" aria-hidden="true">
          <span className="account-art-ring account-art-ring-outer" />
          <span className="account-art-ring account-art-ring-inner" />
          <span className="account-art-glow" />
          <span className="account-art-pedestal" />
        </div>
        <img className="account-detail-art" src={artwork} alt={`${product} illustration`} />
      </div>
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
      <div className="account-history-head">
        <h3>Payment history</h3>
        <div className="account-history-year">
          <Button variant="ghost" size="icon" aria-label="Previous year" disabled={historyYear <= HISTORY_YEARS[HISTORY_YEARS.length - 1]} onClick={() => setHistoryYear(y => y - 1)}><ChevronLeft /></Button>
          <span>{historyYear}</span>
          <Button variant="ghost" size="icon" aria-label="Next year" disabled={historyYear >= CURRENT_YEAR} onClick={() => setHistoryYear(y => y + 1)}><ChevronRight /></Button>
        </div>
      </div>
      <div className="account-history-grid" role="img" aria-label={`Monthly payment status for ${historyYear}`}>
        {MONTHS.map((month, i) => {
          const status = statuses[i];
          return (
            <div key={month} className={`account-history-cell account-history-${status}`}>
              <span className="account-history-month">{month}</span>
              {status === "ontime" ? <i className="account-history-dot account-history-ontime" aria-label="On time payment"><Check /></i> : status === "delayed" ? <i className="account-history-dot account-history-delayed" aria-label="Late payment"><X /></i> : <i className="account-history-dot account-history-unreported" aria-label="Not reported" />}
            </div>
          );
        })}
      </div>
      <div className="account-history-legend">
        <span><i className="account-history-dot account-history-ontime"><Check /></i>On time Payment</span>
        <span><i className="account-history-dot account-history-delayed"><X /></i>Late Payment</span>
      </div>
      <p className="account-history-recorded">Last payment recorded by Bureau: {lastReportedIndex >= 0 ? `${MONTHS[lastReportedIndex]} ${historyYear}` : "Not reported"}</p>
    </section>
    <section className="report-section account-detail-facts">
      <div className="account-facts-heading"><h3>Account information</h3>{props.information?.sample && <span>Sample details</span>}</div>
      <dl>
        {loan && <div><dt>Monthly EMI</dt><dd>{money(loan.emi)}</dd></div>}
        <div><dt>Account status</dt><dd className={props.information ? "account-facts-status" : "account-value-unavailable"}>{props.information?.status ?? "Not reported"}</dd></div>
        <div><dt>Account opened on</dt><dd className={props.information ? undefined : "account-value-unavailable"}>{props.information?.openedOn ?? "Not reported"}</dd></div>
        <div><dt>Account closed on</dt><dd className={props.information ? undefined : "account-value-unavailable"}>{props.information?.closedOn ?? (props.information?.status === "Active" ? "Not closed" : "Not reported")}</dd></div>
      </dl>
    </section>
    <section className="report-section account-detail-support"><p>This information is based on what the lender reports to Equifax.</p><Button variant="link" onClick={props.onStartChat}>Report an issue to Arjun</Button></section>
    <Dialog open={showInfo} onOpenChange={setShowInfo}><DialogContent className="credit-report report-score-dialog"><DialogTitle>About this account</DialogTitle><DialogDescription>{props.information?.sample ? "Account information includes sample statuses and dates for this demo, not verified bureau records. " : `Balances and payment information are supplied by ${lender} to Equifax. `}Payment status is separate from whether an account is active or closed.</DialogDescription></DialogContent></Dialog>
  </div>;
}
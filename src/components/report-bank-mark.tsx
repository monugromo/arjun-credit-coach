import { useState } from "react";
import hdfcLogo from "@/assets/lenders/hdfc.png";
import axisLogo from "@/assets/report-banks/axis.png.asset.json";
import sbiLogo from "@/assets/report-banks/sbi.png.asset.json";
import bajajLogo from "@/assets/report-banks/bajaj-finserv.png.asset.json";
import iciciLogo from "@/assets/report-banks/icici.png.asset.json";
import tvsLogo from "@/assets/report-banks/tvs.png.asset.json";
import kotakLogo from "@/assets/report-banks/kotak.png.asset.json";
import idfcLogo from "@/assets/report-banks/idfc.png.asset.json";
import rblLogo from "@/assets/report-banks/rbl.png.asset.json";
import marketsLogo from "@/assets/report-banks/bajaj-markets.png.asset.json";
import paytmLogo from "@/assets/report-banks/paytm.png.asset.json";

const bankLogos: Record<string, string> = {
  "HDFC Bank": hdfcLogo,
  "Axis Bank": axisLogo.url,
  "SBI Card": sbiLogo.url,
  "Bajaj Finserv": bajajLogo.url,
  "ICICI Bank": iciciLogo.url,
  "TVS Credit": tvsLogo.url,
  "Kotak Bank": kotakLogo.url,
  "IDFC FIRST": idfcLogo.url,
  "RBL Bank": rblLogo.url,
  "Bajaj Markets": marketsLogo.url,
  "Paytm": paytmLogo.url,
};

export function ReportBankMark({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const [failed, setFailed] = useState(false);
  const image = logoUrl ?? bankLogos[name];
  const initials = name.split(/\s+/).filter(word => !["Bank", "Card", "Credit", "Finserv"].includes(word)).slice(0, 2).map(word => word.slice(0, 1)).join("");
  return <span className="report-bank-mark" aria-hidden="true">
    {image && !failed ? <img src={image} alt="" onError={() => setFailed(true)} /> : <span>{initials}</span>}
  </span>;
}
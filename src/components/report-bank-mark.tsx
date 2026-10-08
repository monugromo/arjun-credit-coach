import { useState } from "react";
import hdfcLogo from "@/assets/lenders/hdfc.png";

export function ReportBankMark({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const [failed, setFailed] = useState(false);
  const image = logoUrl ?? (name === "HDFC Bank" ? hdfcLogo : undefined);
  const initials = name.split(/\s+/).filter(word => !["Bank", "Card", "Credit", "Finserv"].includes(word)).slice(0, 2).map(word => word.slice(0, 1)).join("");
  return <span className="report-bank-mark" aria-hidden="true">
    {image && !failed ? <img src={image} alt="" onError={() => setFailed(true)} /> : <span>{initials}</span>}
  </span>;
}
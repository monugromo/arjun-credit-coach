import { useState } from "react";

export function ReportBankMark({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(/\s+/).filter(word => !["Bank", "Card", "Credit", "Finserv"].includes(word)).slice(0, 2).map(word => word.slice(0, 1)).join("");
  return <span className="report-bank-mark" aria-hidden="true">
    {logoUrl && !failed ? <img src={logoUrl} alt="" onError={() => setFailed(true)} /> : <span>{initials}</span>}
  </span>;
}
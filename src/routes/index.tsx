import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { CreditReport } from "@/components/credit-report";
import { DEMOS, type DemoUser } from "@/lib/groscore-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GroScore — Credit report" },
      { name: "description", content: "View your credit report, score trend and account details." },
      { property: "og:title", content: "GroScore — Credit report" },
      { property: "og:description", content: "View your credit report, score trend and account details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportOnlyApp,
});

const REPORT_DEMOS: { phone: string; label: string }[] = [
  { phone: "9876500014", label: "014 · Report comparison · Original" },
  { phone: "9876500015", label: "015 · Report comparison · Shaded" },
  { phone: "9876500016", label: "016 · Report comparison · Compact" },
  { phone: "9876500017", label: "017 · Report comparison · Artwork first" },
  { phone: "9876500018", label: "018 · Report comparison · Previous layout" },
  { phone: "9876500019", label: "019 · Report comparison · Compact factors" },
];

function ReportOnlyApp() {
  const [user, setUser] = useState<DemoUser | null>(null);

  if (user) {
    return (
      <CreditReport
        user={user}
        onBack={() => setUser(null)}
        onStartChat={() => setUser(null)}
      />
    );
  }

  return (
    <div className="report-demo-picker">
      <h1 className="report-demo-title">Credit report demos</h1>
      <p className="report-demo-subtitle">Pick a demo number to open its credit report.</p>
      <ul className="report-demo-list">
        {REPORT_DEMOS.map(({ phone, label }) => {
          const demo = DEMOS[phone];
          if (!demo) return null;
          return (
            <li key={phone}>
              <button type="button" className="report-demo-row" onClick={() => setUser(demo)}>
                <span>{label}</span>
                <span className="report-demo-phone">+91 {phone.slice(0, 5)} {phone.slice(5)}</span>
                <ChevronRight size={18} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

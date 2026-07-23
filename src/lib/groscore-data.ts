export type DemoKey =
  | "active"        // paid, existing user → home
  | "lapsed"        // subscription expired → ₹99 restart paywall
  | "unpaid"        // verified but hasn't paid → ₹9 paywall
  | "autofill"      // in CMS + has score → name auto → fetched → validate
  | "new"           // fresh, no score → name manual → NTC path
  | "fetchFail"     // bureau fetch fails → PAN input → found
  | "panMiss";      // PAN not found → has-credit loop

export interface DemoUser {
  key: DemoKey;
  phone: string;
  name: string;
  pan: string;
  dob: string;
  score?: number;
  band?: string;
}

export const DEMOS: Record<string, DemoUser> = {
  "9876500001": { key: "new",       phone: "9876500001", name: "",        pan: "",           dob: "" },
  "9876500002": { key: "active",    phone: "9876500002", name: "Sonu",    pan: "ABCPS5678F", dob: "12 / 04 / 1994", score: 413, band: "Poor" },
  "9876500003": { key: "lapsed",    phone: "9876500003", name: "Darpan",  pan: "ABCPD9012F", dob: "22 / 09 / 1990", score: 612, band: "Fair" },
  "9876500004": { key: "unpaid",    phone: "9876500004", name: "Priya",   pan: "ABCPP3456G", dob: "07 / 02 / 1996", score: 548, band: "Fair" },
  "9876500005": { key: "autofill",  phone: "9876500005", name: "Rahul",   pan: "ABCPR1234F", dob: "15 / 06 / 1993", score: 704, band: "Good" },
  "9876500006": { key: "fetchFail", phone: "9876500006", name: "",        pan: "",           dob: "" },
  "9876500007": { key: "panMiss",   phone: "9876500007", name: "",        pan: "",           dob: "" },
};

export const maskPan = (pan: string) => pan ? pan.slice(0, 3) + "****" + pan.slice(-3) : "";
export const maskPhone = (p: string) => p ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : "";

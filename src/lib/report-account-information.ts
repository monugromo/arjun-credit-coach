export type AccountInformation = {
  status: "Active" | "Closed";
  openedOn: string;
  closedOn?: string;
  updatedOn: string;
  sample?: boolean;
};

// Explicit demo fixtures, not bureau records. Never use these for real accounts.
export const demoAccountInformation: Record<string, AccountInformation> = {
  "4521": { status: "Active", openedOn: "12 Jun 2021", updatedOn: "05 Oct 2026", sample: true },
  "9289": { status: "Active", openedOn: "23 Feb 2023", updatedOn: "05 Oct 2026", sample: true },
  "1102": { status: "Active", openedOn: "08 Nov 2022", updatedOn: "05 Oct 2026", sample: true },
  "6620": { status: "Active", openedOn: "15 Mar 2024", updatedOn: "05 Oct 2026", sample: true },
  "3418": { status: "Active", openedOn: "20 Jan 2025", updatedOn: "05 Oct 2026", sample: true },
  "9034": { status: "Active", openedOn: "07 Aug 2022", updatedOn: "05 Oct 2026", sample: true },
  "7745": { status: "Active", openedOn: "18 Sep 2024", updatedOn: "05 Oct 2026", sample: true },
  "5512": { status: "Active", openedOn: "10 Apr 2026", updatedOn: "05 Oct 2026", sample: true },
  "8807": { status: "Active", openedOn: "03 Jul 2023", updatedOn: "05 Oct 2026", sample: true },
};
import { expect, test } from "bun:test";
import { accountsByLifecycle, type AccountInformation } from "./report-account-information";

test("active accounts precede closed accounts, with unreported status last", () => {
  const information: Record<string, AccountInformation> = {
    "1111": { status: "Closed", openedOn: "01 Jan 2020", updatedOn: "05 Oct 2026" },
    "2222": { status: "Active", openedOn: "01 Jan 2021", updatedOn: "05 Oct 2026" },
    "4444": { status: "Active", openedOn: "01 Jan 2022", updatedOn: "05 Oct 2026" },
  };
  expect(accountsByLifecycle([{ last4: "1111" }, { last4: "2222" }, { last4: "3333" }, { last4: "4444" }], information).map(({ account, index }) => [account.last4, index])).toEqual([["2222", 1], ["4444", 3], ["1111", 0], ["3333", 2]]);
});
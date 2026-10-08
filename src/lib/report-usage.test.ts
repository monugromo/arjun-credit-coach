import { expect, test } from "bun:test";
import { creditUsageTone } from "./report-usage";

test("usage below 30 percent is green", () => {
  expect(creditUsageTone(0)).toBe("positive");
  expect(creditUsageTone(29.9)).toBe("positive");
});
test("usage from 30 to below 50 percent is orange", () => {
  expect(creditUsageTone(30)).toBe("warning");
  expect(creditUsageTone(49.9)).toBe("warning");
});
test("usage of 50 percent or more is red", () => {
  expect(creditUsageTone(50)).toBe("danger");
  expect(creditUsageTone(85)).toBe("danger");
});
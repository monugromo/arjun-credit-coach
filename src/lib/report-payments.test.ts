import { expect, test } from "bun:test";
import { paymentSummary } from "./report-payments";

test("five of six sample EMIs are on time, excluding the DPD account", () => {
  expect(paymentSummary([{ status: "On time" }, { status: "On time" }, { status: "1 DPD" }, { status: "On time" }, { status: "On time" }, { status: "On time" }])).toEqual({ onTime: 5, total: 6 });
});
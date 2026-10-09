/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { DEMOS } from "./groscore-data";

describe("report comparison account", () => {
  test("017 copies compact 016 and changes only account-detail presentation", () => {
    expect(DEMOS["9876500017"]).toEqual({ ...DEMOS["9876500016"], phone: "9876500017", accountDetailLayout: "artwork-first" });
    expect(DEMOS["9876500016"]?.accountDetailLayout).toBeUndefined();
    expect(DEMOS["9876500017"]?.directReportLogin).toBe(true);
  });
  test("016 copies 015 with compact report presentation only", () => {
    const original = DEMOS["9876500015"];
    const compact = DEMOS["9876500016"];
    expect(original).toBeDefined();
    expect(compact).toBeDefined();
    expect(compact).toEqual({ ...original, phone: "9876500016", reportDensity: "compact" });
    expect(original?.reportDensity).toBeUndefined();
    expect(compact?.directReportLogin).toBe(true);
  });
  test("both new comparison numbers skip onboarding after demo OTP", () => {
    expect(DEMOS["9876500014"]?.directReportLogin).toBe(true);
    expect(DEMOS["9876500015"]?.directReportLogin).toBe(true);
    expect(DEMOS["9876500004"]?.directReportLogin).toBeUndefined();
  });

  test("new comparison numbers present baseline and shaded designs with equal scores", () => {
    expect(DEMOS["9876500014"]?.reportDesign).toBeUndefined();
    expect(DEMOS["9876500015"]?.reportDesign).toBe("comparison");
    expect(DEMOS["9876500014"]?.score).toBe(413);
    expect(DEMOS["9876500015"]?.score).toBe(413);
  });
  test("keeps the original Sonu account on its baseline design", () => {
    expect(DEMOS["9876500004"]?.reportDesign).toBeUndefined();
    expect(DEMOS["9876500004"]?.score).toBe(413);
  });

  test("uses the same report identity and score for the shaded comparison", () => {
    const comparison = DEMOS["9876500013"];
    expect(comparison?.reportDesign).toBe("comparison");
    expect(comparison?.name).toBe("Sonu");
    expect(comparison?.score).toBe(413);
    expect(comparison?.band).toBe("Poor");
    expect(comparison?.pan).toBe(DEMOS["9876500004"]?.pan);
  });
});
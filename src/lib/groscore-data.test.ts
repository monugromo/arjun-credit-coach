/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { DEMOS } from "./groscore-data";

describe("report comparison account", () => {
  test("019 preserves 016 data and changes only factor presentation", () => {
    expect(DEMOS["9876500019"]).toEqual({ ...DEMOS["9876500015"], phone: "9876500019", reportDensity: "compact", reportFactorLayout: "compact" });
    expect(DEMOS["9876500015"]?.reportFactorLayout).toBeUndefined();
    expect(DEMOS["9876500019"]?.directReportLogin).toBe(true);
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
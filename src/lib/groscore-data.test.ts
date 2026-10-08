/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { DEMOS } from "./groscore-data";

describe("report comparison account", () => {
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
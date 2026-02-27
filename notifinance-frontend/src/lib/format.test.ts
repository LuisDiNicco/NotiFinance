import { describe, expect, it } from "vitest";
import { formatCurrency, formatPercent } from "@/lib/format";

describe("format helpers", () => {
  it("formats ARS currency", () => {
    expect(formatCurrency(1234.56, "ARS")).toContain("$");
  });

  it("formats percent with sign", () => {
    expect(formatPercent(2.5)).toBe("+2,50%");
    expect(formatPercent(-1.3)).toBe("-1,30%");
  });
});

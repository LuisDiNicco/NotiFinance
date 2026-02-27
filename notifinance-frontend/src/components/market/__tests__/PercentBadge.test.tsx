import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PercentBadge } from "../PercentBadge";

describe("PercentBadge", () => {
  it("formats positive percentage", () => {
    render(<PercentBadge value={2.5} />);
    expect(screen.getByText("+2,50%")).toBeInTheDocument();
  });

  it("formats negative and zero percentage", () => {
    const { rerender } = render(<PercentBadge value={-1.23} />);
    expect(screen.getByText("-1,23%")).toBeInTheDocument();

    rerender(<PercentBadge value={0} />);
    expect(screen.getByText("0,00%")).toBeInTheDocument();
  });
});

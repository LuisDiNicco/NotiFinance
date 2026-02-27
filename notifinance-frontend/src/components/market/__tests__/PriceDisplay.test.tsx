import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PriceDisplay } from "../PriceDisplay";

describe("PriceDisplay", () => {
  it("renders formatted ARS currency", () => {
    render(<PriceDisplay value={1234.56} variation={0} />);
    expect(screen.getByText("$ 1.234,56")).toBeInTheDocument();
  });

  it("renders up/down arrows by variation sign", () => {
    const { rerender } = render(<PriceDisplay value={1000} variation={2} />);
    expect(document.querySelector(".text-green-600")).toBeTruthy();

    rerender(<PriceDisplay value={1000} variation={-2} />);
    expect(document.querySelector(".text-red-600")).toBeTruthy();
  });
});

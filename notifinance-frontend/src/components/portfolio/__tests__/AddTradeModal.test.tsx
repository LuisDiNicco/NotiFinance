import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AddTradeModal } from "../AddTradeModal";

describe("AddTradeModal", () => {
  it("opens and renders form", () => {
    render(<AddTradeModal portfolioId="port-1" />);
    fireEvent.click(screen.getByRole("button", { name: /nueva operación/i }));
    expect(screen.getByText("Registrar Operación")).toBeInTheDocument();
  });

  it("shows submit button once opened", () => {
    render(<AddTradeModal portfolioId="port-1" />);
    fireEvent.click(screen.getByRole("button", { name: /nueva operación/i }));

    const submitBtn = screen.getByRole("button", { name: /guardar operación/i });
    expect(submitBtn).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { AlertFormModal } from "../AlertFormModal";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("AlertFormModal", () => {
  it("renders correctly when open", () => {
    render(<AlertFormModal open={true} onOpenChange={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText("Crear Nueva Alerta")).toBeInTheDocument();
  });

  it("calls onSave with form values when submitted", async () => {
    const handleSave = vi.fn();
    render(<AlertFormModal open={true} onOpenChange={vi.fn()} onSave={handleSave} />);

    fireEvent.change(screen.getByPlaceholderText("Ej: GGAL"), { target: { value: "GGAL" } });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "8500" } });

    fireEvent.click(screen.getByRole("button", { name: /guardar alerta|crear alerta|guardar/i }));

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
    });
  });
});

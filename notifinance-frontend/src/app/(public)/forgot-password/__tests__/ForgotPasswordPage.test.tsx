import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ForgotPasswordPage from "../page";
import { toast } from "sonner";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders forgot password form correctly", () => {
    render(<ForgotPasswordPage />);
    
    expect(screen.getByText("Recuperar Contraseña", { selector: '[data-slot="card-title"]' })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar Instrucciones" })).toBeInTheDocument();
  });

  it("shows validation error for empty email", async () => {
    render(<ForgotPasswordPage />);
    
    const submitButton = screen.getByRole("button", { name: "Enviar Instrucciones" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("handles successful submission", async () => {
    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", { name: "Enviar Instrucciones" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Instrucciones enviadas a tu email");
    }, { timeout: 2000 });
    
    expect(screen.getByText(/revisá tu bandeja de entrada/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /intentar con otro email/i })).toBeInTheDocument();
  });

  it("allows trying again after successful submission", async () => {
    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", { name: "Enviar Instrucciones" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/revisá tu bandeja de entrada/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    const tryAgainButton = screen.getByRole("button", { name: /intentar con otro email/i });
    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    }, { timeout: 2000 });
    expect(screen.getByRole("button", { name: "Enviar Instrucciones" })).toBeInTheDocument();
  });
});

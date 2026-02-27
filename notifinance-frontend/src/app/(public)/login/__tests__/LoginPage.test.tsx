import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "../page";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock authStore
vi.mock("@/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("LoginPage", () => {
  const mockPush = vi.fn();
  const mockSetSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as never);
    vi.mocked(useAuthStore).mockReturnValue(mockSetSession as never);
  });

  it("renders login form correctly", () => {
    render(<LoginPage />);
    
    expect(screen.getByText("Iniciar Sesión", { selector: '[data-slot="card-title"]' })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar Sesión" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /probar demo/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("handles successful demo login", async () => {
    render(<LoginPage />);
    
    const demoButton = screen.getByRole("button", { name: /probar demo/i });
    fireEvent.click(demoButton);

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ email: "demo@notifinance.com" })
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Sesión demo iniciada");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    }, { timeout: 2000 });
  });

  it("handles successful standard login", async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Contraseña");
    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });

    fireEvent.change(emailInput, { target: { value: "demo@notifinance.com" } });
    fireEvent.change(passwordInput, { target: { value: "demo123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ email: "demo@notifinance.com" })
        })
      );
    }, { timeout: 2000 });
    expect(toast.success).toHaveBeenCalledWith("Inicio de sesión exitoso");
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("handles invalid credentials", async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Contraseña");
    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });

    fireEvent.change(emailInput, { target: { value: "wrong@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Credenciales inválidas"));
    }, { timeout: 2000 });
    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

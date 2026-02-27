import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "../page";
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

describe("RegisterPage", () => {
  const mockPush = vi.fn();
  const mockSetSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as never);
    vi.mocked(useAuthStore).mockReturnValue(mockSetSession as never);
  });

  it("renders register form correctly", () => {
    render(<RegisterPage />);
    
    expect(screen.getByText("Crear Cuenta", { selector: '[data-slot="card-title"]' })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrarse" })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<RegisterPage />);
    
    const submitButton = screen.getByRole("button", { name: "Registrarse" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el nombre debe tener al menos 2 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("shows validation error for mismatched passwords", async () => {
    render(<RegisterPage />);
    
    const nameInput = screen.getByLabelText("Nombre completo");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Contraseña");
    const confirmPasswordInput = screen.getByLabelText("Confirmar Contraseña");
    const submitButton = screen.getByRole("button", { name: "Registrarse" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password456" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("handles successful registration", async () => {
    render(<RegisterPage />);
    
    const nameInput = screen.getByLabelText("Nombre completo");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Contraseña");
    const confirmPasswordInput = screen.getByLabelText("Confirmar Contraseña");
    const submitButton = screen.getByRole("button", { name: "Registrarse" });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ email: "test@example.com", displayName: "Test User" })
        })
      );
    }, { timeout: 2000 });
    expect(toast.success).toHaveBeenCalledWith("Cuenta creada exitosamente");
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});

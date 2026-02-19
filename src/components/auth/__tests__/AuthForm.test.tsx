import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocks must come before component import
import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

import { mockAuthContext, mockToast, TestWrapper } from "@/test/mocks/contexts";
import AuthForm from "../AuthForm";

describe("AuthForm - Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form correctly", () => {
    render(<AuthForm type="login" />, { wrapper: TestWrapper });

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows link to registration page", () => {
    render(<AuthForm type="login" />, { wrapper: TestWrapper });

    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/register");
  });

  it("shows Google sign-in button", () => {
    render(<AuthForm type="login" />, { wrapper: TestWrapper });

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("shows validation error for empty email on submit", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="login" />, { wrapper: TestWrapper });

    // Leave email empty, fill only password
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Should show validation error - email is required and must be valid
    await waitFor(() => {
      expect(
        screen.getByText(/valid email/i) || screen.getByText(/email/i)
      ).toBeInTheDocument();
    });
  });

  it("shows validation error when password is empty", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="login" />, { wrapper: TestWrapper });

    await user.type(screen.getByPlaceholderText(/name@example.com/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("calls signInWithEmail with correct credentials on valid submission", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="login" />, { wrapper: TestWrapper });

    await user.type(screen.getByPlaceholderText(/name@example.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockAuthContext.signInWithEmail).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });
  });

  it("shows error toast when login fails", async () => {
    const user = userEvent.setup();
    const errorMessage = "Invalid login credentials";
    mockAuthContext.signInWithEmail.mockRejectedValueOnce(new Error(errorMessage));

    render(<AuthForm type="login" />, { wrapper: TestWrapper });

    await user.type(screen.getByPlaceholderText(/name@example.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      );
    });
  });

  it("disables submit button while loading", async () => {
    // Make signInWithEmail hang indefinitely
    mockAuthContext.signInWithEmail.mockImplementation(
      () => new Promise(() => {})
    );

    const user = userEvent.setup();
    render(<AuthForm type="login" />, { wrapper: TestWrapper });

    await user.type(screen.getByPlaceholderText(/name@example.com/i), "test@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button", { name: /signing in.../i })).toBeDisabled();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="login" />, { wrapper: TestWrapper });

    const passwordInput = screen.getByPlaceholderText("••••••••");
    expect(passwordInput).toHaveAttribute("type", "password");

    // Find and click the eye toggle button
    const toggleBtn = screen.getByRole("button", { name: "" }); // eye icon button
    await user.click(toggleBtn);

    expect(screen.getByPlaceholderText("••••••••")).toHaveAttribute("type", "text");
  });
});

describe("AuthForm - Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders registration form correctly", () => {
    render(<AuthForm type="register" />, { wrapper: TestWrapper });

    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
  });

  it("shows confirm password field on register form", () => {
    render(<AuthForm type="register" />, { wrapper: TestWrapper });

    expect(screen.getByText(/confirm password/i)).toBeInTheDocument();
  });

  it("shows validation error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="register" />, { wrapper: TestWrapper });

    await user.type(screen.getByPlaceholderText(/your full name/i), "Test User");
    await user.type(screen.getByPlaceholderText(/name@example.com/i), "test@example.com");

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "differentpass");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for name shorter than 2 chars", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="register" />, { wrapper: TestWrapper });

    await user.type(screen.getByPlaceholderText(/your full name/i), "A");
    await user.type(screen.getByPlaceholderText(/name@example.com/i), "test@example.com");

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "password123");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it("calls signUp with correct args on valid submission", async () => {
    const user = userEvent.setup();
    render(<AuthForm type="register" />, { wrapper: TestWrapper });

    await user.type(screen.getByPlaceholderText(/your full name/i), "Jane Doe");
    await user.type(screen.getByPlaceholderText(/name@example.com/i), "jane@example.com");

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "password123");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockAuthContext.signUp).toHaveBeenCalledWith(
        "jane@example.com",
        "password123",
        "Jane Doe"
      );
    });
  });

  it("shows error toast when registration fails", async () => {
    const user = userEvent.setup();
    const errorMessage = "Email already in use";
    mockAuthContext.signUp.mockRejectedValueOnce(new Error(errorMessage));

    render(<AuthForm type="register" />, { wrapper: TestWrapper });

    await user.type(screen.getByPlaceholderText(/your full name/i), "Jane Doe");
    await user.type(screen.getByPlaceholderText(/name@example.com/i), "jane@example.com");

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "password123");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      );
    });
  });

  it("shows link to login page", () => {
    render(<AuthForm type="register" />, { wrapper: TestWrapper });

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });
});

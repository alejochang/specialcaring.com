import React, { ReactNode } from "react";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

// ---------- Auth mock ----------
export const mockUser = {
  id: "user-123",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: { name: "Test User" },
  aud: "authenticated",
  created_at: "2024-01-01T00:00:00.000Z",
};

export const mockAuthContext = {
  user: mockUser,
  session: null,
  isLoading: false,
  isReviewMode: false,
  isReviewModeAvailable: false,
  signInWithEmail: vi.fn().mockResolvedValue(undefined),
  signInWithGoogle: vi.fn().mockResolvedValue(undefined),
  signInWithTwitter: vi.fn().mockResolvedValue(undefined),
  signInWithFacebook: vi.fn().mockResolvedValue(undefined),
  signUp: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined),
  startReviewMode: vi.fn().mockResolvedValue(undefined),
  exitReviewMode: vi.fn().mockResolvedValue(undefined),
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// ---------- Child mock ----------
export const mockChild = {
  id: "child-123",
  created_by: "user-123",
  name: "Test Child",
  avatar_url: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  accessRole: "owner" as const,
};

export const mockChildContext = {
  children: [mockChild],
  activeChild: mockChild,
  setActiveChildId: vi.fn(),
  isLoading: false,
  addChild: vi.fn().mockResolvedValue(undefined),
  updateChild: vi.fn().mockResolvedValue(undefined),
  updateChildProfile: vi.fn().mockResolvedValue(undefined),
  updateChildAvatar: vi.fn().mockResolvedValue(undefined),
  deleteChild: vi.fn().mockResolvedValue(undefined),
  refetch: vi.fn().mockResolvedValue(undefined),
  isOwner: vi.fn().mockReturnValue(true),
};

vi.mock("@/contexts/ChildContext", () => ({
  useChild: () => mockChildContext,
  ChildProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// ---------- User role mock ----------
export const mockUserRole = {
  role: "caregiver" as const,
  isLoading: false,
  error: null,
  isAdmin: false,
  isCaregiver: true,
  isViewer: false,
  canEdit: true,
  isApproved: true,
};

vi.mock("@/hooks/useUserRole", () => ({
  useUserRole: () => mockUserRole,
}));

// ---------- Toast mock ----------
export const mockToast = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

// ---------- Test wrapper ----------
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface WrapperProps {
  children: ReactNode;
  queryClient?: QueryClient;
  initialEntries?: string[];
}

export function TestWrapper({ children, queryClient, initialEntries = ["/"] }: WrapperProps) {
  const qc = queryClient ?? createQueryClient();
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={qc}>
        {children}
      </QueryClientProvider>
    </MemoryRouter>
  );
}

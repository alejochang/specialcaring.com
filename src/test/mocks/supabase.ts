import { vi } from "vitest";

// Generic chainable Supabase query mock that resolves to { data, error }
export const createSupabaseMock = (data: unknown = [], error: unknown = null) => {
  const chain: Record<string, unknown> = {};

  const methods = [
    "select", "insert", "update", "delete", "upsert",
    "eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike",
    "in", "is", "not", "or", "and", "order", "limit", "range",
    "single", "maybeSingle", "returns",
  ];

  methods.forEach((method) => {
    chain[method] = vi.fn().mockReturnValue(chain);
  });

  // Terminal methods that return the resolved data
  (chain as Record<string, unknown>).select = vi.fn().mockReturnValue({
    ...chain,
    eq: vi.fn().mockReturnValue({
      ...chain,
      order: vi.fn().mockReturnValue({
        ...chain,
        order: vi.fn().mockResolvedValue({ data, error }),
        maybeSingle: vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] ?? null : data, error }),
        then: undefined,
      }),
      maybeSingle: vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] ?? null : data, error }),
      single: vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data[0] ?? null : data, error }),
    }),
  });

  return chain;
};

// Default mock for @/integrations/supabase/client
export const supabaseMock = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: "new-id" }, error: null }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
  auth: {
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
  },
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: supabaseMock,
}));

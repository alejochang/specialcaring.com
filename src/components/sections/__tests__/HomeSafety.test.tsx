import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocks must come before component import
import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

import { supabaseMock } from "@/test/mocks/supabase";
import { mockUser, TestWrapper } from "@/test/mocks/contexts";
import HomeSafety from "../HomeSafety";

// Helper to build the fetch mock (returns completed check_id rows)
function setupFetchMock(checkIds: string[] = []) {
  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: checkIds.map((id) => ({ check_id: id })),
        error: null,
      }),
    }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  });
}

describe("HomeSafety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFetchMock();
  });

  it("renders Home Safety heading", async () => {
    render(<HomeSafety />, { wrapper: TestWrapper });

    expect(await screen.findByText("Home Safety")).toBeInTheDocument();
  });

  it("renders safety checklist percentage", async () => {
    render(<HomeSafety />, { wrapper: TestWrapper });

    expect(await screen.findByText(/safety checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
  });

  it("renders completed items badge", async () => {
    render(<HomeSafety />, { wrapper: TestWrapper });

    // e.g. "0 of 26 items completed"
    expect(await screen.findByText(/0 of \d+ items completed/i)).toBeInTheDocument();
  });

  it("shows Emergency Preparedness tab by default", async () => {
    render(<HomeSafety />, { wrapper: TestWrapper });

    expect(await screen.findByText("Emergency Preparedness")).toBeInTheDocument();
    expect(screen.getByText("Emergency Readiness Checklist")).toBeInTheDocument();
  });

  // Phase 3: RLS — delete includes child_id
  it("toggleCheck DELETE call includes child_id when unchecking", async () => {
    const user = userEvent.setup();

    // Start with "emergency-contacts" already checked
    const deleteEqChain = vi.fn().mockResolvedValue({ data: null, error: null });
    const deleteEq2 = vi.fn().mockReturnValue({ eq: deleteEqChain });
    const deleteEq1 = vi.fn().mockReturnValue({ eq: deleteEq2 });
    const deleteFn = vi.fn().mockReturnValue({ eq: deleteEq1 });

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ check_id: "emergency-contacts" }],
          error: null,
        }),
      }),
      delete: deleteFn,
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    render(<HomeSafety />, { wrapper: TestWrapper });

    // Wait for the checklist to render
    await screen.findByText("Emergency Readiness Checklist");

    // The first item "Emergency contact list posted in visible location" should be checked (green)
    const checkboxes = screen.getAllByRole("button", { name: "" });
    // Click the first checkbox button to toggle it off (uncheck)
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled();
      // Chain: .delete().eq('check_id', ...).eq('user_id', ...).eq('child_id', ...)
      expect(deleteEq1).toHaveBeenCalledWith("check_id", "emergency-contacts");
      expect(deleteEq2).toHaveBeenCalledWith("user_id", mockUser.id);
      expect(deleteEqChain).toHaveBeenCalledWith("child_id", "child-123");
    });
  });

  it("toggleCheck INSERT call includes child_id when checking", async () => {
    const user = userEvent.setup();

    const insertFn = vi.fn().mockResolvedValue({ data: null, error: null });

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: insertFn,
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    });

    render(<HomeSafety />, { wrapper: TestWrapper });
    await screen.findByText("Emergency Readiness Checklist");

    const checkboxes = screen.getAllByRole("button", { name: "" });
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(insertFn).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: mockUser.id,
            child_id: "child-123",
            check_id: "emergency-contacts",
          }),
        ])
      );
    });
  });

  it("shows completion percentage when items are checked", async () => {
    // All 6 emergency checks completed
    setupFetchMock(["emergency-contacts", "medical-info", "evacuation-plan", "emergency-kit", "backup-power", "communication-plan"]);

    render(<HomeSafety />, { wrapper: TestWrapper });

    // 6 out of 26 total items = ~23%
    expect(await screen.findByText(/23% complete/i)).toBeInTheDocument();
  });

  it("renders Emergency Contacts quick-access numbers", async () => {
    render(<HomeSafety />, { wrapper: TestWrapper });

    expect(await screen.findByText("911")).toBeInTheDocument();
    expect(screen.getByText("Poison Control")).toBeInTheDocument();
  });

  it("renders all four checklist category tabs", async () => {
    render(<HomeSafety />, { wrapper: TestWrapper });

    await screen.findByText("Home Safety");
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThanOrEqual(4);
  });
});

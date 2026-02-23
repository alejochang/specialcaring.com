import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocks must come before component import
import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

import { supabaseMock } from "@/test/mocks/supabase";
import { mockUser, TestWrapper } from "@/test/mocks/contexts";
import CommunityServices from "../CommunityServices";

function setupFetchMock(savedIds: string[] = []) {
  supabaseMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: savedIds.map((id) => ({ service_id: id })),
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

describe("CommunityServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFetchMock();
  });

  it("renders Community Services heading", async () => {
    render(<CommunityServices />, { wrapper: TestWrapper });

    expect(await screen.findByText("Community Services")).toBeInTheDocument();
  });

  it("renders education tab services by default", async () => {
    render(<CommunityServices />, { wrapper: TestWrapper });

    expect(await screen.findByText("Early Intervention Program")).toBeInTheDocument();
    expect(screen.getByText("Special Education Resource Center")).toBeInTheDocument();
  });

  it("renders category tabs", async () => {
    render(<CommunityServices />, { wrapper: TestWrapper });

    await screen.findByText("Community Services");
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThanOrEqual(4);
  });

  it("shows bookmark button for each service card", async () => {
    render(<CommunityServices />, { wrapper: TestWrapper });

    await screen.findByText("Early Intervention Program");
    // Each service card has a bookmark ghost button
    const ghostButtons = screen.getAllByRole("button", { name: "" });
    expect(ghostButtons.length).toBeGreaterThanOrEqual(3); // 3 education services
  });

  // Phase 3: RLS — delete includes child_id
  it("toggleSaved DELETE call includes child_id when unsaving a service", async () => {
    const user = userEvent.setup();

    const deleteEqChain = vi.fn().mockResolvedValue({ data: null, error: null });
    const deleteEq3 = vi.fn().mockReturnValue({ eq: deleteEqChain });
    const deleteEq2 = vi.fn().mockReturnValue({ eq: deleteEq3 });
    const deleteEq1 = vi.fn().mockReturnValue({ eq: deleteEq2 });
    const deleteFn = vi.fn().mockReturnValue({ eq: deleteEq1 });

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ service_id: "early-intervention" }],
          error: null,
        }),
      }),
      delete: deleteFn,
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    render(<CommunityServices />, { wrapper: TestWrapper });
    await screen.findByText("Early Intervention Program");

    // The first service "early-intervention" is already saved — clicking bookmark unsaves it
    const bookmarkButtons = screen.getAllByRole("button", { name: "" });
    await user.click(bookmarkButtons[0]);

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled();
      // Chain: .eq('service_id', ...) -> .eq('created_by', ...) -> .eq('child_id', ...)
      expect(deleteEq1).toHaveBeenCalledWith("service_id", "early-intervention");
      expect(deleteEq2).toHaveBeenCalledWith("created_by", mockUser.id);
      expect(deleteEq3).toHaveBeenCalledWith("child_id", "child-123");
    });
  });

  it("toggleSaved INSERT call includes child_id when saving a service", async () => {
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

    render(<CommunityServices />, { wrapper: TestWrapper });
    await screen.findByText("Early Intervention Program");

    const bookmarkButtons = screen.getAllByRole("button", { name: "" });
    await user.click(bookmarkButtons[0]);

    await waitFor(() => {
      expect(insertFn).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            created_by: mockUser.id,
            child_id: "child-123",
            service_id: "early-intervention",
          }),
        ])
      );
    });
  });

  it("shows Saved Services card when services are saved", async () => {
    setupFetchMock(["early-intervention", "special-education"]);

    render(<CommunityServices />, { wrapper: TestWrapper });

    expect(await screen.findByText(/saved services \(2\)/i)).toBeInTheDocument();
  });

  it("switches to Healthcare tab and shows health services", async () => {
    const user = userEvent.setup();
    render(<CommunityServices />, { wrapper: TestWrapper });

    await screen.findByText("Early Intervention Program");

    const tabs = screen.getAllByRole("tab");
    // Find the Healthcare tab
    const healthTab = tabs.find((t) => t.textContent?.includes("Healthcare"));
    if (healthTab) {
      await user.click(healthTab);
      expect(await screen.findByText("Children's Developmental Center")).toBeInTheDocument();
    }
  });
});

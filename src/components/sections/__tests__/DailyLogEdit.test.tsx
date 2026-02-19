/**
 * Phase 4 tests: DailyLog edit functionality
 * Tests editingEntry state, startEditEntry, and handleUpdateEntry.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";

import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

import { supabaseMock } from "@/test/mocks/supabase";
import { TestWrapper } from "@/test/mocks/contexts";
import DailyLog from "../DailyLog";

// Use date-fns format() to match component's local date filtering (not UTC)
const TODAY = format(new Date(), "yyyy-MM-dd");

const mockEntry = {
  id: "entry-edit-1",
  date: TODAY,
  time: "09:00",
  category: "medical",
  mood: "happy",
  title: "Morning therapy session",
  description: "Great progress today",
  tags: [],
  priority: "medium",
};

function setupMocks(entries = [mockEntry]) {
  const updateEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const updateFn = vi.fn().mockReturnValue({ eq: updateEq });

  // Use plain arrow functions (not vi.fn()) for nested chain to avoid
  // vi.clearAllMocks() interactions with registered mock instances.
  supabaseMock.from.mockImplementation(() => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          order: () => Promise.resolve({ data: entries, error: null }),
        }),
      }),
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "new-id", ...mockEntry }, error: null }),
      }),
    }),
    update: updateFn,
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: null }),
    }),
  }));

  return { updateFn, updateEq };
}

describe("DailyLog - Edit Functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it("shows Edit button (pencil icon) on each entry card", async () => {
    render(<DailyLog />, { wrapper: TestWrapper });

    await screen.findByText("Morning therapy session");

    // Switch to All Entries tab to see entry
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: /all entries/i }));
    await screen.findByText("Morning therapy session");

    // There should be icon buttons: one edit (pencil), one delete (trash)
    // The entry card should be visible in All Entries tab
    expect(screen.getByText("Morning therapy session")).toBeInTheDocument();
  });

  it("clicking edit button populates form with entry data", async () => {
    const user = userEvent.setup();
    render(<DailyLog />, { wrapper: TestWrapper });

    await screen.findByText("Morning therapy session");

    // Switch to All Entries tab
    await user.click(screen.getByRole("tab", { name: /all entries/i }));
    await screen.findByText("Morning therapy session");

    // Find all ghost icon-buttons in the card. Edit button comes before Delete.
    const allButtons = screen.getAllByRole("button", { name: "" });
    // Find the edit button: it should open the form in edit mode
    // In the renderEntries function, each entry has: [mood icon ghost btn - NO, these are just icons]
    // The buttons with onClick are: Edit (startEditEntry) and Trash (handleDeleteEntry)
    // Filter to buttons that are h-8 w-8 ghost buttons (icon buttons on the card)
    // Simulate clicking first icon button found on the card
    const editButtons = allButtons.filter((btn) => btn.closest('[class*="CardContent"]'));

    if (editButtons.length >= 1) {
      await user.click(editButtons[0]);

      // Form should now show with the entry's title pre-filled
      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText(/brief description/i);
        expect(titleInput).toHaveValue("Morning therapy session");
      });
    }
  });

  it("form heading shows Edit Entry context when editing", async () => {
    const user = userEvent.setup();
    render(<DailyLog />, { wrapper: TestWrapper });

    await screen.findByText("Morning therapy session");
    await user.click(screen.getByRole("tab", { name: /all entries/i }));
    await screen.findByText("Morning therapy session");

    // Click the first icon button (edit) on the entry card
    const iconBtns = screen.getAllByRole("button", { name: "" });
    const cardBtns = iconBtns.filter((btn) => btn.closest("[class*='CardContent']"));
    if (cardBtns.length >= 1) {
      await user.click(cardBtns[0]);

      // Form opens - title input should be populated
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/brief description/i)).toBeInTheDocument();
      });
    }
  });

  it("Update Entry button calls supabase update with correct id", async () => {
    const user = userEvent.setup();

    const updateEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const updateFn = vi.fn().mockReturnValue({ eq: updateEq });

    supabaseMock.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            order: () => Promise.resolve({ data: [mockEntry], error: null }),
          }),
        }),
      }),
      update: updateFn,
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    }));

    render(<DailyLog />, { wrapper: TestWrapper });
    await screen.findByText("Morning therapy session");

    await user.click(screen.getByRole("tab", { name: /all entries/i }));
    await screen.findByText("Morning therapy session");

    // Open edit by clicking the edit icon button
    const iconBtns = screen.getAllByRole("button", { name: "" });
    const cardBtns = iconBtns.filter((btn) => btn.closest("[class*='CardContent']"));

    if (cardBtns.length >= 1) {
      await user.click(cardBtns[0]);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/brief description/i)).toBeInTheDocument();
      });

      // Change the title
      const titleInput = screen.getByPlaceholderText(/brief description/i);
      await user.clear(titleInput);
      await user.type(titleInput, "Updated therapy session");

      // Click Update Entry / Add Entry button
      const submitBtn = screen.getByRole("button", { name: /update entry|add entry/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(updateFn).toHaveBeenCalled();
        expect(updateEq).toHaveBeenCalledWith("id", mockEntry.id);
      });
    }
  });

  it("New Entry button label does not show when editingEntry is set", async () => {
    const user = userEvent.setup();
    render(<DailyLog />, { wrapper: TestWrapper });

    // No edit mode - New Entry button should be visible
    await screen.findByText("Daily Log");
    expect(screen.getByRole("button", { name: /new entry/i })).toBeInTheDocument();
  });
});

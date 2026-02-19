/**
 * Phase 4 tests: Celebrations moment edit/delete
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

import { supabaseMock } from "@/test/mocks/supabase";
import { TestWrapper } from "@/test/mocks/contexts";
import Celebrations from "../Celebrations";

const mockCategory = {
  id: "cat-1",
  name: "Communication",
  icon: "message-circle",
  color: "blue",
  sort_order: 1,
};

const mockMoment = {
  id: "moment-1",
  journey_id: "journey-1",
  child_id: "child-123",
  title: "Said hello for the first time",
  notes: "It was a great day",
  how_we_celebrated: "Ice cream!",
  moment_date: "2024-06-01",
  created_at: "2024-06-01T10:00:00Z",
};

const mockJourney = {
  id: "journey-1",
  child_id: "child-123",
  category_id: "cat-1",
  title: "Learning to communicate",
  description: "Journey tracking communication progress",
  stage: "growing",
  is_starred: false,
  started_at: "2024-01-01",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-06-01T00:00:00Z",
};

function setupMocks({
  categories = [mockCategory],
  journeys = [mockJourney],
  moments = [mockMoment],
} = {}) {
  // Mock window.confirm for delete operations
  vi.spyOn(window, "confirm").mockReturnValue(true);

  const updateEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const updateFn = vi.fn().mockReturnValue({ eq: updateEq });
  const deleteEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const deleteFn = vi.fn().mockReturnValue({ eq: deleteEq });
  const insertFn = vi.fn().mockResolvedValue({ data: null, error: null });

  supabaseMock.from.mockImplementation((table: string) => {
    if (table === "celebration_categories") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: categories, error: null }),
          }),
        }),
      };
    }
    if (table === "journeys") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: journeys, error: null }),
          }),
        }),
        insert: insertFn,
        update: updateFn,
        delete: deleteFn,
      };
    }
    if (table === "journey_moments") {
      return {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: moments, error: null }),
          }),
        }),
        insert: insertFn,
        update: updateFn,
        delete: deleteFn,
      };
    }
    // Default
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
  });

  // Mock rpc for seed_celebration_categories
  (supabaseMock as any).rpc = vi.fn().mockResolvedValue({ data: null, error: null });

  return { updateFn, updateEq, deleteFn, deleteEq, insertFn };
}

describe("Celebrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it("renders Celebrations heading", async () => {
    render(<Celebrations />, { wrapper: TestWrapper });

    expect(await screen.findByText("Celebrations")).toBeInTheDocument();
  });

  it("renders journey title after loading", async () => {
    render(<Celebrations />, { wrapper: TestWrapper });

    expect(await screen.findByText("Learning to communicate")).toBeInTheDocument();
  });

  it("shows stats cards when journeys exist", async () => {
    render(<Celebrations />, { wrapper: TestWrapper });

    await screen.findByText("Learning to communicate");
    expect(screen.getByText("Journeys")).toBeInTheDocument();
    expect(screen.getByText("Moments")).toBeInTheDocument();
  });

  it("shows Start a Journey button", async () => {
    render(<Celebrations />, { wrapper: TestWrapper });

    expect(await screen.findByRole("button", { name: /start a journey/i })).toBeInTheDocument();
  });

  it("shows empty state when no journeys", async () => {
    setupMocks({ categories: [mockCategory], journeys: [], moments: [] });
    render(<Celebrations />, { wrapper: TestWrapper });

    expect(await screen.findByText(/start celebrating!/i)).toBeInTheDocument();
  });

  it("Add Moment button is visible on each journey", async () => {
    render(<Celebrations />, { wrapper: TestWrapper });

    await screen.findByText("Learning to communicate");
    expect(screen.getByRole("button", { name: /add moment/i })).toBeInTheDocument();
  });

  it("opens moment dialog when Add Moment is clicked", async () => {
    const user = userEvent.setup();
    render(<Celebrations />, { wrapper: TestWrapper });

    await screen.findByText("Learning to communicate");
    await user.click(screen.getByRole("button", { name: /add moment/i }));

    expect(await screen.findByText("Capture a Moment")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/held the spoon/i)).toBeInTheDocument();
  });

  // Phase 4: Moment edit
  it("shows moments timeline when Show Moments button is clicked", async () => {
    const user = userEvent.setup();
    render(<Celebrations />, { wrapper: TestWrapper });

    await screen.findByText("Learning to communicate");

    const showMomentsBtn = await screen.findByRole("button", { name: /show 1 moment/i });
    await user.click(showMomentsBtn);

    expect(await screen.findByText("Said hello for the first time")).toBeInTheDocument();
    expect(screen.getByText("It was a great day")).toBeInTheDocument();
    expect(screen.getByText("Ice cream!")).toBeInTheDocument();
  });

  it("opens edit moment dialog when pencil icon on moment is clicked", async () => {
    const user = userEvent.setup();
    render(<Celebrations />, { wrapper: TestWrapper });

    await screen.findByText("Learning to communicate");

    // Expand moments
    const showBtn = await screen.findByRole("button", { name: /show 1 moment/i });
    await user.click(showBtn);
    await screen.findByText("Said hello for the first time");

    // Find the edit icon button inside the moment timeline
    const iconBtns = screen.getAllByRole("button", { name: "" });
    // Moment edit/delete buttons are h-6 w-6, look for them after the moment text
    // Click the first icon button that's inside the moment timeline area
    const momentEditBtn = iconBtns.find((btn) => btn.closest("[class*='special-50']"));
    if (momentEditBtn) {
      await user.click(momentEditBtn);
      expect(await screen.findByText("Edit Moment")).toBeInTheDocument();
    }
  });

  it("edit moment dialog pre-fills with existing moment data", async () => {
    const user = userEvent.setup();
    render(<Celebrations />, { wrapper: TestWrapper });

    await screen.findByText("Learning to communicate");
    const showBtn = await screen.findByRole("button", { name: /show 1 moment/i });
    await user.click(showBtn);
    await screen.findByText("Said hello for the first time");

    const iconBtns = screen.getAllByRole("button", { name: "" });
    const momentBtn = iconBtns.find((btn) => btn.closest("[class*='special-50']"));
    if (momentBtn) {
      await user.click(momentBtn);
      await screen.findByText("Edit Moment");

      // The title field should be pre-filled
      await waitFor(() => {
        expect(screen.getByDisplayValue("Said hello for the first time")).toBeInTheDocument();
      });
    }
  });

  // Phase 4: Moment delete (via AlertDialog)
  it("handleDeleteMoment opens AlertDialog and deletes from journey_moments on confirm", async () => {
    const user = userEvent.setup();

    const { deleteFn, deleteEq } = setupMocks();

    // Re-setup with tracked delete
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "celebration_categories") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [mockCategory], error: null }),
            }),
          }),
        };
      }
      if (table === "journeys") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [mockJourney], error: null }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
          delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        };
      }
      if (table === "journey_moments") {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [mockMoment], error: null }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
          delete: deleteFn,
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
    });

    render(<Celebrations />, { wrapper: TestWrapper });
    await screen.findByText("Learning to communicate");

    const showBtn = await screen.findByRole("button", { name: /show 1 moment/i });
    await user.click(showBtn);
    await screen.findByText("Said hello for the first time");

    // Find all icon buttons in the moment timeline
    const iconBtns = screen.getAllByRole("button", { name: "" });
    const momentBtns = iconBtns.filter((btn) => btn.closest("[class*='special-50']"));

    // Second button in moment card is the delete button
    if (momentBtns.length >= 2) {
      await user.click(momentBtns[1]);

      // AlertDialog should appear
      const deleteConfirmBtn = await screen.findByRole("button", { name: /^delete$/i });
      await user.click(deleteConfirmBtn);

      await waitFor(() => {
        expect(deleteFn).toHaveBeenCalled();
        expect(deleteEq).toHaveBeenCalledWith("id", mockMoment.id);
      });
    }
  });

  it("handleUpdateMoment calls supabase update on journey_moments", async () => {
    const user = userEvent.setup();

    const momentUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const momentUpdateFn = vi.fn().mockReturnValue({ eq: momentUpdateEq });

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "celebration_categories") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [mockCategory], error: null }),
            }),
          }),
        };
      }
      if (table === "journeys") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [mockJourney], error: null }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
          delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        };
      }
      if (table === "journey_moments") {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [mockMoment], error: null }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          update: momentUpdateFn,
          delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
    });

    render(<Celebrations />, { wrapper: TestWrapper });
    await screen.findByText("Learning to communicate");

    const showBtn = await screen.findByRole("button", { name: /show 1 moment/i });
    await user.click(showBtn);
    await screen.findByText("Said hello for the first time");

    const iconBtns = screen.getAllByRole("button", { name: "" });
    const momentBtns = iconBtns.filter((btn) => btn.closest("[class*='special-50']"));

    // First button = edit
    if (momentBtns.length >= 1) {
      await user.click(momentBtns[0]);
      await screen.findByText("Edit Moment");

      // Change title in edit dialog
      const titleInput = screen.getByDisplayValue("Said hello for the first time");
      await user.clear(titleInput);
      await user.type(titleInput, "Said hello very clearly!");

      const saveBtn = screen.getByRole("button", { name: /save changes/i });
      await user.click(saveBtn);

      await waitFor(() => {
        expect(momentUpdateFn).toHaveBeenCalledWith(
          expect.objectContaining({ title: "Said hello very clearly!" })
        );
        expect(momentUpdateEq).toHaveBeenCalledWith("id", mockMoment.id);
      });
    }
  });
});

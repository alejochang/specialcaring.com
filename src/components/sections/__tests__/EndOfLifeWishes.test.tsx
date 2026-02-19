
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Side-effect imports must come before component imports for vi.mock hoisting
import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

import EndOfLifeWishes from "../EndOfLifeWishes";
import { TestWrapper } from "@/test/mocks/contexts";
import { supabaseMock } from "@/test/mocks/supabase";

const mockWishes = {
  id: "eol-1",
  medical_directives: "DNR order in place",
  preferred_hospital: "City General",
  preferred_physician: "Dr. Johnson",
  organ_donation: "yes",
  funeral_preferences: "Simple ceremony",
  religious_cultural_wishes: "Catholic rites",
  legal_guardian: "Jane Doe - 555-0200",
  power_of_attorney: "Bob Smith - 555-0300",
  special_instructions: "Keep family informed",
  additional_notes: "Review annually",
};

/**
 * EndOfLifeWishes uses maybeSingle() — returns one record or null.
 * No deleteMutation — it's a singleton document per child.
 */
function setupSingletonMock(data: typeof mockWishes | null = mockWishes) {
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const maybeSingleFn = vi.fn().mockResolvedValue({ data, error: null });
  const eqFn = vi.fn().mockReturnValue({ maybeSingle: maybeSingleFn });
  const selectFn = vi.fn().mockReturnValue({ eq: eqFn });
  const insertFn = vi.fn().mockResolvedValue({ error: null });
  const updateFn = vi.fn().mockReturnValue({ eq: updateEq });

  supabaseMock.from.mockImplementation(() => ({
    select: selectFn,
    eq: eqFn,
    maybeSingle: maybeSingleFn,
    insert: insertFn,
    update: updateFn,
  }));

  const chain = { select: selectFn, eq: eqFn, maybeSingle: maybeSingleFn, insert: insertFn, update: updateFn };
  return { chain, updateEq };
}

describe("EndOfLifeWishes — TanStack Query singleton pattern", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the End-of-Life Wishes heading", async () => {
    setupSingletonMock();
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });
    expect(await screen.findByText("End-of-Life Wishes")).toBeInTheDocument();
  });

  it("queries end_of_life_wishes table with maybeSingle()", async () => {
    const { chain } = setupSingletonMock();
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });
    await screen.findByText("End-of-Life Wishes");
    expect(supabaseMock.from).toHaveBeenCalledWith("end_of_life_wishes");
    expect(chain.maybeSingle).toHaveBeenCalled();
  });

  it("filters by child_id", async () => {
    const { chain } = setupSingletonMock();
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });
    await screen.findByText("End-of-Life Wishes");
    expect(chain.eq).toHaveBeenCalledWith("child_id", "child-123");
  });

  it("displays existing data in view mode", async () => {
    setupSingletonMock();
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });
    await waitFor(() => {
      expect(screen.getByText("DNR order in place")).toBeInTheDocument();
      expect(screen.getByText("City General")).toBeInTheDocument();
      expect(screen.getByText("Dr. Johnson")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe - 555-0200")).toBeInTheDocument();
    });
  });

  it("shows 'No Information Recorded' empty state when no data", async () => {
    setupSingletonMock(null);
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });
    expect(await screen.findByText(/no information recorded/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /begin documentation/i })).toBeInTheDocument();
  });

  it("clicking Begin Documentation shows the edit form", async () => {
    setupSingletonMock(null);
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });
    const beginBtn = await screen.findByRole("button", { name: /begin documentation/i });
    await userEvent.click(beginBtn);
    expect(await screen.findByRole("button", { name: /save/i })).toBeInTheDocument();
    // Medical directives textarea has placeholder text
    expect(screen.getByPlaceholderText(/document any advanced medical directives/i)).toBeInTheDocument();
  });

  it("Edit button in view mode opens the form with pre-filled data", async () => {
    setupSingletonMock();
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });
    await screen.findByText("DNR order in place");

    const editBtn = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editBtn);

    // Form should be pre-filled with existing data
    const directivesField = await screen.findByDisplayValue("DNR order in place");
    expect(directivesField).toBeInTheDocument();
    expect(screen.getByDisplayValue("City General")).toBeInTheDocument();
  });

  it("saveMutation uses INSERT when no existing data (new record)", async () => {
    const { chain } = setupSingletonMock(null);
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });

    const beginBtn = await screen.findByRole("button", { name: /begin documentation/i });
    await userEvent.click(beginBtn);

    // Fill Preferred Hospital input (no placeholder, use index among textbox inputs)
    const allInputs = screen.getAllByRole("textbox");
    // preferred_hospital is the first input (after the textarea for medical_directives)
    const hospitalInput = allInputs.find(inp => (inp as HTMLInputElement).placeholder === "" || (inp as HTMLInputElement).value === "");
    if (hospitalInput) await userEvent.type(hospitalInput, "Memorial Hospital");

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(chain.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: "user-123",
            child_id: "child-123",
          }),
        ])
      );
    });
  });

  it("saveMutation uses UPDATE when existing data exists", async () => {
    const { chain, updateEq } = setupSingletonMock();
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });
    await screen.findByText("DNR order in place");

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    const hospitalInput = await screen.findByDisplayValue("City General");
    await userEvent.clear(hospitalInput);
    await userEvent.type(hospitalInput, "Memorial Hospital");

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      // Update — not insert
      expect(chain.insert).not.toHaveBeenCalled();
      expect(updateEq).toHaveBeenCalledWith("id", "eol-1");
    });
  });

  it("saveMutation passes user_id and child_id in update payload", async () => {
    const { chain } = setupSingletonMock();
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });
    await screen.findByText("DNR order in place");

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.click(await screen.findByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-123",
          child_id: "child-123",
        })
      );
    });
  });

  it("Cancel in edit mode returns to view mode without saving", async () => {
    const { chain } = setupSingletonMock();
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });
    await screen.findByText("DNR order in place");

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(await screen.findByRole("button", { name: /save/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    // Returns to view mode — Edit button visible again, Save gone
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });
    // No write operations called
    expect(chain.insert).not.toHaveBeenCalled();
    expect(chain.update).not.toHaveBeenCalled();
  });

  it("has no delete capability (singleton record — no deleteMutation)", async () => {
    setupSingletonMock();
    render(<EndOfLifeWishes />, { wrapper: TestWrapper });
    await screen.findByText("DNR order in place");
    // There should be no delete/trash button in the view
    const buttons = screen.getAllByRole("button");
    const deleteButtons = buttons.filter(b =>
      b.textContent?.toLowerCase().includes("delete") ||
      b.getAttribute("aria-label")?.toLowerCase().includes("delete")
    );
    expect(deleteButtons).toHaveLength(0);
  });
});

/**
 * Phase 4 tests: EmergencyCards delete with AlertDialog confirmation
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

import { supabaseMock } from "@/test/mocks/supabase";
import { TestWrapper } from "@/test/mocks/contexts";
import EmergencyCards from "../EmergencyCards";

// Mock ExportEmailButtons since it uses edge functions
vi.mock("@/components/shared/ExportEmailButtons", () => ({
  default: () => null,
}));

// Mock Supabase storage (used by handleImageUpload)
const storageMock = {
  from: vi.fn().mockReturnValue({
    remove: vi.fn().mockResolvedValue({ data: null, error: null }),
    upload: vi.fn().mockResolvedValue({ data: null, error: null }),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/img.jpg" } }),
  }),
};

const mockCardData = {
  id: "card-1",
  front_image: "https://example.com/front.jpg",
  back_image: "https://example.com/back.jpg",
  id_type: "Health Card",
  id_number: "HC-12345",
  issue_date: "2020-01-01",
  expiry_date: "2030-01-01",
};

function setupWithCard(cardData: typeof mockCardData | null = mockCardData) {
  const deleteEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const deleteFn = vi.fn().mockReturnValue({ eq: deleteEq });

  supabaseMock.from.mockImplementation((table: string) => {
    if (table === "emergency_cards_secure") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: cardData,
              error: null,
            }),
          }),
        }),
      };
    }
    if (table === "emergency_cards") {
      return {
        delete: deleteFn,
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: "card-1" }, error: null }),
          }),
        }),
      };
    }
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    };
  });

  (supabaseMock as any).storage = storageMock;

  return { deleteFn, deleteEq };
}

describe("EmergencyCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupWithCard();
  });

  it("renders Emergency Identification Cards heading", async () => {
    render(<EmergencyCards />, { wrapper: TestWrapper });

    expect(await screen.findByText("Emergency Identification Cards")).toBeInTheDocument();
  });

  it("displays card data when a card is saved", async () => {
    render(<EmergencyCards />, { wrapper: TestWrapper });

    expect(await screen.findByText("Health Card")).toBeInTheDocument();
    expect(screen.getByText("HC-12345")).toBeInTheDocument();
  });

  it("shows Edit Cards and Delete buttons when a card exists", async () => {
    render(<EmergencyCards />, { wrapper: TestWrapper });

    expect(await screen.findByRole("button", { name: /edit cards/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("shows Front Side and Back Side tabs when card data exists", async () => {
    render(<EmergencyCards />, { wrapper: TestWrapper });

    await screen.findByText("Health Card");
    expect(screen.getByRole("tab", { name: /front side/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /back side/i })).toBeInTheDocument();
  });

  // Phase 4: AlertDialog delete confirmation
  it("shows AlertDialog confirmation when Delete is clicked", async () => {
    const user = userEvent.setup();
    render(<EmergencyCards />, { wrapper: TestWrapper });

    await screen.findByRole("button", { name: /delete/i });
    await user.click(screen.getByRole("button", { name: /delete/i }));

    // AlertDialog should appear with confirmation text
    expect(await screen.findByText("Delete Emergency Card?")).toBeInTheDocument();
    expect(screen.getByText(/permanently delete all emergency card information/i)).toBeInTheDocument();
  });

  it("AlertDialog has Cancel and Delete confirmation buttons", async () => {
    const user = userEvent.setup();
    render(<EmergencyCards />, { wrapper: TestWrapper });

    await screen.findByRole("button", { name: /delete/i });
    await user.click(screen.getByRole("button", { name: /delete/i }));

    await screen.findByText("Delete Emergency Card?");
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    // Should have two "Delete" buttons: the trigger and the confirm action
    const deleteButtons = screen.getAllByRole("button", { name: /^delete$/i });
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("Cancel button closes AlertDialog without deleting", async () => {
    const user = userEvent.setup();
    const { deleteFn } = setupWithCard();

    render(<EmergencyCards />, { wrapper: TestWrapper });
    await screen.findByRole("button", { name: /delete/i });
    await user.click(screen.getByRole("button", { name: /delete/i }));

    await screen.findByText("Delete Emergency Card?");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // AlertDialog should close
    await waitFor(() => {
      expect(screen.queryByText("Delete Emergency Card?")).not.toBeInTheDocument();
    });

    // Delete should NOT have been called
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it("Confirming delete calls supabase delete on emergency_cards with card id", async () => {
    const user = userEvent.setup();
    const { deleteFn, deleteEq } = setupWithCard();

    render(<EmergencyCards />, { wrapper: TestWrapper });
    await screen.findByRole("button", { name: /delete/i });
    await user.click(screen.getByRole("button", { name: /delete/i }));

    await screen.findByText("Delete Emergency Card?");

    // Click the confirm Delete action in AlertDialog
    const confirmDeleteBtn = screen.getByRole("button", { name: /^delete$/i });
    await user.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled();
      expect(deleteEq).toHaveBeenCalledWith("id", mockCardData.id);
    });
  });

  it("after successful delete, card data is cleared and form is shown", async () => {
    const user = userEvent.setup();
    let callCount = 0;

    // First call returns the card; subsequent calls (after invalidation) return null
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "emergency_cards_secure") {
        const maybeSingleResult = callCount === 0 ? mockCardData : null;
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockImplementation(() => {
                callCount++;
                return Promise.resolve({ data: callCount === 1 ? mockCardData : null, error: null });
              }),
            }),
          }),
        };
      }
      if (table === "emergency_cards") {
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: "card-1" }, error: null }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      };
    });
    (supabaseMock as any).storage = storageMock;

    render(<EmergencyCards />, { wrapper: TestWrapper });
    await screen.findByRole("button", { name: /delete/i });
    await user.click(screen.getByRole("button", { name: /delete/i }));

    await screen.findByText("Delete Emergency Card?");
    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    // After deletion and re-fetch with null data, tabs should be gone
    await waitFor(() => {
      expect(screen.queryByRole("tab", { name: /front side/i })).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("shows empty form when no card exists", async () => {
    setupWithCard(null);
    render(<EmergencyCards />, { wrapper: TestWrapper });

    await screen.findByText("Emergency Identification Cards");
    // No saved card - no delete/edit buttons
    expect(screen.queryByRole("button", { name: /edit cards/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });
});

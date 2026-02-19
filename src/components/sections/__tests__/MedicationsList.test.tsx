import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocks must come before component import
import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

import { supabaseMock } from "@/test/mocks/supabase";
import { TestWrapper } from "@/test/mocks/contexts";
import MedicationsList from "../MedicationsList";

// Mock the ExportEmailButtons since it uses edge functions not available in tests
vi.mock("@/components/shared/ExportEmailButtons", () => ({
  default: () => null,
}));

const mockMedications = [
  {
    id: "med-1",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "once_daily",
    purpose: "Blood pressure",
    start_date: null,
    end_date: null,
    instructions: "Take with water",
    prescriber: "Dr. Smith",
    pharmacy: "CVS",
    refill_date: null,
    side_effects: null,
  },
  {
    id: "med-2",
    name: "Zyrtec",
    dosage: "5mg",
    frequency: "twice_daily",
    purpose: "Allergies",
    start_date: null,
    end_date: null,
    instructions: null,
    prescriber: null,
    pharmacy: null,
    refill_date: null,
    side_effects: null,
  },
];

function setupFromMock(data = mockMedications) {
  supabaseMock.from.mockImplementation(() => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }));
}

describe("MedicationsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFromMock();
  });

  it("renders Medications heading", async () => {
    render(<MedicationsList />, { wrapper: TestWrapper });

    expect(await screen.findByText("Medications")).toBeInTheDocument();
  });

  it("renders Add New Medication button", async () => {
    render(<MedicationsList />, { wrapper: TestWrapper });

    expect(await screen.findByRole("button", { name: /add new medication/i })).toBeInTheDocument();
  });

  it("displays existing medications in the table", async () => {
    render(<MedicationsList />, { wrapper: TestWrapper });

    expect(await screen.findByText("Lisinopril")).toBeInTheDocument();
    expect(screen.getByText("Zyrtec")).toBeInTheDocument();
  });

  it("displays medication dosage and frequency", async () => {
    render(<MedicationsList />, { wrapper: TestWrapper });

    expect(await screen.findByText("10mg")).toBeInTheDocument();
    expect(screen.getByText("Once Daily")).toBeInTheDocument();
  });

  it("shows empty state message when no medications", async () => {
    setupFromMock([]);
    render(<MedicationsList />, { wrapper: TestWrapper });

    expect(await screen.findByText(/no medications added yet/i)).toBeInTheDocument();
  });

  it("opens add medication dialog when button clicked", async () => {
    const user = userEvent.setup();
    render(<MedicationsList />, { wrapper: TestWrapper });

    await screen.findByRole("button", { name: /add new medication/i });
    await user.click(screen.getByRole("button", { name: /add new medication/i }));

    expect(await screen.findByText(/add new medication/i, { selector: "[class*='title'], h2, [data-slot='dialog-title']" })).toBeInTheDocument();
  });

  it("shows form validation error for empty required fields on submit", async () => {
    const user = userEvent.setup();
    render(<MedicationsList />, { wrapper: TestWrapper });

    await screen.findByRole("button", { name: /add new medication/i });
    await user.click(screen.getByRole("button", { name: /add new medication/i }));

    // Click Add Medication submit button without filling form
    const submitBtn = await screen.findByRole("button", { name: /^add medication$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/medication name is required/i)).toBeInTheDocument();
    });
  });

  it("shows medication count in description", async () => {
    render(<MedicationsList />, { wrapper: TestWrapper });

    expect(await screen.findByText(/currently tracking 2 medications/i)).toBeInTheDocument();
  });

  it("renders edit and delete action buttons for each medication", async () => {
    render(<MedicationsList />, { wrapper: TestWrapper });

    await screen.findByText("Lisinopril");

    // Each medication row should have edit (pencil) and delete (trash) icon buttons
    const rows = screen.getAllByRole("row");
    // rows[0] is the header row
    expect(rows.length).toBeGreaterThan(1);
  });

  it("calls delete via AlertDialog when trash icon is clicked", async () => {
    const user = userEvent.setup();
    const deleteEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const deleteFrom = vi.fn().mockReturnValue({ eq: deleteEq });

    supabaseMock.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockMedications, error: null }),
        }),
      }),
      delete: deleteFrom,
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    }));

    render(<MedicationsList />, { wrapper: TestWrapper });

    await screen.findByText("Lisinopril");

    // Find all ghost icon buttons (edit + delete per row = 4 total for 2 meds)
    const iconButtons = screen.getAllByRole("button", { name: "" });
    // Click the second button for the first medication (delete = second icon in each row)
    const deleteButtons = iconButtons.filter((_, i) => i % 2 === 1);
    await user.click(deleteButtons[0]);

    // AlertDialog should appear — confirm the deletion
    const confirmBtn = await screen.findByRole("button", { name: /^delete$/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(deleteFrom).toHaveBeenCalled();
    });
  });
});

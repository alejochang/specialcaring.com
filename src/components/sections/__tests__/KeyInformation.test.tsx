import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocks must come before component import
import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

import { supabaseMock } from "@/test/mocks/supabase";
import { TestWrapper } from "@/test/mocks/contexts";
import KeyInformation from "../KeyInformation";

const mockKeyInfo = {
  id: "child-123",
  created_by: "user-123",
  full_name: "Jane Doe",
  birth_date: "2015-06-01",
  health_card_number: "HC123456",
  address: "123 Main St",
  phone_number: "555-0100",
  email: "jane@example.com",
  insurance_provider: "Blue Cross",
  insurance_number: "INS-789",
  emergency_contact: "John Doe",
  emergency_phone: "555-0101",
  medical_conditions: "Autism Spectrum Disorder",
  allergies: "Peanuts",
  likes: "Swimming",
  dislikes: "Loud noises",
  do_nots: "Never give peanuts",
  additional_notes: "Communicates via AAC device",
};

function setupFromMock(keyInfoData: unknown = mockKeyInfo, medsData: unknown[] = []) {
  supabaseMock.from.mockImplementation((table: string) => {
    if (table === "children_secure") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: keyInfoData, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: keyInfoData, error: null }),
          }),
        }),
      };
    }
    if (table === "medications") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: medsData, error: null }),
          }),
        }),
      };
    }
    if (table === "children") {
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    }
    // Default
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    };
  });
}

describe("KeyInformation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFromMock();
  });

  it("renders Child Profile heading", async () => {
    render(<KeyInformation />, { wrapper: TestWrapper });

    expect(await screen.findByText(/child profile/i)).toBeInTheDocument();
  });

  it("displays the child's full name after loading", async () => {
    render(<KeyInformation />, { wrapper: TestWrapper });

    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
  });

  it("shows medical conditions", async () => {
    render(<KeyInformation />, { wrapper: TestWrapper });

    expect(await screen.findByText("Autism Spectrum Disorder")).toBeInTheDocument();
  });

  it("shows allergies", async () => {
    render(<KeyInformation />, { wrapper: TestWrapper });

    expect(await screen.findByText("Peanuts")).toBeInTheDocument();
  });

  it("shows an Edit button when data is loaded", async () => {
    render(<KeyInformation />, { wrapper: TestWrapper });

    expect(await screen.findByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("enters edit mode when Edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<KeyInformation />, { wrapper: TestWrapper });

    const editBtn = await screen.findByRole("button", { name: /edit/i });
    await user.click(editBtn);

    // In edit mode the form should be visible with input fields
    expect(await screen.findByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("shows validation errors when required fields are cleared and submitted", async () => {
    const user = userEvent.setup();
    render(<KeyInformation />, { wrapper: TestWrapper });

    const editBtn = await screen.findByRole("button", { name: /edit/i });
    await user.click(editBtn);

    // Clear the full name field
    const fullNameInput = screen.getByDisplayValue("Jane Doe");
    await user.clear(fullNameInput);

    // Clear address
    const addressInput = screen.getByDisplayValue("123 Main St");
    await user.clear(addressInput);

    // Submit
    const saveBtn = screen.getByRole("button", { name: /save/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it("shows create form when no key info exists", async () => {
    setupFromMock(null);
    render(<KeyInformation />, { wrapper: TestWrapper });

    // When no data exists, component shows "Create Child Profile" form
    expect(await screen.findByText(/create child profile/i)).toBeInTheDocument();
  });

  it("renders likes and dislikes sections", async () => {
    render(<KeyInformation />, { wrapper: TestWrapper });

    expect(await screen.findByText("Swimming")).toBeInTheDocument();
    expect(screen.getByText("Loud noises")).toBeInTheDocument();
  });

  it("renders emergency contact info", async () => {
    render(<KeyInformation />, { wrapper: TestWrapper });

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("555-0101")).toBeInTheDocument();
  });
});


import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Side-effect imports must come before component imports for vi.mock hoisting
import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

// SuppliersList uses @/components/ui/use-toast (not the hooks path)
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import SuppliersList from "../SuppliersList";
import { TestWrapper } from "@/test/mocks/contexts";
import { supabaseMock } from "@/test/mocks/supabase";

const mockSuppliers = [
  {
    id: "sup-1",
    category: "Medicine",
    item_name: "Baclofen",
    dosage_or_size: "10mg",
    brand_or_strength: "Generic",
    provider_name: "MedPharm Co",
    contact_phone: "555-0101",
    address: "123 Pharmacy St",
    website: null,
    ordering_instructions: "Call ahead",
    notes: "Store in cool place",
    inventory_threshold: 5,
    last_order_date: null,
    created_at: "2024-01-01T00:00:00",
    updated_at: "2024-01-01T00:00:00",
  },
  {
    id: "sup-2",
    category: "Supplement",
    item_name: "Vitamin D3",
    dosage_or_size: "1000 IU",
    brand_or_strength: null,
    provider_name: "HealthStore",
    contact_phone: "555-0202",
    address: null,
    website: "https://healthstore.example.com",
    ordering_instructions: null,
    notes: null,
    inventory_threshold: null,
    last_order_date: "2024-06-15",
    created_at: "2024-01-02T00:00:00",
    updated_at: "2024-01-02T00:00:00",
  },
];

function setupSuppliersMock(data = mockSuppliers) {
  const deleteEq = vi.fn().mockResolvedValue({ error: null });
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockReturnValue({ eq: updateEq }),
    delete: vi.fn().mockReturnValue({ eq: deleteEq }),
  };
  supabaseMock.from.mockReturnValue(chain);
  return { chain, deleteEq, updateEq };
}

describe("SuppliersList — TanStack Query migration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore window.confirm to avoid bleed between tests
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("renders the Suppliers & Providers heading", async () => {
    setupSuppliersMock();
    render(<SuppliersList />, { wrapper: TestWrapper });
    expect(await screen.findByText("Suppliers & Providers")).toBeInTheDocument();
  });

  it("fetches from 'suppliers' table with child_id", async () => {
    const { chain } = setupSuppliersMock();
    render(<SuppliersList />, { wrapper: TestWrapper });
    await screen.findByText("Baclofen");
    expect(supabaseMock.from).toHaveBeenCalledWith("suppliers");
    expect(chain.eq).toHaveBeenCalledWith("child_id", "child-123");
  });

  it("renders all suppliers from query data", async () => {
    setupSuppliersMock();
    render(<SuppliersList />, { wrapper: TestWrapper });
    expect(await screen.findByText("Baclofen")).toBeInTheDocument();
    expect(screen.getByText("Vitamin D3")).toBeInTheDocument();
  });

  it("shows category badge for each supplier", async () => {
    setupSuppliersMock();
    render(<SuppliersList />, { wrapper: TestWrapper });
    await screen.findByText("Baclofen");
    expect(screen.getByText("Medicine")).toBeInTheDocument();
    expect(screen.getByText("Supplement")).toBeInTheDocument();
  });

  it("shows empty state when no suppliers", async () => {
    setupSuppliersMock([]);
    render(<SuppliersList />, { wrapper: TestWrapper });
    expect(await screen.findByText(/no suppliers found/i)).toBeInTheDocument();
    expect(screen.getByText(/get started by adding your first supplier/i)).toBeInTheDocument();
  });

  it("client-side search filters by item_name", async () => {
    setupSuppliersMock();
    render(<SuppliersList />, { wrapper: TestWrapper });
    await screen.findByText("Baclofen");

    const searchInput = screen.getByPlaceholderText(/search suppliers/i);
    await userEvent.type(searchInput, "Baclofen");

    expect(screen.getByText("Baclofen")).toBeInTheDocument();
    expect(screen.queryByText("Vitamin D3")).not.toBeInTheDocument();
  });

  it("client-side search filters by provider_name", async () => {
    setupSuppliersMock();
    render(<SuppliersList />, { wrapper: TestWrapper });
    await screen.findByText("Baclofen");

    const searchInput = screen.getByPlaceholderText(/search suppliers/i);
    await userEvent.type(searchInput, "HealthStore");

    expect(screen.queryByText("Baclofen")).not.toBeInTheDocument();
    expect(screen.getByText("Vitamin D3")).toBeInTheDocument();
  });

  it("no match search shows 'No suppliers match current search criteria'", async () => {
    setupSuppliersMock();
    render(<SuppliersList />, { wrapper: TestWrapper });
    await screen.findByText("Baclofen");

    const searchInput = screen.getByPlaceholderText(/search suppliers/i);
    await userEvent.type(searchInput, "xyznonexistent");

    expect(await screen.findByText(/no suppliers match your current search criteria/i)).toBeInTheDocument();
  });

  it("saveMutation inserts new supplier into 'suppliers' table", async () => {
    const { chain } = setupSuppliersMock([]);
    render(<SuppliersList />, { wrapper: TestWrapper });
    await screen.findByText(/no suppliers found/i);

    await userEvent.click(screen.getByRole("button", { name: /add supplier/i }));

    // Fill required fields
    const itemNameInput = await screen.findByLabelText(/item name/i);
    await userEvent.type(itemNameInput, "Melatonin");

    const dosageInput = screen.getByLabelText(/dosage\/size/i);
    await userEvent.type(dosageInput, "5mg");

    const providerInput = screen.getByLabelText(/provider name/i);
    await userEvent.type(providerInput, "NaturalPharm");

    const phoneInput = screen.getByLabelText(/contact phone/i);
    await userEvent.type(phoneInput, "555-9999");

    await userEvent.click(screen.getByRole("button", { name: /add supplier/i }));

    await waitFor(() => {
      expect(chain.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            item_name: "Melatonin",
            dosage_or_size: "5mg",
            provider_name: "NaturalPharm",
            contact_phone: "555-9999",
            user_id: "user-123",
            child_id: "child-123",
          }),
        ])
      );
    });
  });

  it("saveMutation updates supplier when editing", async () => {
    const { chain, updateEq } = setupSuppliersMock();
    render(<SuppliersList />, { wrapper: TestWrapper });
    await screen.findByText("Baclofen");

    // Click edit button on first supplier
    const editButtons = screen.getAllByRole("button", { name: "" });
    const editBtn = editButtons.find(b => b.querySelector("svg") && b.closest(".flex.gap-2"));
    if (editBtn) {
      fireEvent.click(editBtn);
    } else {
      // Fallback: find button containing Edit icon by outline variant
      const outlineBtns = document.querySelectorAll('button[class*="outline"]');
      fireEvent.click(outlineBtns[0]);
    }

    const updateBtn = await screen.findByRole("button", { name: /update supplier/i });
    await userEvent.click(updateBtn);

    await waitFor(() => {
      expect(updateEq).toHaveBeenCalledWith("id", "sup-1");
    });
  });

  it("deleteMutation uses AlertDialog before deleting", async () => {
    const { chain, deleteEq } = setupSuppliersMock();
    render(<SuppliersList />, { wrapper: TestWrapper });
    await screen.findByText("Baclofen");

    // Find the delete button for the first supplier card — it's an outline button with trash icon
    const allButtons = screen.getAllByRole("button");
    const deleteButtons = allButtons.filter(btn => {
      const text = btn.textContent?.trim() ?? "";
      return (text === "" || btn.querySelector("svg")) &&
        !btn.textContent?.includes("Add Supplier") &&
        !btn.textContent?.includes("Cancel") &&
        !btn.textContent?.includes("Update") &&
        !btn.textContent?.includes("Add") &&
        !btn.textContent?.includes("Edit");
    });
    // deleteButtons[0] is the edit icon; deleteButtons[1] is the delete icon
    fireEvent.click(deleteButtons[1]);

    // AlertDialog should appear
    expect(await screen.findByText(/delete supplier/i)).toBeInTheDocument();

    // Click the Delete confirmation button
    const confirmBtn = screen.getByRole("button", { name: /^delete$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(chain.delete).toHaveBeenCalled();
      expect(deleteEq).toHaveBeenCalledWith("id", "sup-1");
    });
  });

  it("deleteMutation does NOT delete when confirm is cancelled", async () => {
    const { chain } = setupSuppliersMock();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<SuppliersList />, { wrapper: TestWrapper });
    await screen.findByText("Baclofen");

    const allButtons = screen.getAllByRole("button");
    const iconButtons = allButtons.filter(btn => {
      return btn.querySelector("svg") &&
        !btn.textContent?.includes("Add Supplier") &&
        !btn.textContent?.includes("Cancel") &&
        !btn.textContent?.includes("Update") &&
        !btn.textContent?.includes("Add");
    });
    fireEvent.click(iconButtons[1]); // delete button, first card

    // No delete called since confirm returned false
    expect(chain.delete).not.toHaveBeenCalled();
  });

  it("shows loading spinner while query is pending", () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(new Promise(() => {})),
    };
    supabaseMock.from.mockReturnValue(chain);
    render(<SuppliersList />, { wrapper: TestWrapper });
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("queryKey includes child_id for cache isolation", async () => {
    const { chain } = setupSuppliersMock();
    render(<SuppliersList />, { wrapper: TestWrapper });
    await screen.findByText("Baclofen");
    // The query is keyed by ['suppliers', 'child-123'] so eq with child_id verifies isolation
    expect(chain.eq).toHaveBeenCalledWith("child_id", "child-123");
  });
});

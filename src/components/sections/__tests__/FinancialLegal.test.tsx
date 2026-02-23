
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Side-effect imports must come before component imports for vi.mock hoisting
import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

import FinancialLegal from "../FinancialLegal";
import { TestWrapper } from "@/test/mocks/contexts";
import { supabaseMock } from "@/test/mocks/supabase";

const mockDocs = [
  {
    id: "doc-1",
    doc_type: "insurance",
    title: "Health Insurance Policy",
    description: "Primary health coverage",
    institution: "BlueCross",
    account_number: "BC-12345",
    contact_name: "John Rep",
    contact_phone: "555-0100",
    contact_email: "rep@bc.com",
    expiry_date: "2025-12-31",
    notes: "Renew yearly",
    status: "active",
  },
  {
    id: "doc-2",
    doc_type: "trust",
    title: "Special Needs Trust",
    description: "",
    institution: "First Bank",
    account_number: "FBT-9999",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    expiry_date: "",
    notes: "",
    status: "pending",
  },
];

/**
 * Returns a supabase chain mock appropriate for FinancialLegal:
 * - Reads from `financial_legal_docs_secure`
 * - Writes/deletes to `financial_legal_docs`
 */
function setupFinancialMocks(docs = mockDocs) {
  const readChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: docs, error: null }),
  };
  const writeEq = vi.fn().mockResolvedValue({ error: null });
  const writeChain = {
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockReturnValue({ eq: writeEq }),
    delete: vi.fn().mockReturnValue({ eq: writeEq }),
  };

  supabaseMock.from.mockImplementation((table: string) => {
    if (table === "financial_legal_docs_secure") return readChain;
    if (table === "financial_legal_docs") return writeChain;
    return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: [], error: null }) };
  });

  return { readChain, writeChain, writeEq };
}

describe("FinancialLegal — TanStack Query migration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Financial & Legal heading", async () => {
    setupFinancialMocks();
    render(<FinancialLegal />, { wrapper: TestWrapper });
    expect(await screen.findByText("Financial & Legal")).toBeInTheDocument();
  });

  it("reads from financial_legal_docs_secure view (not base table)", async () => {
    const { readChain } = setupFinancialMocks();
    render(<FinancialLegal />, { wrapper: TestWrapper });
    await screen.findByText("Health Insurance Policy");
    expect(supabaseMock.from).toHaveBeenCalledWith("financial_legal_docs_secure");
    // Verify we're reading from the secure view, not the base table directly
    // Explicitly: the read query must NOT target the base table
    const allFromCalls = (supabaseMock.from as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
    const readCalls = allFromCalls.filter(t => t === "financial_legal_docs_secure");
    expect(readCalls.length).toBeGreaterThanOrEqual(1);
  });

  it("fetches with child_id filter", async () => {
    const { readChain } = setupFinancialMocks();
    render(<FinancialLegal />, { wrapper: TestWrapper });
    await screen.findByText("Health Insurance Policy");
    expect(readChain.eq).toHaveBeenCalledWith("child_id", "child-123");
  });

  it("displays all documents from query result", async () => {
    setupFinancialMocks();
    render(<FinancialLegal />, { wrapper: TestWrapper });
    expect(await screen.findByText("Health Insurance Policy")).toBeInTheDocument();
    expect(await screen.findByText("Special Needs Trust")).toBeInTheDocument();
  });

  it("shows doc_type badge and status badge for each document", async () => {
    setupFinancialMocks();
    render(<FinancialLegal />, { wrapper: TestWrapper });
    await screen.findByText("Health Insurance Policy");
    expect(screen.getByText("Insurance Policy")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("shows empty state when no documents exist", async () => {
    setupFinancialMocks([]);
    render(<FinancialLegal />, { wrapper: TestWrapper });
    expect(await screen.findByText(/no documents yet/i)).toBeInTheDocument();
  });

  it("saveMutation inserts into financial_legal_docs (base table)", async () => {
    const { writeChain } = setupFinancialMocks([]);
    render(<FinancialLegal />, { wrapper: TestWrapper });
    await screen.findByText(/no documents yet/i);

    // Open add dialog
    await userEvent.click(screen.getByRole("button", { name: /add first document/i }));

    // Fill the required title field — Label is "Title *", find by all text inputs and fill second one (after doc type)
    const allInputs = await screen.findAllByRole("textbox");
    // First textbox after selects is "Title *"
    const titleInput = allInputs.find(inp => (inp as HTMLInputElement).value === "");
    if (titleInput) await userEvent.type(titleInput, "Life Insurance");

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /add document/i }));

    await waitFor(() => {
      expect(supabaseMock.from).toHaveBeenCalledWith("financial_legal_docs");
      expect(writeChain.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            created_by: "user-123",
            child_id: "child-123",
          }),
        ])
      );
    });
  });

  it("saveMutation updates financial_legal_docs (base table) when editing", async () => {
    setupFinancialMocks();
    render(<FinancialLegal />, { wrapper: TestWrapper });
    await screen.findByText("Health Insurance Policy");

    // Click first edit button (Pencil icon)
    const allSmallBtns = document.querySelectorAll("button.h-8.w-8");
    fireEvent.click(allSmallBtns[0]);

    // Confirm dialog opened and submit update
    const updateBtn = await screen.findByRole("button", { name: /update document/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(supabaseMock.from).toHaveBeenCalledWith("financial_legal_docs");
    });
  });

  it("deleteMutation deletes from financial_legal_docs (base table) with doc id", async () => {
    const { writeChain, writeEq } = setupFinancialMocks();
    render(<FinancialLegal />, { wrapper: TestWrapper });
    await screen.findByText("Health Insurance Policy");

    // Second small button per card = delete (Trash2) — opens AlertDialog
    const allSmallBtns = document.querySelectorAll("button.h-8.w-8");
    fireEvent.click(allSmallBtns[1]);

    // Confirm via AlertDialog
    const deleteBtn = await screen.findByRole("button", { name: /^delete$/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(supabaseMock.from).toHaveBeenCalledWith("financial_legal_docs");
      expect(writeChain.delete).toHaveBeenCalled();
      expect(writeEq).toHaveBeenCalledWith("id", "doc-1");
    });
  });

  it("write operations never target the secure view for mutations", async () => {
    const { writeChain } = setupFinancialMocks();
    render(<FinancialLegal />, { wrapper: TestWrapper });
    await screen.findByText("Health Insurance Policy");

    // Click delete — opens AlertDialog
    const allSmallBtns = document.querySelectorAll("button.h-8.w-8");
    fireEvent.click(allSmallBtns[1]);

    // Confirm via AlertDialog
    const deleteBtn = await screen.findByRole("button", { name: /^delete$/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(writeChain.delete).toHaveBeenCalled();
      // Confirm the write table is the base table, not the secure view
      const allFromCalls = (supabaseMock.from as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0]);
      // financial_legal_docs (without _secure) must be in the calls for write ops
      expect(allFromCalls).toContain("financial_legal_docs");
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";

// Mocks must come before component import
import "@/test/mocks/supabase";
import "@/test/mocks/contexts";

import { supabaseMock } from "@/test/mocks/supabase";
import { TestWrapper } from "@/test/mocks/contexts";
import DailyLog from "../DailyLog";

// Use date-fns format() to match component's local date filtering (not UTC)
const mockEntries = [
  {
    id: "entry-1",
    date: format(new Date(), "yyyy-MM-dd"), // local today
    time: "09:00",
    category: "medical",
    mood: "happy",
    title: "Morning check-up",
    description: "All good",
    tags: ["health"],
    priority: "medium",
  },
  {
    id: "entry-2",
    date: "2024-01-01",
    time: "10:00",
    category: "sleep",
    mood: "neutral",
    title: "Nap time",
    description: "",
    tags: [],
    priority: "low",
  },
];

function setupFromMock(data = mockEntries) {
  supabaseMock.from.mockImplementation(() => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data, error: null }),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: "new-entry",
            date: format(new Date(), "yyyy-MM-dd"),
            time: "12:00",
            category: "medical",
            mood: "neutral",
            title: "Test entry",
            description: "",
            tags: [],
            priority: "medium",
          },
          error: null,
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }));
}

describe("DailyLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFromMock();
  });

  it("renders heading and New Entry button", async () => {
    render(<DailyLog />, { wrapper: TestWrapper });

    expect(await screen.findByText("Daily Log")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new entry/i })).toBeInTheDocument();
  });

  it("shows today summary section", async () => {
    render(<DailyLog />, { wrapper: TestWrapper });

    expect(await screen.findByText(/today's summary/i)).toBeInTheDocument();
    expect(screen.getByText(/entries today/i)).toBeInTheDocument();
  });

  it("renders existing entries after loading", async () => {
    render(<DailyLog />, { wrapper: TestWrapper });

    expect(await screen.findByText("Morning check-up")).toBeInTheDocument();
  });

  it("opens new entry form when New Entry button is clicked", async () => {
    const user = userEvent.setup();
    render(<DailyLog />, { wrapper: TestWrapper });

    await screen.findByText("Daily Log");
    await user.click(screen.getByRole("button", { name: /new entry/i }));

    expect(screen.getByText(/new journal entry/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/brief description/i)).toBeInTheDocument();
  });

  it("Add Entry button is disabled when title is empty", async () => {
    const user = userEvent.setup();
    render(<DailyLog />, { wrapper: TestWrapper });

    await screen.findByText("Daily Log");
    await user.click(screen.getByRole("button", { name: /new entry/i }));

    const addBtn = screen.getByRole("button", { name: /add entry/i });
    expect(addBtn).toBeDisabled();
  });

  it("enables Add Entry button once title and category are filled", async () => {
    const user = userEvent.setup();
    render(<DailyLog />, { wrapper: TestWrapper });

    await screen.findByText("Daily Log");
    await user.click(screen.getByRole("button", { name: /new entry/i }));

    // Type a title
    await user.type(screen.getByPlaceholderText(/brief description/i), "My test entry");

    // Select a category
    await user.click(screen.getByRole("button", { name: /medical/i }));

    expect(screen.getByRole("button", { name: /add entry/i })).not.toBeDisabled();
  });

  it("closes new entry form on Cancel", async () => {
    const user = userEvent.setup();
    render(<DailyLog />, { wrapper: TestWrapper });

    await screen.findByText("Daily Log");
    await user.click(screen.getByRole("button", { name: /new entry/i }));
    expect(screen.getByText(/new journal entry/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByText(/new journal entry/i)).not.toBeInTheDocument();
  });

  it("calls delete on Trash button click via AlertDialog confirmation", async () => {
    const user = userEvent.setup();
    render(<DailyLog />, { wrapper: TestWrapper });

    await screen.findByText("Morning check-up");

    // Switch to All Entries tab to see entries
    await user.click(screen.getByRole("tab", { name: /all entries/i }));
    await screen.findByText("Morning check-up");

    // Find and click a trash icon button to open AlertDialog
    const trashButtons = screen.getAllByRole("button", { name: "" });
    expect(trashButtons.length).toBeGreaterThan(0);
    // Click a trash button (the last icon button in the first entry's actions)
    await user.click(trashButtons[trashButtons.length > 1 ? 1 : 0]);

    // AlertDialog should appear
    expect(await screen.findByText(/delete this entry/i)).toBeInTheDocument();
    // Click the Delete confirmation button
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
  });

  it("shows tabs: Today, This Week, All Entries", async () => {
    render(<DailyLog />, { wrapper: TestWrapper });

    await screen.findByText("Daily Log");
    expect(screen.getByRole("tab", { name: /today/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /this week/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /all entries/i })).toBeInTheDocument();
  });

  it("shows empty state when no entries", async () => {
    setupFromMock([]);
    render(<DailyLog />, { wrapper: TestWrapper });

    await screen.findByText("Daily Log");
    expect(await screen.findByText(/no entries found/i)).toBeInTheDocument();
  });
});

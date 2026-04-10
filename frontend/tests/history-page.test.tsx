import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Cookies from "js-cookie";
import HistoryPage from "@/app/history/page";

vi.mock("@/components/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(() => ({
    logout: vi.fn(),
  })),
}));

vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("history page", () => {
  function isoDaysAgo(daysAgo: number) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(Cookies.get).mockReturnValue("test-token");
  });

  it("shows the history workspace and filter controls", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    vi.stubGlobal("fetch", mockFetch);

    render(<HistoryPage />);

    expect(screen.getByText(/past logging history/i)).toBeInTheDocument();
    expect(await screen.findByText(/^history view$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /last 7 days/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /📅 pick date/i })).toBeInTheDocument();
    expect(screen.getByText(/^timeline$/i)).toBeInTheDocument();
  });

  it("loads real history data and filters by tab and picked date", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            meal_type: "Dinner",
            foods_text: "Rice",
            notes: "Evening meal",
            meal_time: "19:00:00",
            glycaemic_band: "high",
            metabolic_summary: "High glycaemic impact",
            created_at: isoDaysAgo(3),
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            fatigue: false,
            cravings: true,
            bloating: true,
            mood_change: false,
            notes: "Severity: Low\nNotes: mild bloating",
            symptom_time: "21:00:00",
            created_at: isoDaysAgo(3),
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            sleep_hours: 7,
            exercise_minutes: 30,
            water_litres: 2,
            stress_level: "Low",
            mood: "Neutral",
            activity_notes: "Walked after work",
            lifestyle_time: "18:00:00",
            created_at: isoDaysAgo(0),
          },
        ],
      });

    vi.stubGlobal("fetch", mockFetch);

    render(<HistoryPage />);

    expect(await screen.findByText(/^3 days ago$/i)).toBeInTheDocument();
    expect(screen.getByText(/^rice$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /symptoms/i }));
    expect(await screen.findByText(/cravings, bloating/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /lifestyle/i }));
    expect(await screen.findByText(/mood: neutral/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /📅 pick date/i }));
    fireEvent.change(screen.getByLabelText(/select exact date/i), {
      target: { value: new Date(isoDaysAgo(3)).toISOString().slice(0, 10) },
    });

    fireEvent.click(screen.getByRole("button", { name: /meals/i }));
    expect(await screen.findByText(/^rice$/i)).toBeInTheDocument();
    expect(screen.queryByText(/mood: neutral/i)).not.toBeInTheDocument();
  });
});

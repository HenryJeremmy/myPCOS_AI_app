import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Cookies from "js-cookie";
import InsightsPage from "@/app/insights/page";

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

describe("insights page", () => {
  function isoDaysAgo(daysAgo: number) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(Cookies.get).mockReturnValue("test-token");
  });

  it("shows the structured insights workspace", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    vi.stubGlobal("fetch", mockFetch);

    render(<InsightsPage />);

    expect(screen.getByText(/behaviour–symptom pattern review/i)).toBeInTheDocument();
    expect(await screen.findByText(/^pattern table$/i)).toBeInTheDocument();
    expect(screen.getByText(/^insight statement$/i)).toBeInTheDocument();
    expect(screen.getByText(/^confidence$/i)).toBeInTheDocument();
    expect(screen.getByText(/^non-diagnostic guidance$/i)).toBeInTheDocument();

    const emptyStateMessages = await screen.findAllByText(
      /more meal, symptom, and lifestyle entries are needed/i,
    );
    expect(emptyStateMessages.length).toBeGreaterThan(0);
  });

  it("loads repeated same-day insight data and shows pattern rows", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            meal_type: "Dinner",
            foods_text: "Rice",
            notes: null,
            meal_time: "09:00:00",
            glycaemic_band: "moderate",
            metabolic_summary: "Moderate glycaemic impact.",
            created_at: isoDaysAgo(0),
          },
          {
            id: 2,
            meal_type: "Dinner",
            foods_text: "Rice",
            notes: null,
            meal_time: "09:00:00",
            glycaemic_band: "moderate",
            metabolic_summary: "Moderate glycaemic impact.",
            created_at: isoDaysAgo(1),
          },
          {
            id: 3,
            meal_type: "Dinner",
            foods_text: "Rice",
            notes: null,
            meal_time: "09:00:00",
            glycaemic_band: "moderate",
            metabolic_summary: "Moderate glycaemic impact.",
            created_at: isoDaysAgo(2),
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            cravings: true,
            fatigue: false,
            bloating: false,
            mood_change: false,
            notes: null,
            symptom_time: "14:00:00",
            created_at: isoDaysAgo(0),
          },
          {
            id: 2,
            cravings: true,
            fatigue: false,
            bloating: false,
            mood_change: false,
            notes: null,
            symptom_time: "14:00:00",
            created_at: isoDaysAgo(1),
          },
          {
            id: 3,
            cravings: true,
            fatigue: false,
            bloating: false,
            mood_change: false,
            notes: null,
            symptom_time: "14:00:00",
            created_at: isoDaysAgo(2),
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            sleep_hours: 5.5,
            exercise_minutes: 20,
            water_litres: 2,
            stress_level: "High",
            mood: "Good",
            activity_notes: null,
            lifestyle_time: "08:00:00",
            created_at: isoDaysAgo(0),
          },
          {
            id: 2,
            sleep_hours: 5.5,
            exercise_minutes: 20,
            water_litres: 2,
            stress_level: "High",
            mood: "Good",
            activity_notes: null,
            lifestyle_time: "08:00:00",
            created_at: isoDaysAgo(1),
          },
          {
            id: 3,
            sleep_hours: 5.5,
            exercise_minutes: 20,
            water_litres: 2,
            stress_level: "Low",
            mood: "Good",
            activity_notes: null,
            lifestyle_time: "08:00:00",
            created_at: isoDaysAgo(2),
          },
        ],
      });

    vi.stubGlobal("fetch", mockFetch);

    render(<InsightsPage />);

    expect(
      (await screen.findAllByText(/associated symptom: cravings/i)).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/^moderate glycaemic meals$/i)).toBeInTheDocument();
    expect(screen.getByText(/^sleep under 6 hours$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^3× this week$/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/cravings appeared within 12 hours of moderate glycaemic meals/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/last 7 days/i).length).toBeGreaterThan(0);
  });
});

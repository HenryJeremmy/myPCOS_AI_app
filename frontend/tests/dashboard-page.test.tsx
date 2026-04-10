import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Cookies from "js-cookie";

vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@/components/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/lib/auth";
import DashboardPage from "@/app/dashboard/page";

function mockDashboardFetch({
  meals = [],
  symptoms = [],
  lifestyle = [],
}: {
  meals?: any[];
  symptoms?: any[];
  lifestyle?: any[];
} = {}) {
  const mockFetch = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => meals,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => symptoms,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => lifestyle,
    });

  vi.stubGlobal("fetch", mockFetch);
  return mockFetch;
}

function mockAuthenticatedUser() {
  vi.mocked(useAuth).mockReturnValue({
    user: {
      id: 1,
      email: "user@example.com",
      first_name: "Henry",
      is_active: true,
      is_verified: true,
    },
    isLoading: false,
    login: vi.fn(),
    signup: vi.fn(),
    verifyEmail: vi.fn(),
    resendOTP: vi.fn(),
    logout: vi.fn(),
  });

  vi.mocked(Cookies.get).mockReturnValue("test-token");
}

describe("dashboard page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the overview dashboard with greeting and navigation", async () => {
    mockDashboardFetch();
    mockAuthenticatedUser();

    render(<DashboardPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    expect(
      screen.getByText(/good (morning|afternoon|evening), henry/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.getByText("Meals")).toBeInTheDocument();
    expect(screen.getByText("Symptoms")).toBeInTheDocument();
    expect(screen.getByText("Lifestyle")).toBeInTheDocument();
    expect(screen.getAllByText("Insights").length).toBeGreaterThan(0);
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("shows weekly summary cards, chart, and consistency", async () => {
    mockDashboardFetch({
      meals: [
        {
          id: 11,
          meal_type: "Breakfast",
          foods_text: "Oats and banana",
          notes: "",
          meal_time: "08:00",
          glycaemic_band: "low",
          metabolic_summary: "",
          created_at: new Date().toISOString(),
        },
      ],
      symptoms: [
        {
          id: 21,
          fatigue: false,
          cravings: true,
          bloating: false,
          mood_change: false,
          notes: "",
          symptom_time: "10:00",
          created_at: new Date().toISOString(),
        },
      ],
      lifestyle: [
        {
          id: 31,
          sleep_hours: 7.5,
          exercise_minutes: 30,
          water_litres: 2,
          stress_level: "low",
          mood: "neutral",
          activity_notes: "",
          lifestyle_time: "07:00",
          created_at: new Date().toISOString(),
        },
      ],
    });
    mockAuthenticatedUser();

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Meals logged")).toBeInTheDocument();
    });

    expect(screen.getByText("Weekly logging activity")).toBeInTheDocument();
    expect(screen.getByText("Consistency")).toBeInTheDocument();
    expect(screen.getByText(/% this week/i)).toBeInTheDocument();
  });

  it("shows recent activity preview from saved logs", async () => {
    mockDashboardFetch({
      meals: [
        {
          id: 11,
          meal_type: "Breakfast",
          foods_text: "Oats and banana",
          notes: "",
          meal_time: "08:00",
          glycaemic_band: "low",
          metabolic_summary: "",
          created_at: "2026-04-09T08:00:00Z",
        },
      ],
      symptoms: [
        {
          id: 21,
          fatigue: false,
          cravings: false,
          bloating: true,
          mood_change: false,
          notes: "Felt bloated after lunch",
          symptom_time: "14:00",
          created_at: "2026-04-09T14:00:00Z",
        },
      ],
      lifestyle: [
        {
          id: 31,
          sleep_hours: 6,
          exercise_minutes: 20,
          water_litres: 2,
          stress_level: "high",
          mood: "neutral",
          activity_notes: "Walked after lunch",
          lifestyle_time: "18:00",
          created_at: "2026-04-09T18:00:00Z",
        },
      ],
    });
    mockAuthenticatedUser();

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Recent activity")).toBeInTheDocument();
    });

    expect(screen.getByText(/oats and banana/i)).toBeInTheDocument();
    expect(screen.getByText(/felt bloated after lunch/i)).toBeInTheDocument();
    expect(screen.getByText(/walked after lunch/i)).toBeInTheDocument();
  });

  it("shows an honest no-pattern message when there is not enough repeated data", async () => {
    mockDashboardFetch({
      meals: [
        {
          id: 11,
          meal_type: "Dinner",
          foods_text: "Rice and chicken",
          notes: "",
          meal_time: "19:00",
          glycaemic_band: "high",
          metabolic_summary: "",
          created_at: "2026-04-09T19:00:00Z",
        },
      ],
      symptoms: [
        {
          id: 21,
          fatigue: false,
          cravings: true,
          bloating: false,
          mood_change: false,
          notes: "",
          symptom_time: "21:00",
          created_at: "2026-04-09T21:00:00Z",
        },
      ],
      lifestyle: [],
    });
    mockAuthenticatedUser();

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Insight preview")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/no repeated pattern yet/i),
    ).toBeInTheDocument();
  });

  it("shows a repeated insight preview when the weekly threshold is met", async () => {
    mockDashboardFetch({
      meals: [
        {
          id: 1,
          meal_type: "Dinner",
          foods_text: "Rice and chicken",
          notes: "",
          meal_time: "19:00",
          glycaemic_band: "high",
          metabolic_summary: "",
          created_at: "2026-04-07T19:00:00Z",
        },
        {
          id: 2,
          meal_type: "Dinner",
          foods_text: "Pasta",
          notes: "",
          meal_time: "19:00",
          glycaemic_band: "high",
          metabolic_summary: "",
          created_at: "2026-04-08T19:00:00Z",
        },
        {
          id: 3,
          meal_type: "Dinner",
          foods_text: "Burger",
          notes: "",
          meal_time: "19:00",
          glycaemic_band: "high",
          metabolic_summary: "",
          created_at: "2026-04-09T19:00:00Z",
        },
      ],
      symptoms: [
        {
          id: 11,
          fatigue: false,
          cravings: true,
          bloating: false,
          mood_change: false,
          notes: "",
          symptom_time: "21:00",
          created_at: "2026-04-07T21:00:00Z",
        },
        {
          id: 12,
          fatigue: false,
          cravings: true,
          bloating: false,
          mood_change: false,
          notes: "",
          symptom_time: "21:00",
          created_at: "2026-04-08T21:00:00Z",
        },
        {
          id: 13,
          fatigue: false,
          cravings: true,
          bloating: false,
          mood_change: false,
          notes: "",
          symptom_time: "21:00",
          created_at: "2026-04-09T21:00:00Z",
        },
      ],
      lifestyle: [],
    });
    mockAuthenticatedUser();

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Insight preview")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/cravings appeared within 12 hours of high glycaemic meals/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view full insights/i })).toBeInTheDocument();
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("shows a personalised greeting using first_name", async () => {
    mockDashboardFetch();
    mockAuthenticatedUser();

    render(<DashboardPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(
      screen.getByText(/good (morning|afternoon|evening), henry/i),
    ).toBeInTheDocument();
  });

  it("shows the executive sidebar navigation and logout action", async () => {
    mockDashboardFetch();
    mockAuthenticatedUser();

    render(<DashboardPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Meals")).toBeInTheDocument();
    expect(screen.getByText("Symptoms")).toBeInTheDocument();
    expect(screen.getByText("Lifestyle")).toBeInTheDocument();
    expect(screen.getAllByText("Insights").length).toBeGreaterThan(0);
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("shows the main dashboard action cards", async () => {
    mockDashboardFetch();
    mockAuthenticatedUser();

    render(<DashboardPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.getByText("Upload Meal Image")).toBeInTheDocument();
    expect(screen.getByText("Symptom Logging")).toBeInTheDocument();
    expect(screen.getByText("Lifestyle Logging")).toBeInTheDocument();
    expect(screen.getAllByText("Insights").length).toBeGreaterThan(0);
    expect(screen.getByText("Meal History")).toBeInTheDocument();
  });

  it("shows structured forms for meal, symptom, and lifestyle logging", async () => {
    mockDashboardFetch();
    mockAuthenticatedUser();

    render(<DashboardPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.getByText("Meal Logging")).toBeInTheDocument();
    expect(screen.getByText("Symptom Logging Form")).toBeInTheDocument();
    expect(screen.getByText("Lifestyle Logging Form")).toBeInTheDocument();

    expect(screen.getByLabelText(/meal type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/foods/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fatigue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cravings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sleep hours/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/exercise minutes/i)).toBeInTheDocument();
  });

  it("submits the meal logging form", async () => {
    const mockFetch = mockDashboardFetch();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        user_id: 1,
        meal_type: "breakfast",
        foods_text: "oats and banana",
        image_url: null,
        notes: "light breakfast",
        created_at: "2026-04-01T09:00:00Z",
      }),
    });
    mockAuthenticatedUser();

    render(<DashboardPage />);

    fireEvent.change(screen.getByLabelText(/meal type/i), {
      target: { value: "breakfast" },
    });

    fireEvent.change(screen.getByLabelText(/foods/i), {
      target: { value: "oats and banana" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save meal log/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/meals"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          }),
          body: JSON.stringify({
            meal_type: "breakfast",
            foods_text: "oats and banana",
            image_url: null,
            notes: "",
          }),
        }),
      );
    });
  });

  it("submits the symptom logging form", async () => {
    const mockFetch = mockDashboardFetch();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 2,
        user_id: 1,
        fatigue: true,
        cravings: false,
        bloating: true,
        mood_change: false,
        notes: "",
        created_at: "2026-04-01T10:00:00Z",
      }),
    });
    mockAuthenticatedUser();

    render(<DashboardPage />);

    fireEvent.change(screen.getByLabelText(/fatigue/i), {
      target: { value: "Yes" },
    });

    fireEvent.change(screen.getByLabelText(/cravings/i), {
      target: { value: "No" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save symptom log/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/symptoms"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          }),
          body: JSON.stringify({
            fatigue: true,
            cravings: false,
            bloating: false,
            mood_change: false,
            notes: "",
          }),
        }),
      );
    });
  });

  it("submits the lifestyle logging form", async () => {
    const mockFetch = mockDashboardFetch();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 3,
        user_id: 1,
        sleep_hours: 7.5,
        exercise_minutes: 30,
        water_litres: 2.0,
        stress_level: "medium",
        mood: "okay",
        activity_notes: "",
        created_at: "2026-04-01T11:00:00Z",
      }),
    });
    mockAuthenticatedUser();

    render(<DashboardPage />);

    fireEvent.change(screen.getByLabelText(/sleep hours/i), {
      target: { value: "7.5" },
    });

    fireEvent.change(screen.getByLabelText(/exercise minutes/i), {
      target: { value: "30" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /save lifestyle log/i }),
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/lifestyle"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          }),
          body: JSON.stringify({
            sleep_hours: 7.5,
            exercise_minutes: 30,
            water_litres: 0,
            stress_level: "",
            mood: "",
            activity_notes: "",
          }),
        }),
      );
    });
  });

  it("shows recent meal history on the dashboard", async () => {
    mockDashboardFetch({
      meals: [
        {
          id: 11,
          user_id: 1,
          meal_type: "dinner",
          foods_text: "rice and chicken",
          image_url: null,
          notes: "evening meal",
          created_at: "2026-04-01T19:00:00Z",
        },
      ],
    });
    mockAuthenticatedUser();

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/rice and chicken/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/dinner/i)).toBeInTheDocument();
  });

  it("shows recent symptom history on the dashboard", async () => {
    mockDashboardFetch({
      symptoms: [
        {
          id: 21,
          user_id: 1,
          fatigue: true,
          cravings: false,
          bloating: true,
          mood_change: false,
          notes: "felt bloated after lunch",
          created_at: "2026-04-01T14:00:00Z",
        },
      ],
    });
    mockAuthenticatedUser();

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/felt bloated after lunch/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/bloating/i)).toBeInTheDocument();
  });

  it("shows recent lifestyle history on the dashboard", async () => {
    mockDashboardFetch({
      lifestyle: [
        {
          id: 31,
          user_id: 1,
          sleep_hours: 7.5,
          exercise_minutes: 30,
          water_litres: 2.0,
          stress_level: "medium",
          mood: "okay",
          activity_notes: "walked after lunch",
          created_at: "2026-04-01T18:00:00Z",
        },
      ],
    });
    mockAuthenticatedUser();

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/walked after lunch/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/7.5/i)).toBeInTheDocument();
  });
});

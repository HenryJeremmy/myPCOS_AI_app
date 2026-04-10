import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Cookies from "js-cookie";
import LifestylePage from "@/app/lifestyle/page";

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

describe("lifestyle page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(Cookies.get).mockReturnValue("test-token");
  });

  it("shows the daily lifestyle tracking workspace", () => {
    render(<LifestylePage />);

    expect(screen.getByText(/daily lifestyle tracking/i)).toBeInTheDocument();
    expect(screen.getByText(/^daily habits$/i)).toBeInTheDocument();
    expect(screen.getByText(/^state selection$/i)).toBeInTheDocument();
    expect(screen.getByText(/^notes$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save lifestyle entry/i }),
    ).toBeInTheDocument();
  });

  it("lets the user fill in lifestyle details", () => {
    render(<LifestylePage />);

    fireEvent.change(screen.getByLabelText(/sleep hours/i), {
      target: { value: "7.5" },
    });
    fireEvent.change(screen.getByLabelText(/exercise minutes/i), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText(/water litres/i), {
      target: { value: "2.0" },
    });
    fireEvent.change(screen.getByLabelText(/log time/i), {
      target: { value: "18:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: /good/i }));
    fireEvent.click(screen.getByRole("button", { name: /high/i }));
    fireEvent.change(screen.getByLabelText(/activity notes/i), {
      target: { value: "Walked after lunch and felt more energised." },
    });

    expect(screen.getByLabelText(/sleep hours/i)).toHaveValue(7.5);
    expect(screen.getByLabelText(/exercise minutes/i)).toHaveValue(30);
    expect(screen.getByLabelText(/water litres/i)).toHaveValue(2);
    expect(screen.getByLabelText(/log time/i)).toHaveValue("18:30");
    expect(
      screen.getByDisplayValue("Walked after lunch and felt more energised."),
    ).toBeInTheDocument();
  });

  it("saves a lifestyle entry and resets the form", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1,
        user_id: 1,
        sleep_hours: 7.5,
        exercise_minutes: 30,
        water_litres: 2,
        stress_level: "High",
        mood: "Good",
        activity_notes: "Walked after lunch and felt more energised.",
        lifestyle_time: "18:30:00",
        created_at: "2026-04-08T03:00:00Z",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<LifestylePage />);

    fireEvent.change(screen.getByLabelText(/sleep hours/i), {
      target: { value: "7.5" },
    });
    fireEvent.change(screen.getByLabelText(/exercise minutes/i), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText(/water litres/i), {
      target: { value: "2.0" },
    });
    fireEvent.change(screen.getByLabelText(/log time/i), {
      target: { value: "18:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: /good/i }));
    fireEvent.click(screen.getByRole("button", { name: /high/i }));
    fireEvent.change(screen.getByLabelText(/activity notes/i), {
      target: { value: "Walked after lunch and felt more energised." },
    });

    fireEvent.click(screen.getByRole("button", { name: /save lifestyle entry/i }));

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
            water_litres: 2,
            stress_level: "High",
            mood: "Good",
            activity_notes: "Walked after lunch and felt more energised.",
            lifestyle_time: "18:30",
          }),
        }),
      );
    });

    expect(
      await screen.findByText(/lifestyle entry saved successfully/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/sleep hours/i)).toHaveValue(null);
    expect(screen.getByLabelText(/exercise minutes/i)).toHaveValue(null);
    expect(screen.getByLabelText(/water litres/i)).toHaveValue(null);
    expect(screen.getByLabelText(/log time/i)).toHaveValue("");
    expect(screen.getByLabelText(/activity notes/i)).toHaveValue("");
  });
});

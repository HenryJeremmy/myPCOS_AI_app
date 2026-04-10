import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Cookies from "js-cookie";
import SymptomsPage from "@/app/symptoms/page";

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

describe("symptoms page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(Cookies.get).mockReturnValue("test-token");
  });

  it("shows the structured symptom entry workspace", () => {
    render(<SymptomsPage />);

    expect(screen.getByText(/structured symptom entry/i)).toBeInTheDocument();
    expect(screen.getByText(/^symptom form$/i)).toBeInTheDocument();
    expect(screen.getByText(/^severity$/i)).toBeInTheDocument();
    expect(screen.getByText(/^log details$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save symptom entry/i }),
    ).toBeInTheDocument();
  });

  it("allows a symptom to be toggled on", () => {
    render(<SymptomsPage />);

    fireEvent.click(screen.getByRole("button", { name: /fatigue/i }));

    expect(screen.getByText(/selected/i)).toBeInTheDocument();
  });

  it("lets the user fill in symptom details", () => {
    render(<SymptomsPage />);

    fireEvent.click(screen.getByRole("button", { name: /high/i }));
    fireEvent.change(screen.getByLabelText(/symptom time/i), {
      target: { value: "09:30" },
    });
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: "Symptoms felt stronger before breakfast." },
    });

    expect(screen.getByLabelText(/symptom time/i)).toHaveValue("09:30");
    expect(
      screen.getByDisplayValue("Symptoms felt stronger before breakfast."),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/selected/i).length).toBeGreaterThan(0);
  });

  it("saves a symptom entry and resets the form", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1,
        user_id: 1,
        fatigue: true,
        cravings: false,
        bloating: false,
        mood_change: false,
        symptom_time: "09:30:00",
        notes: "Severity: High\nNotes: Symptoms felt stronger before breakfast.",
        created_at: "2026-04-08T02:00:00Z",
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<SymptomsPage />);

    fireEvent.click(screen.getByRole("button", { name: /fatigue/i }));
    fireEvent.click(screen.getByRole("button", { name: /high/i }));

    fireEvent.change(screen.getByLabelText(/symptom time/i), {
      target: { value: "09:30" },
    });

    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: "Symptoms felt stronger before breakfast." },
    });

    fireEvent.click(screen.getByRole("button", { name: /save symptom entry/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const [requestUrl, requestOptions] = mockFetch.mock.calls[0];

    expect(requestUrl).toContain("/api/v1/logs/symptoms");
    expect(requestOptions.method).toBe("POST");
    expect(requestOptions.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer test-token",
    });
    expect(JSON.parse(requestOptions.body)).toEqual({
      fatigue: true,
      cravings: false,
      bloating: false,
      mood_change: false,
      notes: "Severity: High\nNotes: Symptoms felt stronger before breakfast.",
      symptom_time: "09:30",
    });

    expect(
      await screen.findByText(/symptom entry saved successfully/i),
    ).toBeInTheDocument();

    
    expect(screen.getByLabelText(/symptom time/i)).toHaveValue("");
    expect(screen.getByLabelText(/notes/i)).toHaveValue("");
  });
});

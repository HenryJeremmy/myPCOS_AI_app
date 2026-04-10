"use client";

import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ProtectedRoute } from "@/components/protected-route";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 16) return "Good afternoon";
  return "Good evening";
}
type MealHistoryItem = {
  id: number;
  meal_type: string;
  foods_text: string;
  notes: string;
  created_at: string;
};

type SymptomHistoryItem = {
  id: number;
  fatigue: boolean;
  cravings: boolean;
  bloating: boolean;
  mood_change: boolean;
  notes: string;
  created_at: string;
};

type LifestyleHistoryItem = {
  id: number;
  sleep_hours: number;
  exercise_minutes: number;
  water_litres: number;
  stress_level: string;
  mood: string;
  activity_notes: string;
  created_at: string;
};

const sidebarItems = [
  "Overview",
  "Meals",
  "Symptoms",
  "Lifestyle",
  "Insights",
  "History",
  "Settings",
];

const dashboardCards = [
  {
    title: "Upload Meal Image",
    description: "Support AI-assisted meal capture and faster food logging.",
  },

  {
    title: "Insights",
    description: "View repeated behavioural patterns and feedback over time.",
  },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mealHistory, setMealHistory] = useState<MealHistoryItem[]>([]);
  const [mealType, setMealType] = useState("");
  const [fatigue, setFatigue] = useState("Yes");
  const [cravings, setCravings] = useState("No");
  const [sleepHours, setSleepHours] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [foodsText, setFoodsText] = useState("");
  const [symptomHistory, setSymptomHistory] = useState<SymptomHistoryItem[]>([],);
  const [lifestyleHistory, setLifestyleHistory] = useState<LifestyleHistoryItem[]>([]);

  useEffect(() => {
    async function loadMealHistory() {
      const token = Cookies.get("access_token");
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/logs/meals`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) return;

      const data = await response.json();
      setMealHistory(Array.isArray(data) ? data : []);
    }

    loadMealHistory();

    async function loadSymptomHistory() {
      const token = Cookies.get("access_token");
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/logs/symptoms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) return;

      const data = await response.json();
      setSymptomHistory(Array.isArray(data) ? data : []);
    }

    loadSymptomHistory();

    async function loadLifestyleHistory() {
      const token = Cookies.get("access_token");
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/logs/lifestyle`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) return;

      const data = await response.json();
      setLifestyleHistory(Array.isArray(data) ? data : []);
    }
    loadLifestyleHistory();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[linear-gradient(135deg,#fbf6f8_0%,#f7edf2_40%,#f0e6f2_100%)] p-4 md:p-6">
        <div className="overflow-hidden rounded-[34px] shadow-[0_24px_60px_rgba(119,77,116,0.14)]">
          <div className="grid min-h-[calc(100vh-2rem)] lg:grid-cols-[280px_1fr]">
            {isSidebarOpen ? (
              <button
                type="button"
                aria-label="Close navigation"
                className="fixed inset-0 z-30 bg-[#341432]/45 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            ) : null}
            <aside
              className={`fixed inset-y-0 left-0 z-40 flex w-[88vw] max-w-[320px] flex-col justify-between bg-[linear-gradient(180deg,#5a2858_0%,#6b2e73_100%)] p-6 text-white transition-transform duration-300 lg:static lg:w-auto lg:max-w-none lg:translate-x-0 ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div>
                <div className="mb-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                      ♡
                    </div>
                    <div>
                      <div className="text-[28px] font-extrabold tracking-tight">
                        myPCOS
                      </div>
                      <p className="text-xs text-white/70">
                        Premium monitoring suite
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="rounded-2xl border border-white/20 px-3 py-2 text-sm text-white/80 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  {sidebarItems.map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                        index === 0
                          ? "bg-white text-[#5a2858]"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[28px] bg-white/10 p-5">
                  <p className="text-sm font-semibold">System purpose</p>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    Help users notice repeated non-diagnostic links between
                    dietary patterns, lifestyle behaviours, and symptoms over
                    time.
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className=" cursor-pointer mt-8 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                Logout
              </button>
            </aside>

            <main className="min-w-0 p-5 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-4 lg:hidden">
                    <button
                      type="button"
                      aria-label="Open navigation"
                      className="inline-flex items-center gap-3 rounded-2xl border border-[#d7b4d2] bg-white/80 px-4 py-3 text-sm font-semibold text-[#5a2858] shadow-sm"
                      onClick={() => setIsSidebarOpen(true)}
                    >
                      <span className="text-lg leading-none">☰</span>
                      <span>Menu</span>
                    </button>
                  </div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[#a66f94]">
                    Premium dashboard
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#4f2550] md:text-4xl">
                    {user?.first_name
                      ? `${getGreeting()}, ${user.first_name}`
                      : "Dashboard"}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7d627e] md:text-base">
                    A mature executive workspace for structured logging,
                    behaviour tracking, and future research-aligned insight
                    generation.
                  </p>
                </div>
                <button className="rounded-2xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-200">
                  Create entry
                </button>
              </div>

              <section className="mt-8">
                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  <section className="rounded-[24px] bg-white/85 p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-[#592b5a]">
                      Meal Logging
                    </h2>

                    <form
                      className="mt-4 space-y-4"
                      onSubmit={handleMealSubmit}
                    >
                      <div>
                        <label
                          htmlFor="mealType"
                          className="mb-2 block text-sm font-medium text-[#5f2f60]"
                        >
                          Meal Type
                        </label>
                        <input
                          id="mealType"
                          type="text"
                          value={mealType}
                          onChange={(e) => setMealType(e.target.value)}
                          className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-[#4f2550] focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="foods"
                          className="mb-2 block text-sm font-medium text-[#5f2f60]"
                        >
                          Foods
                        </label>
                        <textarea
                          id="foods"
                          rows={4}
                          value={foodsText}
                          onChange={(e) => setFoodsText(e.target.value)}
                          className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-[#4f2550] focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                        />
                      </div>

                      <button
                        type="submit"
                        className=" cursor-pointer rounded-2xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-4 py-2.5 text-sm font-semibold text-white shadow-md"
                      >
                        Save Meal Log
                      </button>
                    </form>
                  </section>

                  <section className="rounded-[24px] bg-white/85 p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-[#592b5a]">
                      Symptom Logging Form
                    </h2>

                    <form
                      className="mt-4 space-y-4"
                      onSubmit={handleSymptomSubmit}
                    >
                      <div>
                        <label
                          htmlFor="fatigue"
                          className="mb-2 block text-sm font-medium text-[#5f2f60]"
                        >
                          Fatigue
                        </label>
                        <select
                          id="fatigue"
                          value={fatigue}
                          onChange={(e) => setFatigue(e.target.value)}
                          className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-[#4f2550] focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                        >
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="cravings"
                          className="mb-2 block text-sm font-medium text-[#5f2f60]"
                        >
                          Cravings
                        </label>
                        <select
                          id="cravings"
                          value={cravings}
                          onChange={(e) => setCravings(e.target.value)}
                          className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-[#4f2550] focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                        >
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className=" cursor-pointer rounded-2xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-4 py-2.5 text-sm font-semibold text-white shadow-md"
                      >
                        Save Symptom Log
                      </button>
                    </form>
                  </section>

                  <section className="rounded-[24px] bg-white/85 p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-[#592b5a]">
                      Lifestyle Logging Form
                    </h2>

                    <form
                      className="mt-4 space-y-4"
                      onSubmit={handleLifestyleSubmit}
                    >
                      <div>
                        <label
                          htmlFor="sleepHours"
                          className="mb-2 block text-sm font-medium text-[#5f2f60]"
                        >
                          Sleep Hours
                        </label>
                        <input
                          id="sleepHours"
                          type="number"
                          step="0.1"
                          value={sleepHours}
                          onChange={(e) => setSleepHours(e.target.value)}
                          className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-[#4f2550] focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="exerciseMinutes"
                          className="mb-2 block text-sm font-medium text-[#5f2f60]"
                        >
                          Exercise Minutes
                        </label>
                        <input
                          id="exerciseMinutes"
                          type="number"
                          value={exerciseMinutes}
                          onChange={(e) => setExerciseMinutes(e.target.value)}
                          className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-[#4f2550] focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                        />
                      </div>

                      <button
                        type="submit"
                        className=" cursor-pointer rounded-2xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-4 py-2.5 text-sm font-semibold text-white shadow-md"
                      >
                        Save Lifestyle Log
                      </button>
                    </form>
                  </section>
                </div>
              </section>

              <section className="mt-8">
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {dashboardCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[24px] bg-white/85 p-5 shadow-sm"
                  >
                    <h2 className="text-lg font-bold text-[#592b5a]">
                      {card.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#7e6880]">
                      {card.description}
                    </p>
                  </div>
                ))}

                <div className="rounded-[24px] bg-white/85 p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-[#592b5a]">
                    Meal History
                  </h2>

                  <div className="mt-3 space-y-3">
                    {mealHistory.length === 0 ? (
                      <p className="text-sm leading-6 text-[#7e6880]">
                        Review previous food logs and timestamped meal activity.
                      </p>
                    ) : (
                      mealHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-2xl bg-[#f8eef6] p-3"
                        >
                          <p className="text-sm font-semibold uppercase tracking-wide text-[#7a4a78]">
                            {entry.meal_type}
                          </p>
                          <p className="mt-1 text-sm text-[#5f4a60]">
                            {entry.foods_text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] bg-white/85 p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-[#592b5a]">
                    Symptom Logging
                  </h2>

                  <div className="mt-3 space-y-3">
                    {symptomHistory.length === 0 ? (
                      <p className="text-sm leading-6 text-[#7e6880]">
                        Track fatigue, cravings, bloating, and mood-related
                        changes.
                      </p>
                    ) : (
                      symptomHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-2xl bg-[#f8eef6] p-3"
                        >
                          <p className="text-sm font-semibold text-[#7a4a78]">
                            {entry.bloating ? "Bloating" : "Symptom entry"}
                          </p>
                          <p className="mt-1 text-sm text-[#5f4a60]">
                            {entry.notes}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] bg-white/85 p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-[#592b5a]">
                    Lifestyle Logging
                  </h2>

                  <div className="mt-3 space-y-3">
                    {lifestyleHistory.length === 0 ? (
                      <p className="text-sm leading-6 text-[#7e6880]">
                        Record sleep, water, stress, exercise, and daily
                        activity.
                      </p>
                    ) : (
                      lifestyleHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-2xl bg-[#f8eef6] p-3"
                        >
                          <p className="text-sm font-semibold text-[#7a4a78]">
                            {entry.sleep_hours} hours sleep
                          </p>
                          <p className="mt-1 text-sm text-[#5f4a60]">
                            {entry.activity_notes}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );

  async function handleMealSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = Cookies.get("access_token");
    if (!token) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/logs/meals`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          meal_type: mealType,
          foods_text: foodsText,
          image_url: null,
          notes: "",
        }),
      },
    );
  }

  async function handleSymptomSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = Cookies.get("access_token");
    if (!token) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/logs/symptoms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fatigue: fatigue === "Yes",
          cravings: cravings === "Yes",
          bloating: false,
          mood_change: false,
          notes: "",
        }),
      },
    );
  }

  async function handleLifestyleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = Cookies.get("access_token");
    if (!token) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/logs/lifestyle`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sleep_hours: Number(sleepHours),
          exercise_minutes: Number(exerciseMinutes),
          water_litres: 0,
          stress_level: "",
          mood: "",
          activity_notes: "",
        }),
      },
    );
  }
}

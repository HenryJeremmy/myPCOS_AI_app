"use client";

import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth";

type MealEntry = {
  id: number;
  meal_type: string;
  foods_text: string;
  notes: string | null;
  meal_time: string | null;
  glycaemic_band: string | null;
  metabolic_summary: string | null;
  created_at: string;
};

type SymptomEntry = {
  id: number;
  fatigue: boolean;
  cravings: boolean;
  bloating: boolean;
  mood_change: boolean;
  notes: string | null;
  symptom_time: string | null;
  created_at: string;
};

type LifestyleEntry = {
  id: number;
  sleep_hours: number | null;
  exercise_minutes: number | null;
  water_litres: number | null;
  stress_level: string | null;
  mood: string | null;
  activity_notes: string | null;
  lifestyle_time: string | null;
  created_at: string;
};

type PatternRow = {
  behaviour: string;
  symptom: string;
  count: number;
};

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
};

const sidebarItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Meals", href: "/meals" },
  { label: "Symptoms", href: "/symptoms" },
  { label: "Lifestyle", href: "/lifestyle" },
  { label: "Insights", href: "/insights" },
  { label: "History", href: "/history" },
  { label: "Settings", href: "/settings" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 16) return "Good afternoon";
  return "Good evening";
}

function getStartOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function getDateKey(dateString: string) {
  const date = new Date(dateString);
  if (!Number.isFinite(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normaliseTimeValue(timeValue: string | null | undefined) {
  if (!timeValue) return null;
  const match = timeValue.match(/^(\d{2}):(\d{2})/);
  if (!match) return null;
  return `${match[1]}:${match[2]}`;
}

function buildEventTimestamp(
  dateString: string,
  timeValue: string | null | undefined,
) {
  const dateKey = getDateKey(dateString);
  const normalisedTime = normaliseTimeValue(timeValue);

  if (dateKey && normalisedTime) {
    return new Date(`${dateKey}T${normalisedTime}:00`).getTime();
  }

  const fallback = new Date(dateString).getTime();
  return Number.isFinite(fallback) ? fallback : null;
}

function toTitleCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function symptomLabel(
  symptom: keyof Pick<
    SymptomEntry,
    "fatigue" | "cravings" | "bloating" | "mood_change"
  >,
) {
  switch (symptom) {
    case "fatigue":
      return "Fatigue";
    case "cravings":
      return "Cravings";
    case "bloating":
      return "Bloating";
    case "mood_change":
      return "Mood change";
  }
}

function buildPatternRows(
  meals: MealEntry[],
  symptoms: SymptomEntry[],
  lifestyle: LifestyleEntry[],
) {
  const symptomKeys = ["fatigue", "cravings", "bloating", "mood_change"] as const;
  const pairCounts = new Map<string, PatternRow>();
  const associationWindowMs = 12 * 60 * 60 * 1000;

  const mealEvents = meals
    .map((meal) => ({
      band: meal.glycaemic_band?.toLowerCase() ?? null,
      timestamp: buildEventTimestamp(meal.created_at, meal.meal_time),
    }))
    .filter(
      (event): event is { band: string; timestamp: number } =>
        Boolean(
          event.band &&
            event.band !== "unknown" &&
            event.timestamp !== null &&
            Number.isFinite(event.timestamp),
        ),
    );

  const lifestyleEvents = lifestyle
    .map((entry) => ({
      lowSleep: (entry.sleep_hours ?? 0) > 0 && (entry.sleep_hours ?? 0) < 6,
      highStress: (entry.stress_level ?? "").toLowerCase() === "high",
      timestamp: buildEventTimestamp(entry.created_at, entry.lifestyle_time),
    }))
    .filter(
      (event): event is {
        lowSleep: boolean;
        highStress: boolean;
        timestamp: number;
      } => event.timestamp !== null && Number.isFinite(event.timestamp),
    );

  function addPatternCount(behaviour: string, symptom: string) {
    const key = `${behaviour}::${symptom}`;
    const current = pairCounts.get(key);

    if (current) {
      current.count += 1;
      return;
    }

    pairCounts.set(key, {
      behaviour,
      symptom,
      count: 1,
    });
  }

  symptoms.forEach((entry) => {
    const symptomTimestamp = buildEventTimestamp(
      entry.created_at,
      entry.symptom_time,
    );
    if (symptomTimestamp === null || !Number.isFinite(symptomTimestamp)) return;

    const matchedBehaviours = new Map<string, Set<string>>();
    symptomKeys.forEach((key) => {
      if (!entry[key]) return;

      const symptomName = symptomLabel(key);
      const behaviourSet = matchedBehaviours.get(symptomName) ?? new Set<string>();

      mealEvents.forEach((mealEvent) => {
        const timeDifference = symptomTimestamp - mealEvent.timestamp;
        if (timeDifference < 0 || timeDifference > associationWindowMs) return;
        behaviourSet.add(`${toTitleCase(mealEvent.band)} glycaemic meals`);
      });

      lifestyleEvents.forEach((lifestyleEvent) => {
        const timeDifference = symptomTimestamp - lifestyleEvent.timestamp;
        if (timeDifference < 0 || timeDifference > associationWindowMs) return;

        if (lifestyleEvent.lowSleep) {
          behaviourSet.add("Sleep under 6 hours");
        }

        if (lifestyleEvent.highStress) {
          behaviourSet.add("High stress");
        }
      });

      matchedBehaviours.set(symptomName, behaviourSet);
    });

    matchedBehaviours.forEach((behaviours, symptomName) => {
      behaviours.forEach((behaviour) => {
        addPatternCount(behaviour, symptomName);
      });
    });
  });

  return [...pairCounts.values()]
    .filter((row) => row.count >= 3)
    .sort((a, b) => b.count - a.count);
}

function extractSymptomNames(entry: SymptomEntry) {
  const symptoms: string[] = [];
  if (entry.fatigue) symptoms.push("Fatigue");
  if (entry.cravings) symptoms.push("Cravings");
  if (entry.bloating) symptoms.push("Bloating");
  if (entry.mood_change) symptoms.push("Mood change");
  return symptoms;
}

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  if (!Number.isFinite(date.getTime())) return dateString;

  const today = getStartOfToday();
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));

  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

function Sidebar({
  isOpen,
  onClose,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[88vw] max-w-[320px] flex-col justify-between bg-[linear-gradient(180deg,#5a2858_0%,#6b2e73_100%)] p-6 text-white transition-transform duration-300 lg:static lg:w-auto lg:max-w-none lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div>
        <div className="mb-10 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              ♡
            </div>
            <div>
              <div className="text-[28px] font-extrabold tracking-tight">
                myPCOS
              </div>
              <p className="text-xs text-white/70">Premium monitoring suite</p>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            className="rounded-2xl border border-white/20 px-3 py-2 text-sm text-white/80 lg:hidden"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium ${
                item.label === "Overview"
                  ? "bg-white text-[#5a2858]"
                  : "text-white/80 hover:bg-white/10"
              }`}
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] bg-white/10 p-5">
          <p className="text-sm font-semibold">Dashboard focus</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            A clear overview of this week&apos;s logging activity, consistency,
            and any repeated behavioural patterns worth reviewing.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-8 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
      >
        Logout
      </button>
    </aside>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] bg-white/88 p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9f6f9d]">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function WeeklyBars({
  data,
}: {
  data: Array<{ label: string; total: number; heightPercent: number }>;
}) {
  return (
    <div className="h-[220px] rounded-[24px] bg-[linear-gradient(180deg,#fff8fb_0%,#f5eef7_100%)] p-5">
      <div className="flex h-full items-end gap-3">
        {data.map((day) => (
          <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="text-xs font-semibold text-[#7a647f]">
              {day.total}
            </div>
            <div
              className="w-full rounded-t-2xl bg-gradient-to-t from-[#8a3fd8] to-[#cf41ca]"
              style={{ height: `${Math.max(day.heightPercent, day.total > 0 ? 10 : 4)}%` }}
            />
            <span className="text-xs text-[#826d86]">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [symptomEntries, setSymptomEntries] = useState<SymptomEntry[]>([]);
  const [lifestyleEntries, setLifestyleEntries] = useState<LifestyleEntry[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      const token = Cookies.get("access_token");
      if (!token) {
        setLoadError("You need to be logged in to view the dashboard.");
        return;
      }

      setLoadError("");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

      try {
        const [mealsResponse, symptomsResponse, lifestyleResponse] =
          await Promise.all([
            fetch(`${baseUrl}/api/v1/logs/meals`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${baseUrl}/api/v1/logs/symptoms`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${baseUrl}/api/v1/logs/lifestyle`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (!mealsResponse.ok || !symptomsResponse.ok || !lifestyleResponse.ok) {
          setLoadError("Unable to load dashboard data right now.");
          return;
        }

        const [mealsData, symptomsData, lifestyleData] = await Promise.all([
          mealsResponse.json(),
          symptomsResponse.json(),
          lifestyleResponse.json(),
        ]);

        setMealEntries(Array.isArray(mealsData) ? mealsData : []);
        setSymptomEntries(Array.isArray(symptomsData) ? symptomsData : []);
        setLifestyleEntries(Array.isArray(lifestyleData) ? lifestyleData : []);
      } catch {
        setLoadError("Unable to load dashboard data right now.");
      }
    }

    loadDashboardData();
  }, []);

  const dashboardData = useMemo(() => {
    const today = getStartOfToday();
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return date;
    });

    const last7Cutoff = new Date(today);
    last7Cutoff.setDate(last7Cutoff.getDate() - 6);

    const mealsThisWeek = mealEntries.filter(
      (entry) => new Date(entry.created_at) >= last7Cutoff,
    );
    const symptomsThisWeek = symptomEntries.filter(
      (entry) => new Date(entry.created_at) >= last7Cutoff,
    );
    const lifestyleThisWeek = lifestyleEntries.filter(
      (entry) => new Date(entry.created_at) >= last7Cutoff,
    );

    const patterns = buildPatternRows(
      mealsThisWeek,
      symptomsThisWeek,
      lifestyleThisWeek,
    );

    const dailyCounts = dates.map((date) => {
      const dateKey = getDateKey(date.toISOString());
      const mealCount = mealsThisWeek.filter(
        (entry) => getDateKey(entry.created_at) === dateKey,
      ).length;
      const symptomCount = symptomsThisWeek.filter(
        (entry) => getDateKey(entry.created_at) === dateKey,
      ).length;
      const lifestyleCount = lifestyleThisWeek.filter(
        (entry) => getDateKey(entry.created_at) === dateKey,
      ).length;

      return {
        label: date.toLocaleDateString([], { weekday: "short" }),
        total: mealCount + symptomCount + lifestyleCount,
      };
    });

    const maxDailyCount = Math.max(...dailyCounts.map((item) => item.total), 0);
    const chartData = dailyCounts.map((item) => ({
      ...item,
      heightPercent: maxDailyCount > 0 ? (item.total / maxDailyCount) * 100 : 0,
    }));

    const activeDays = new Set(
      [...mealsThisWeek, ...symptomsThisWeek, ...lifestyleThisWeek].map((entry) =>
        getDateKey(entry.created_at),
      ),
    ).size;
    const consistency = Math.round((activeDays / 7) * 100);

    const activityItems: ActivityItem[] = [
      ...mealEntries.map((entry) => ({
        id: `meal-${entry.id}`,
        title: `${entry.meal_type || "Meal"} logged`,
        detail: entry.foods_text || "Meal entry saved",
        createdAt: entry.created_at,
      })),
      ...symptomEntries.map((entry) => ({
        id: `symptom-${entry.id}`,
        title: `${extractSymptomNames(entry).join(" and ") || "Symptom"} recorded`,
        detail: entry.notes?.trim() || "Symptom entry saved",
        createdAt: entry.created_at,
      })),
      ...lifestyleEntries.map((entry) => ({
        id: `lifestyle-${entry.id}`,
        title: `Lifestyle entry logged`,
        detail:
          entry.activity_notes?.trim() ||
          `Sleep ${entry.sleep_hours ?? 0}h, stress ${entry.stress_level ?? "not set"}`,
        createdAt: entry.created_at,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3);

    const topPattern = patterns[0] ?? null;

    return {
      mealsThisWeek,
      symptomsThisWeek,
      lifestyleThisWeek,
      patterns,
      chartData,
      consistency,
      activeDays,
      activityItems,
      topPattern,
    };
  }, [lifestyleEntries, mealEntries, symptomEntries]);

  const stats = [
    {
      label: "Meals logged",
      value: dashboardData.mealsThisWeek.length,
      note: "This week",
    },
    {
      label: "Symptoms logged",
      value: dashboardData.symptomsThisWeek.length,
      note: "This week",
    },
    {
      label: "Lifestyle entries",
      value: dashboardData.lifestyleThisWeek.length,
      note: "This week",
    },
    {
      label: "Insights found",
      value: dashboardData.patterns.length,
      note: "This week",
    },
  ];

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

            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onLogout={logout}
            />

            <main className="min-w-0 p-5 md:p-8">
              <div className="flex flex-col gap-4">
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
                  <p className="text-sm uppercase tracking-[0.18em] text-[#946183]">
                    Overview
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#4f2550] md:text-4xl">
                    {user?.first_name
                      ? `${getGreeting()}, ${user.first_name}`
                      : "Weekly overview"}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#69536d] md:text-base">
                    A clear overview of this week&apos;s logging activity,
                    consistency, and any repeated behavioural patterns worth
                    reviewing.
                  </p>
                </div>
              </div>

              {loadError ? (
                <div className="mt-6 rounded-[24px] bg-[#fff1f4] px-5 py-4 text-sm font-medium text-[#a43f62]">
                  {loadError}
                </div>
              ) : null}

              <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <Card key={stat.label} title={stat.label}>
                    <p className="text-3xl font-bold text-[#592b5a]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-[#695c70]">{stat.note}</p>
                  </Card>
                ))}
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <Card title="Weekly logging activity">
                  <p className="mb-4 text-sm leading-6 text-[#695c70]">
                    A quick view of how many entries were recorded each day this
                    week.
                  </p>
                  <WeeklyBars data={dashboardData.chartData} />
                </Card>

                <Card title="Recent activity">
                  <div className="space-y-3">
                    {dashboardData.activityItems.length === 0 ? (
                      <div className="rounded-[22px] bg-[#fcf6fa] px-4 py-4 text-sm text-[#695c70]">
                        No activity logged yet. Start with Meals, Symptoms, or
                        Lifestyle to build your weekly overview.
                      </div>
                    ) : (
                      dashboardData.activityItems.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-[22px] bg-[#fcf6fa] px-4 py-4 text-sm text-[#695c70]"
                        >
                          <p className="font-semibold text-[#592b5a]">
                            {item.title}
                          </p>
                          <p className="mt-1">{item.detail}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8d7391]">
                            {formatRelativeDate(item.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
                <Card title="Consistency">
                  <div className="rounded-[24px] bg-[linear-gradient(135deg,#fff7fa_0%,#f4edf7_100%)] p-5">
                    <p className="text-2xl font-bold text-[#592b5a]">
                      {dashboardData.consistency}% this week
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#695c70]">
                      You logged entries on {dashboardData.activeDays} out of 7
                      days. Consistent logging improves later insight quality.
                    </p>
                  </div>
                </Card>

                <Card title="Insight preview">
                  <div className="rounded-[24px] bg-[#fcf6fa] p-5 text-sm leading-7 text-[#695c70]">
                    {dashboardData.topPattern ? (
                      <>
                        <p>
                          {dashboardData.topPattern.symptom} appeared within 12
                          hours of {dashboardData.topPattern.behaviour.toLowerCase()} on{" "}
                          {dashboardData.topPattern.count} occasions this week.
                        </p>
                        <Link
                          href="/insights"
                          className="mt-3 inline-flex text-sm font-semibold text-[#6b2e73]"
                        >
                          View full insights
                        </Link>
                      </>
                    ) : (
                      <>
                        <p>
                          No repeated pattern yet. Continue logging meals,
                          symptoms, and lifestyle entries to improve future
                          review.
                        </p>
                        <Link
                          href="/insights"
                          className="mt-3 inline-flex text-sm font-semibold text-[#6b2e73]"
                        >
                          Open insights
                        </Link>
                      </>
                    )}
                  </div>
                </Card>
              </section>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

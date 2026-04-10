"use client";

import { useEffect, useState } from "react";
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
  frequency: string;
  count: number;
};

function Sidebar({
  isOpen,
  onClose,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const items = [
    { label: "Overview", href: "/dashboard", enabled: true },
    { label: "Meals", href: "/meals", enabled: true },
    { label: "Symptoms", href: "/symptoms", enabled: true },
    { label: "Lifestyle", href: "/lifestyle", enabled: true },
    { label: "Insights", href: "/insights", enabled: true },
    { label: "History", href: "/history", enabled: true },
    { label: "Settings", href: "/settings", enabled: true },
  ];

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
          {items.map((item) =>
            item.enabled ? (
              <Link
                key={item.label}
                href={item.href}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium ${
                  item.label === "Insights"
                    ? "bg-white text-[#5a2858]"
                    : "text-white/80 hover:bg-white/10"
                }`}
                onClick={onClose}
              >
                {item.label}
              </Link>
            ) : (
              <div
                key={item.label}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-white/45"
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{item.label}</span>
                  <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/55">
                    Soon
                  </span>
                </div>
              </div>
            ),
          )}
        </div>

        <div className="mt-8 rounded-[28px] bg-white/10 p-5">
          <p className="text-sm font-semibold">Insights workflow</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Review careful non-diagnostic observations based on the entries you
            have already logged this week.
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

function withinLast7Days(dateString: string) {
  const createdAt = new Date(dateString).getTime();
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return Number.isFinite(createdAt) && createdAt >= cutoff;
}

function getDateKey(dateString: string) {
  const fromString = dateString.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(fromString)) return fromString;

  const parsed = new Date(dateString);
  if (!Number.isFinite(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function normaliseTimeValue(timeValue: string | null | undefined) {
  if (!timeValue) return null;
  const match = timeValue.match(/^(\d{2}):(\d{2})/);
  if (!match) return null;
  return `${match[1]}:${match[2]}`;
}

function buildEventTimestamp(dateString: string, timeValue: string | null | undefined) {
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

function symptomLabel(symptom: keyof Pick<
  SymptomEntry,
  "fatigue" | "cravings" | "bloating" | "mood_change"
>) {
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
): PatternRow[] {
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
      current.frequency = `${current.count}× this week`;
      return;
    }

    pairCounts.set(key, {
      behaviour,
      symptom,
      count: 1,
      frequency: "1× this week",
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
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.behaviour.localeCompare(b.behaviour);
    })
    .slice(0, 4);
}

function buildInsightStatement(rows: PatternRow[]) {
  if (rows.length === 0) {
    return "More repeated meal, symptom, and lifestyle logs with clear event times are needed before meaningful weekly patterns can be reviewed.";
  }

  const primary = rows[0];
  return `${primary.symptom} appeared within 12 hours of ${primary.behaviour.toLowerCase()} on ${primary.count} occasions this week, suggesting a repeated pattern worth continued observation.`;
}

function getConfidenceLabel(rows: PatternRow[], totalEntries: number) {
  const strongestPattern = rows[0]?.count ?? 0;

  if (strongestPattern >= 4) return "Recurring pattern";
  if (strongestPattern >= 3) return "Early trend";
  if (totalEntries >= 6) return "Limited repeated matches";
  return "Limited data";
}

export default function InsightsPage() {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [symptomEntries, setSymptomEntries] = useState<SymptomEntry[]>([]);
  const [lifestyleEntries, setLifestyleEntries] = useState<LifestyleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadInsightsData() {
      const token = Cookies.get("access_token");
      if (!token) {
        setLoadError("You need to be logged in to view insights.");
        setIsLoading(false);
        return;
      }

      setLoadError("");

      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

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
        setLoadError("Unable to load insight data right now.");
        setIsLoading(false);
        return;
      }

      const [mealsData, symptomsData, lifestyleData] = await Promise.all([
        mealsResponse.json(),
        symptomsResponse.json(),
        lifestyleResponse.json(),
      ]);

      setMealEntries(
        Array.isArray(mealsData)
          ? mealsData.filter((entry) => withinLast7Days(entry.created_at))
          : [],
      );
      setSymptomEntries(
        Array.isArray(symptomsData)
          ? symptomsData.filter((entry) => withinLast7Days(entry.created_at))
          : [],
      );
      setLifestyleEntries(
        Array.isArray(lifestyleData)
          ? lifestyleData.filter((entry) => withinLast7Days(entry.created_at))
          : [],
      );
      setIsLoading(false);
    }

    loadInsightsData();
  }, []);

  const totalEntries =
    mealEntries.length + symptomEntries.length + lifestyleEntries.length;
  const patternRows = buildPatternRows(
    mealEntries,
    symptomEntries,
    lifestyleEntries,
  );
  const insightStatement = buildInsightStatement(patternRows);
  const confidenceLabel = getConfidenceLabel(patternRows, totalEntries);
  const hasEnoughData =
    mealEntries.length > 0 &&
    symptomEntries.length > 0 &&
    lifestyleEntries.length > 0;

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
                  <p className="text-sm uppercase tracking-[0.18em] text-[#946183]">
                    Insights module
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#4f2550] md:text-4xl">
                    Behaviour–symptom pattern review
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#69536d] md:text-base">
                    A structured view of repeated weekly relationships between
                    behaviour and symptoms, presented in clear non-diagnostic
                    language.
                  </p>
                </div>
              </div>

              {loadError ? (
                <p className="mt-4 rounded-2xl bg-[#fff0f3] px-4 py-3 text-sm font-medium text-[#a22b52]">
                  {loadError}
                </p>
              ) : null}

              {isLoading ? (
                <div className="mt-8 rounded-[28px] bg-white/88 p-6 shadow-sm">
                  <p className="text-sm leading-7 text-[#695c70]">
                    Loading weekly insight data...
                  </p>
                </div>
              ) : (
                <>
                  <section className="mt-8 grid gap-5 xl:grid-cols-[1fr_0.88fr]">
                    <Card title="Pattern table">
                      {hasEnoughData && patternRows.length > 0 ? (
                        <div className="space-y-3">
                          {patternRows.map((row) => (
                            <div
                              key={`${row.behaviour}-${row.symptom}`}
                              className="rounded-[22px] bg-[#fcf6fa] px-4 py-4"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-sm font-semibold text-[#592b5a]">
                                    {row.behaviour}
                                  </p>
                                  <p className="mt-1 text-sm text-[#695c70]">
                                    Associated symptom: {row.symptom}
                                  </p>
                                </div>
                                <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#8a3fd8] shadow-sm">
                                  {row.frequency}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-[22px] bg-[#fcf6fa] px-4 py-4 text-sm leading-7 text-[#695c70]">
                          More meal, symptom, and lifestyle entries are needed
                          before repeated time-linked insights can be generated.
                        </div>
                      )}
                    </Card>

                    <div className="space-y-5">
                      <Card title="Insight statement">
                        <div className="rounded-[22px] bg-[linear-gradient(135deg,#fff7fa_0%,#f4edf7_100%)] px-4 py-4 text-sm leading-7 text-[#6e5a76]">
                          {insightStatement}
                        </div>
                      </Card>

                      <Card title="Confidence">
                        <div className="rounded-[22px] bg-[#fcf6fa] px-4 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-semibold text-[#592b5a]">
                              {confidenceLabel}
                            </p>
                            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#8a3fd8] shadow-sm">
                              Last 7 days
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[#695c70]">
                            Based on repeated matches where a behaviour was
                            logged within 12 hours before a symptom entry in
                            the last 7 days.
                          </p>
                        </div>
                      </Card>

                      <Card title="Non-diagnostic guidance">
                        <div className="space-y-3 text-sm leading-7 text-[#695c70]">
                          <div className="rounded-[22px] bg-[#fcf6fa] px-4 py-4">
                            These observations are behavioural patterns only and
                            should not be interpreted as medical diagnosis.
                          </div>
                          <div className="rounded-[22px] bg-[#fcf6fa] px-4 py-4">
                            More complete weekly logs may improve the quality of
                            future pattern review.
                          </div>
                        </div>
                      </Card>
                    </div>
                  </section>
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

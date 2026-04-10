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

type HistoryTab = "meals" | "symptoms" | "lifestyle";
type DateFilter = "today" | "yesterday" | "last7" | "last30" | "pickDate";

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
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium ${
                item.label === "History"
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
          <p className="text-sm font-semibold">History workflow</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Review saved meals, symptoms, and lifestyle entries with simple
            time-based filtering.
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

function getDateKey(dateString: string) {
  const date = new Date(dateString);
  if (!Number.isFinite(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function formatTimeValue(timeValue: string | null | undefined) {
  if (!timeValue) return "Time not logged";
  const match = timeValue.match(/^(\d{2}):(\d{2})/);
  if (!match) return timeValue;

  const [hours, minutes] = match.slice(1).map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCreatedAt(dateString: string) {
  const date = new Date(dateString);
  if (!Number.isFinite(date.getTime())) return dateString;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getRelativeSectionLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return dateKey;

  const today = getStartOfToday();
  const differenceMs = today.getTime() - date.getTime();
  const dayDifference = Math.round(differenceMs / (24 * 60 * 60 * 1000));

  if (dayDifference <= 0) return "Today";
  if (dayDifference === 1) return "Yesterday";
  return `${dayDifference} days ago`;
}

function getSymptomNames(entry: SymptomEntry) {
  const symptoms: string[] = [];
  if (entry.fatigue) symptoms.push("Fatigue");
  if (entry.cravings) symptoms.push("Cravings");
  if (entry.bloating) symptoms.push("Bloating");
  if (entry.mood_change) symptoms.push("Mood change");
  return symptoms;
}

function extractSeverity(notes: string | null) {
  if (!notes) return null;
  const match = notes.match(/Severity:\s*(.+)/i);
  return match?.[1]?.trim() ?? null;
}

export default function HistoryPage() {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<HistoryTab>("meals");
  const [activeFilter, setActiveFilter] = useState<DateFilter>("last7");
  const [pickedDate, setPickedDate] = useState("");
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [symptomEntries, setSymptomEntries] = useState<SymptomEntry[]>([]);
  const [lifestyleEntries, setLifestyleEntries] = useState<LifestyleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadHistoryData() {
      const token = Cookies.get("access_token");
      if (!token) {
        setLoadError("You need to be logged in to view history.");
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
        setLoadError("Unable to load history right now.");
        setIsLoading(false);
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
      setIsLoading(false);
    }

    loadHistoryData();
  }, []);

  const visibleEntries = useMemo(() => {
    const source =
      activeTab === "meals"
        ? mealEntries
        : activeTab === "symptoms"
          ? symptomEntries
          : lifestyleEntries;

    const today = getStartOfToday();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return source.filter((entry) => {
      const entryDate = new Date(entry.created_at);
      if (!Number.isFinite(entryDate.getTime())) return false;

      if (activeFilter === "today") {
        return getDateKey(entry.created_at) === getDateKey(today.toISOString());
      }

      if (activeFilter === "yesterday") {
        return (
          getDateKey(entry.created_at) === getDateKey(yesterday.toISOString())
        );
      }

      if (activeFilter === "last7") {
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - 6);
        return entryDate >= cutoff;
      }

      if (activeFilter === "last30") {
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - 29);
        return entryDate >= cutoff;
      }

      if (!pickedDate) return false;
      return getDateKey(entry.created_at) === pickedDate;
    });
  }, [
    activeFilter,
    activeTab,
    lifestyleEntries,
    mealEntries,
    pickedDate,
    symptomEntries,
  ]);

  const groupedEntries = useMemo(() => {
    const grouped = new Map<string, typeof visibleEntries>();

    visibleEntries.forEach((entry) => {
      const dateKey = getDateKey(entry.created_at);
      const current = grouped.get(dateKey) ?? [];
      current.push(entry);
      grouped.set(dateKey, current);
    });

    return [...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [visibleEntries]);

  const emptyMessage =
    activeTab === "meals"
      ? "No meal entries for this period."
      : activeTab === "symptoms"
        ? "No symptom entries for this period."
        : "No lifestyle entries for this period.";

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
                    History
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#4f2550] md:text-4xl">
                    Past logging history
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#69536d] md:text-base">
                    Review saved meals, symptoms, and lifestyle records with
                    simple timeline filters and date-based grouping.
                  </p>
                </div>
              </div>

              {loadError ? (
                <p className="mt-4 rounded-2xl bg-[#fff0f3] px-4 py-3 text-sm font-medium text-[#a22b52]">
                  {loadError}
                </p>
              ) : null}

              <section className="mt-8 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <Card title="History view">
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["meals", "Meals"],
                        ["symptoms", "Symptoms"],
                        ["lifestyle", "Lifestyle"],
                      ].map(([value, label]) => {
                        const isActive = activeTab === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setActiveTab(value as HistoryTab)}
                            className={`rounded-2xl border px-4 py-4 text-left transition ${
                              isActive
                                ? "border-[#8a3fd8] bg-[linear-gradient(135deg,#fff7fa_0%,#f4edf7_100%)] shadow-[0_12px_30px_rgba(138,63,216,0.14)] ring-2 ring-[#e8d8fb]"
                                : "border-transparent bg-[#fcf6fa]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`min-w-0 text-sm font-semibold ${
                                  isActive
                                    ? "text-[#4f2550]"
                                    : "text-[#5f2f60]"
                                }`}
                              >
                                {label}
                              </span>
                              <span
                                className={`shrink-0 whitespace-nowrap text-[11px] ${
                                  isActive
                                    ? "font-semibold text-[#7b3fc8]"
                                    : "text-[#9b809c]"
                                }`}
                              >
                                {isActive ? "On" : "View"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ["today", "Today"],
                        ["yesterday", "Yesterday"],
                        ["last7", "Last 7 days"],
                        ["last30", "Last 30 days"],
                        ["pickDate", "Pick date"],
                      ].map(([value, label]) => {
                        const isActive = activeFilter === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setActiveFilter(value as DateFilter)}
                            className={`rounded-2xl border px-4 py-4 text-left transition ${
                              isActive
                                ? "border-[#8a3fd8] bg-[linear-gradient(135deg,#fff7fa_0%,#f4edf7_100%)] shadow-[0_12px_30px_rgba(138,63,216,0.14)] ring-2 ring-[#e8d8fb]"
                                : "border-transparent bg-[#fcf6fa]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`min-w-0 text-sm font-semibold ${
                                  isActive
                                    ? "text-[#4f2550]"
                                    : "text-[#5f2f60]"
                                }`}
                              >
                                {value === "pickDate" ? "📅 Pick date" : label}
                              </span>
                              <span
                                className={`shrink-0 whitespace-nowrap text-[11px] ${
                                  isActive
                                    ? "font-semibold text-[#7b3fc8]"
                                    : "text-[#9b809c]"
                                }`}
                              >
                                {isActive ? "On" : "Filter"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {activeFilter === "pickDate" ? (
                      <div className="rounded-[22px] bg-[#fcf6fa] p-4">
                        <label
                          htmlFor="pickedDate"
                          className="text-sm font-semibold text-[#5f2f60]"
                        >
                          Select exact date
                        </label>
                        <input
                          id="pickedDate"
                          type="date"
                          value={pickedDate}
                          onChange={(e) => setPickedDate(e.target.value)}
                          className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-white px-4 py-3 text-sm text-[#5f2f60] outline-none"
                        />
                      </div>
                    ) : null}
                  </div>
                </Card>

                <Card title="Timeline">
                  {isLoading ? (
                    <p className="text-sm leading-7 text-[#695c70]">
                      Loading saved history...
                    </p>
                  ) : groupedEntries.length === 0 ? (
                    <div className="rounded-[22px] bg-[#fcf6fa] px-4 py-4 text-sm leading-7 text-[#695c70]">
                      {emptyMessage}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {groupedEntries.map(([dateKey, entries]) => (
                        <section key={dateKey} className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-base font-bold text-[#592b5a]">
                              {getRelativeSectionLabel(dateKey)}
                            </p>
                            <span className="rounded-full bg-[#fcf6fa] px-3 py-2 text-xs font-semibold text-[#8a3fd8]">
                              {dateKey}
                            </span>
                          </div>

                          {entries.map((entry) => {
                            if (activeTab === "meals") {
                              const mealEntry = entry as MealEntry;

                              return (
                                <div
                                  key={mealEntry.id}
                                  className="rounded-[22px] bg-[#fcf6fa] p-4"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="text-sm font-semibold text-[#592b5a]">
                                        {mealEntry.foods_text || "Meal entry"}
                                      </p>
                                      <p className="mt-1 text-sm text-[#695c70]">
                                        {mealEntry.meal_type || "Meal type not set"}
                                      </p>
                                    </div>
                                    <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#8a3fd8] shadow-sm">
                                      {formatTimeValue(mealEntry.meal_time)}
                                    </span>
                                  </div>

                                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <p className="text-sm text-[#695c70]">
                                      Glycaemic band:{" "}
                                      <span className="font-semibold text-[#5f2f60]">
                                        {mealEntry.glycaemic_band ?? "Not classified"}
                                      </span>
                                    </p>
                                    <p className="text-sm text-[#695c70]">
                                      Saved:{" "}
                                      <span className="font-semibold text-[#5f2f60]">
                                        {formatCreatedAt(mealEntry.created_at)}
                                      </span>
                                    </p>
                                  </div>

                                  {mealEntry.notes ? (
                                    <p className="mt-3 text-sm leading-6 text-[#695c70]">
                                      {mealEntry.notes}
                                    </p>
                                  ) : null}
                                </div>
                              );
                            }

                            if (activeTab === "symptoms") {
                              const symptomEntry = entry as SymptomEntry;
                              const symptomNames = getSymptomNames(symptomEntry);

                              return (
                                <div
                                  key={symptomEntry.id}
                                  className="rounded-[22px] bg-[#fcf6fa] p-4"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="text-sm font-semibold text-[#592b5a]">
                                        {symptomNames.join(", ") || "No symptoms selected"}
                                      </p>
                                      <p className="mt-1 text-sm text-[#695c70]">
                                        Severity:{" "}
                                        {extractSeverity(symptomEntry.notes) ?? "Not recorded"}
                                      </p>
                                    </div>
                                    <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#8a3fd8] shadow-sm">
                                      {formatTimeValue(symptomEntry.symptom_time)}
                                    </span>
                                  </div>

                                  <p className="mt-3 text-sm text-[#695c70]">
                                    Saved:{" "}
                                    <span className="font-semibold text-[#5f2f60]">
                                      {formatCreatedAt(symptomEntry.created_at)}
                                    </span>
                                  </p>

                                  {symptomEntry.notes ? (
                                    <p className="mt-3 text-sm leading-6 text-[#695c70]">
                                      {symptomEntry.notes}
                                    </p>
                                  ) : null}
                                </div>
                              );
                            }

                            const lifestyleEntry = entry as LifestyleEntry;

                            return (
                              <div
                                key={lifestyleEntry.id}
                                className="rounded-[22px] bg-[#fcf6fa] p-4"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-sm font-semibold text-[#592b5a]">
                                      Mood: {lifestyleEntry.mood ?? "Not logged"}
                                    </p>
                                    <p className="mt-1 text-sm text-[#695c70]">
                                      Stress:{" "}
                                      {lifestyleEntry.stress_level ?? "Not logged"}
                                    </p>
                                  </div>
                                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#8a3fd8] shadow-sm">
                                    {formatTimeValue(lifestyleEntry.lifestyle_time)}
                                  </span>
                                </div>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                  <p className="text-sm text-[#695c70]">
                                    Sleep:{" "}
                                    <span className="font-semibold text-[#5f2f60]">
                                      {lifestyleEntry.sleep_hours ?? "Not logged"} h
                                    </span>
                                  </p>
                                  <p className="text-sm text-[#695c70]">
                                    Exercise:{" "}
                                    <span className="font-semibold text-[#5f2f60]">
                                      {lifestyleEntry.exercise_minutes ?? "Not logged"} min
                                    </span>
                                  </p>
                                  <p className="text-sm text-[#695c70]">
                                    Water:{" "}
                                    <span className="font-semibold text-[#5f2f60]">
                                      {lifestyleEntry.water_litres ?? "Not logged"} L
                                    </span>
                                  </p>
                                  <p className="text-sm text-[#695c70]">
                                    Saved:{" "}
                                    <span className="font-semibold text-[#5f2f60]">
                                      {formatCreatedAt(lifestyleEntry.created_at)}
                                    </span>
                                  </p>
                                </div>

                                {lifestyleEntry.activity_notes ? (
                                  <p className="mt-3 text-sm leading-6 text-[#695c70]">
                                    {lifestyleEntry.activity_notes}
                                  </p>
                                ) : null}
                              </div>
                            );
                          })}
                        </section>
                      ))}
                    </div>
                  )}
                </Card>
              </section>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

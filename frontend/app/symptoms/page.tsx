"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth";

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
                  item.label === "Symptoms"
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
          <p className="text-sm font-semibold">Symptoms workflow</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Capture repeatable symptom events in a structured way for later
            comparison against meals and lifestyle patterns.
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

const symptomItems = [
  "Fatigue",
  "Cravings",
  "Bloating",
  "Mood change",
] as const;

const severityLevels = ["Low", "Moderate", "High"] as const;

export default function SymptomsPage() {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState("Moderate");
  const [symptomTime, setSymptomTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom],
    );
  }

  function resetSymptomForm() {
    setSelectedSymptoms([]);
    setSeverity("Moderate");
    setSymptomTime("");
    setNotes("");
  }

  async function handleSaveSymptomEntry() {
    const token = Cookies.get("access_token");
    if (!token) {
      setSaveError("You need to be logged in to save a symptom entry.");
      return;
    }

    if (selectedSymptoms.length === 0) {
      setSaveError("Please select at least one symptom before saving.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");

    const combinedNotes = [
      `Severity: ${severity}`,
      `Notes: ${notes || "None"}`,
    ].join("\n");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/logs/symptoms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fatigue: selectedSymptoms.includes("Fatigue"),
          cravings: selectedSymptoms.includes("Cravings"),
          bloating: selectedSymptoms.includes("Bloating"),
          mood_change: selectedSymptoms.includes("Mood change"),
          notes: combinedNotes,
          symptom_time: symptomTime || null,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setSaveError(data.detail ?? "Unable to save symptom entry.");
      setIsSaving(false);
      return;
    }

    setSaveMessage("Symptom entry saved successfully.");
    resetSymptomForm();
    setIsSaving(false);
  }

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
                    Symptoms module
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#4f2550] md:text-4xl">
                    Structured symptom entry
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#69536d] md:text-base">
                    Capture symptom events in a way that is easy to repeat and
                    suitable for later time-based behavioural analysis.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSymptomEntry}
                  disabled={isSaving}
                  className="w-full rounded-2xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                >
                  {isSaving ? "Saving..." : "Save symptom entry"}
                </button>
              </div>

              {saveMessage ? (
                <p className="mt-4 rounded-2xl bg-[#edf7f0] px-4 py-3 text-sm font-medium text-[#256944]">
                  {saveMessage}
                </p>
              ) : null}

              {saveError ? (
                <p className="mt-4 rounded-2xl bg-[#fff0f3] px-4 py-3 text-sm font-medium text-[#a22b52]">
                  {saveError}
                </p>
              ) : null}

              <section className="mt-8 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
                <Card title="Symptom form">
                  <div className="space-y-4">
                    {symptomItems.map((symptom) => {
                      const isSelected = selectedSymptoms.includes(symptom);

                      return (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => toggleSymptom(symptom)}
                          className={`w-full rounded-[22px] p-4 text-left transition ${
                            isSelected
                              ? "bg-[linear-gradient(135deg,#fff7fa_0%,#f4edf7_100%)] shadow-sm"
                              : "bg-[#fcf6fa]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-base font-bold text-[#592b5a]">
                                {symptom}
                              </p>
                              <p className="mt-1 text-sm text-[#695c70]">
                                Toggle whether this symptom is present in the
                                current log.
                              </p>
                            </div>
                            <div
                              className={`h-7 w-12 rounded-full p-1 transition ${
                                isSelected ? "bg-[#8a3fd8]" : "bg-[#ead8ea]"
                              }`}
                            >
                              <div
                                className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
                                  isSelected ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <div className="space-y-5">
                  <Card title="Severity">
                    <div className="space-y-3">
                      {severityLevels.map((level) => {
                        const isActive = severity === level;

                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setSeverity(level)}
                            className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                              isActive
                                ? "border-[#8a3fd8] bg-[linear-gradient(135deg,#fff7fa_0%,#f4edf7_100%)] shadow-[0_12px_30px_rgba(138,63,216,0.14)] ring-2 ring-[#e8d8fb]"
                                : "border-transparent bg-[#fcf6fa]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                    isActive
                                      ? "bg-[#8a3fd8] text-white"
                                      : "bg-white text-[#b998c8]"
                                  }`}
                                >
                                  {isActive ? "✓" : ""}
                                </span>
                                <span
                                  className={`text-sm font-semibold ${
                                    isActive
                                      ? "text-[#4f2550]"
                                      : "text-[#5f2f60]"
                                  }`}
                                >
                                  {level}
                                </span>
                              </div>
                              <span
                                className={`text-xs ${
                                  isActive
                                    ? "font-semibold text-[#7b3fc8]"
                                    : "text-[#9b809c]"
                                }`}
                              >
                                {isActive ? "Selected" : "Option"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                  <Card title="Log details">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="symptomTime"
                          className="text-sm font-semibold text-[#5f2f60]"
                        >
                          Symptom time
                        </label>
                        <input
                          id="symptomTime"
                          type="time"
                          value={symptomTime}
                          onChange={(e) => setSymptomTime(e.target.value)}
                          className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-[#fcf6fa] px-4 py-3 text-sm text-[#5f2f60] outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="symptomNotes"
                          className="text-sm font-semibold text-[#5f2f60]"
                        >
                          Notes
                        </label>
                        <textarea
                          id="symptomNotes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={5}
                          placeholder="Add any supporting context about what you felt, when it started, or what may have contributed."
                          className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-[#fcf6fa] px-4 py-3 text-sm text-[#5f2f60] outline-none placeholder:text-[#9b809c]"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

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
                  item.label === "Meals"
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
          <p className="text-sm font-semibold">Meals workflow</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Capture meal images, review AI detections, and save confirmed meal
            records in a focused workspace.
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

type Detection = {
  class_id: number;
  label: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
};

type SavedMealClassification = {
  glycaemicBand: string | null;
  metabolicSummary: string | null;
  foodsText: string;
};

function parseConfirmedFoods(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function formatConfirmedFoods(foods: string[]) {
  return foods.join(", ");
}

export default function MealsPage() {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [confirmedFoodsInput, setConfirmedFoodsInput] = useState("");
  const [mealType, setMealType] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [savedClassification, setSavedClassification] =
    useState<SavedMealClassification | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleRunPrediction() {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError("");
    setSaveMessage("");
    setSaveError("");
    setSavedClassification(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/ai/predict`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const detail =
        typeof data.detail === "string"
          ? data.detail
          : "Unable to run AI prediction.";
      const friendlyMessage = detail.toLowerCase().includes("not enabled")
        ? "AI meal prediction is not available right now. You can still enter the foods manually and save the meal."
        : detail;

      setUploadError(friendlyMessage);
      setIsUploading(false);
      return;
    }

    setDetections(Array.isArray(data.detections) ? data.detections : []);
    setConfirmedFoodsInput("");
    setIsUploading(false);
  }

  function handleConfirmFood(label: string) {
    const current = parseConfirmedFoods(confirmedFoodsInput);
    const normalisedCurrent = current.map((item) => item.toLowerCase());
    const nextFoods = normalisedCurrent.includes(label.toLowerCase())
      ? current
      : [...current, label];
    setConfirmedFoodsInput(formatConfirmedFoods(nextFoods));
  }

  function handleRemovePrediction(label: string) {
    setDetections((current) => current.filter((item) => item.label !== label));
  }

  function resetMealForm() {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setUploadError("");
    setDetections([]);
    setConfirmedFoodsInput("");
    setMealType("");
    setMealTime("");
    setNotes("");
  }

  async function handleSaveMealEntry() {
    const token = Cookies.get("access_token");
    if (!token) {
      setSaveError("You need to be logged in to save a meal entry.");
      return;
    }

    if (!mealType.trim()) {
      setSaveError("Please enter a meal type before saving.");
      return;
    }

    const parsedConfirmedFoods = parseConfirmedFoods(confirmedFoodsInput);

    if (parsedConfirmedFoods.length === 0) {
      setSaveError("Please confirm at least one food before saving.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/logs/meals`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          meal_type: mealType,
          foods_text: parsedConfirmedFoods.join(", "),
          image_url: null,
          notes,
          meal_time: mealTime || null,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setSaveError(data.detail ?? "Unable to save meal entry.");
      setIsSaving(false);
      return;
    }

    setSavedClassification({
      glycaemicBand: data.glycaemic_band ?? null,
      metabolicSummary: data.metabolic_summary ?? null,
      foodsText: data.foods_text ?? parsedConfirmedFoods.join(", "),
    });
    setSaveMessage("Meal entry saved successfully.");
    resetMealForm();
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
                  Meals
                </p>
                  <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#4f2550] md:text-4xl">
                  Meal logging workspace
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#69536d] md:text-base">
                  Upload a meal image, review AI results, confirm the meal
                  details, and save the final entry for later symptom and
                  lifestyle analysis.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveMealEntry}
                disabled={isSaving}
                className="w-full rounded-2xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                {isSaving ? "Saving..." : "Save meal entry"}
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

            <section className="mt-8 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <Card title="Upload image">
                <div className="rounded-[24px] border-2 border-dashed border-[#d7b9d8] bg-[linear-gradient(135deg,#fff9fb_0%,#f5edf6_100%)] p-5 text-center sm:p-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-2xl text-[#6b2e73] shadow-sm">
                    ⤴
                  </div>
                  <p className="mt-5 text-lg font-bold text-[#592b5a]">
                    Choose a meal image
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#695c70]">
                    This area will connect to the AI prediction endpoint and
                    show the uploaded meal preview.
                  </p>

                  <label
                    htmlFor="mealImage"
                    className="mt-5 inline-block w-full cursor-pointer rounded-2xl border border-[#e6cfe2] bg-white px-5 py-3 text-sm font-semibold text-[#6b2e73] shadow-sm sm:w-auto"
                  >
                    Browse file
                  </label>

                  <input
                    id="mealImage"
                    type="file"
                    accept="image/*"
                    aria-label="Meal image"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                      }
                      setSelectedFile(file);
                      setPreviewUrl(file ? URL.createObjectURL(file) : "");
                      setSaveMessage("");
                      setSaveError("");
                    }}
                  />

                  <p className="mt-4 text-sm text-[#695c70]">
                    {selectedFile ? selectedFile.name : "No file selected"}
                  </p>

                  {previewUrl ? (
                    <div className="mt-5 overflow-hidden rounded-[24px] border border-[#ecd8ea] bg-white p-3 shadow-sm">
                    <img
                      src={previewUrl}
                      alt="Selected meal preview"
                      className="h-48 w-full rounded-[18px] object-cover sm:h-56"
                    />
                  </div>
                ) : null}

                  <button
                    type="button"
                    onClick={handleRunPrediction}
                    disabled={!selectedFile || isUploading}
                    className="mt-5 w-full cursor-pointer rounded-2xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {isUploading
                      ? "Running prediction..."
                      : "Run AI Prediction"}
                  </button>
                </div>
              </Card>

              <Card title="AI prediction">
                <div className="space-y-3">
                  <div className="rounded-2xl bg-[#fcf6fa] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#5f2f60]">
                          Detected foods
                        </p>
                        <p className="mt-1 text-sm text-[#8b748d]">
                          Prediction results will appear here.
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#8a3fd8] shadow-sm">
                        {detections.length > 0 ? "AI complete" : "Awaiting AI"}
                      </span>
                    </div>
                  </div>

                  {uploadError ? (
                    <p className="rounded-2xl bg-[#fff0f3] px-4 py-3 text-sm font-medium text-[#a22b52]">
                      {uploadError}
                    </p>
                  ) : null}

                  {detections.length > 0 ? (
                    detections.map((detection) => (
                      <div
                        key={`${detection.label}-${detection.confidence}`}
                        className="rounded-2xl bg-white p-4 shadow-sm"
                      >
                        <p className="text-sm font-semibold text-[#592b5a]">
                          {detection.label}
                        </p>
                        <p className="mt-1 text-sm text-[#695c70]">
                          Confidence: {detection.confidence.toFixed(2)}
                        </p>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => handleConfirmFood(detection.label)}
                            className="rounded-xl bg-[#5a2858] px-4 py-2 text-sm font-semibold text-white"
                          >
                            Confirm {detection.label}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemovePrediction(detection.label)
                            }
                            className="rounded-xl border border-[#e6cfe2] bg-white px-4 py-2 text-sm font-semibold text-[#6b2e73]"
                          >
                            Remove {detection.label}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-sm font-semibold text-[#592b5a]">
                          Rice
                        </p>
                        <p className="mt-1 text-sm text-[#695c70]">
                          Confidence: 0.92
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-sm font-semibold text-[#592b5a]">
                          Fried rice
                        </p>
                        <p className="mt-1 text-sm text-[#695c70]">
                          Confidence: 0.28
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <Card title="Confirm meal details">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] bg-[#fcf6fa] p-4">
                    <label
                      htmlFor="mealType"
                      className="text-sm font-semibold text-[#5f2f60]"
                    >
                      Meal type
                    </label>
                    <input
                      id="mealType"
                      type="text"
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      placeholder="Breakfast, lunch, dinner, snack"
                      className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-white px-4 py-3 text-sm text-[#5f2f60] outline-none placeholder:text-[#9b809c]"
                    />
                  </div>

                  <div className="rounded-[22px] bg-[#fcf6fa] p-4">
                    <label
                      htmlFor="confirmedFoods"
                      className="text-sm font-semibold text-[#5f2f60]"
                    >
                      Confirmed foods
                    </label>
                    <input
                      id="confirmedFoods"
                      type="text"
                      value={confirmedFoodsInput}
                      onChange={(e) => {
                        setConfirmedFoodsInput(e.target.value);
                      }}
                      placeholder="Rice, chicken, green salad"
                      className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-white px-4 py-3 text-sm text-[#5f2f60] outline-none placeholder:text-[#9b809c]"
                    />
                    <p className="mt-2 text-xs leading-5 text-[#8b748d]">
                      You can edit this list manually if the AI misses part of
                      the meal. Separate foods with commas.
                    </p>
                  </div>

                  <div className="rounded-[22px] bg-[#fcf6fa] p-4">
                    <label
                      htmlFor="mealTime"
                      className="text-sm font-semibold text-[#5f2f60]"
                    >
                      Meal time
                    </label>
                    <input
                      id="mealTime"
                      type="time"
                      value={mealTime}
                      onChange={(e) => setMealTime(e.target.value)}
                      className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-white px-4 py-3 text-sm text-[#5f2f60] outline-none"
                    />
                  </div>

                  <div className="rounded-[22px] bg-[#fcf6fa] p-4">
                    <label
                      htmlFor="notes"
                      className="text-sm font-semibold text-[#5f2f60]"
                    >
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Add any context about hunger, cravings, portions, or how you felt."
                      className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-white px-4 py-3 text-sm text-[#5f2f60] outline-none placeholder:text-[#9b809c]"
                    />
                  </div>
                </div>
              </Card>

              <Card title="Metabolic classification">
                <div className="space-y-3">
                  {savedClassification ? (
                    <>
                      <div className="rounded-2xl bg-[linear-gradient(135deg,#fff7fa_0%,#f4edf7_100%)] px-4 py-4 text-sm text-[#695c70]">
                        <p className="font-semibold text-[#592b5a]">
                          Glycaemic band
                        </p>
                        <p className="mt-1 capitalize">
                          {savedClassification.glycaemicBand ?? "Unknown"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[linear-gradient(135deg,#fff7fa_0%,#f4edf7_100%)] px-4 py-4 text-sm text-[#695c70]">
                        <p className="font-semibold text-[#592b5a]">
                          Confirmed foods used for classification
                        </p>
                        <p className="mt-1">
                          {savedClassification.foodsText}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[linear-gradient(135deg,#fff7fa_0%,#f4edf7_100%)] px-4 py-4 text-sm text-[#695c70]">
                        <p className="font-semibold text-[#592b5a]">
                          Metabolic summary
                        </p>
                        <p className="mt-1">
                          {savedClassification.metabolicSummary ??
                            "No metabolic summary available."}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl bg-[linear-gradient(135deg,#fff7fa_0%,#f4edf7_100%)] px-4 py-4 text-sm text-[#695c70]">
                        Save a meal entry to see the glycaemic band here.
                      </div>
                      <div className="rounded-2xl bg-[linear-gradient(135deg,#fff7fa_0%,#f4edf7_100%)] px-4 py-4 text-sm text-[#695c70]">
                        The metabolic summary will be generated from the final
                        confirmed foods you save.
                      </div>
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

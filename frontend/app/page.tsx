"use client";

import { useState } from "react";
import Link from "next/link";

const highlightCards = [
  ["Smart logging", "Meals, symptoms, and habits"],
  ["Gentle insights", "Patterns explained simply"],
  ["Private by design", "You stay in control"],
];

const featureCards = [
  {
    icon: "◌",
    title: "Symptom dashboard",
    text: "Monitor fatigue, cravings, bloating, mood, and daily symptom changes with clean visual summaries.",
  },
  {
    icon: "✦",
    title: "AI-assisted meal capture",
    text: "Make logging faster with image support and structured meal entries that feel organised instead of overwhelming.",
  },
  {
    icon: "◐",
    title: "Routine tracking",
    text: "Record sleep, hydration, exercise, stress, and habits to build a fuller wellbeing picture across the week.",
  },
  {
    icon: "✓",
    title: "Privacy-first trust",
    text: "A professional health-tech experience that feels secure, supportive, and transparent from the first screen.",
  },
];

const reminders = [
  "Hydration check at 2:00 PM",
  "Evening symptom reflection",
  "Sleep routine reminder",
];

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.24),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_24%),linear-gradient(180deg,_#fffdfd_0%,_#fbf6f8_35%,_#f6eef4_100%)] text-slate-900">
      <header className="border-b border-[#d8c4d8] bg-[linear-gradient(180deg,#ffffff_0%,#fbf3f8_100%)] shadow-[0_12px_32px_rgba(118,78,116,0.10)] backdrop-blur">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <nav className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#5a2858_0%,#6b2e73_100%)] text-white shadow-sm">
                ♡
              </div>
              <div>
                <p className="text-[26px] font-extrabold tracking-tight text-[#4f2550]">
                  myPCOS
                </p>
                <p className="text-xs text-[#8d7391]">
                  
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-3 text-sm font-semibold text-[#6f5a72] md:flex">
              <a href="#features" className="rounded-full px-4 py-2 transition duration-200 hover:bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] hover:text-white hover:shadow-[0_10px_24px_rgba(207,65,202,0.20)]">
                Features
              </a>
              <a href="#workflow" className="rounded-full px-4 py-2 transition duration-200 hover:bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] hover:text-white hover:shadow-[0_10px_24px_rgba(207,65,202,0.20)]">
                Workflow
              </a>
              <a href="#insights" className="rounded-full px-4 py-2 transition duration-200 hover:bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] hover:text-white hover:shadow-[0_10px_24px_rgba(207,65,202,0.20)]">
                Insights
              </a>
              <a href="#faq" className="rounded-full px-4 py-2 transition duration-200 hover:bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] hover:text-white hover:shadow-[0_10px_24px_rgba(207,65,202,0.20)]">
                Support
              </a>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className="rounded-full border border-[#dcc6dc] bg-white px-5 py-2.5 text-sm font-semibold text-[#5a2858] shadow-sm transition hover:border-[#cba9ca] hover:bg-[#fcf6fa]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(207,65,202,0.28)] transition hover:opacity-95"
              >
                Get started
              </Link>
            </div>

            <button
              type="button"
              aria-label="Toggle navigation"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ddcade] bg-[#fff7fb] text-[#5a2858] shadow-sm transition hover:bg-[#fcf0f7] md:hidden"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {isMobileMenuOpen ? (
            <div className="mt-4 space-y-3 border-t border-[#f0e2ee] pt-4 md:hidden">
              <div className="grid gap-2 text-sm font-medium text-[#6f5a72]">
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-3 py-2 transition hover:bg-[#fcf6fa]">
                  Features
                </a>
                <a href="#workflow" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-3 py-2 transition hover:bg-[#fcf6fa]">
                  Workflow
                </a>
                <a href="#insights" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-3 py-2 transition hover:bg-[#fcf6fa]">
                  Insights
                </a>
                <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="rounded-2xl px-3 py-2 transition hover:bg-[#fcf6fa]">
                  Support
                </a>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/login"
                  className="rounded-2xl border border-[#dcc6dc] bg-white px-4 py-3 text-center text-sm font-semibold text-[#5a2858] shadow-sm transition hover:border-[#cba9ca] hover:bg-[#fcf6fa]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-2xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_12px_30px_rgba(207,65,202,0.28)] transition hover:opacity-95"
                >
                  Get started
                </Link>
              </div>
            </div>
          ) : null}
          </nav>
        </div>
      </header>

      <main className="px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <section className="relative mx-auto grid max-w-7xl gap-14 pb-20 pt-6 lg:grid-cols-2 lg:pb-28 lg:pt-12">
          <div className="relative z-10">
            {/* <div className="inline-flex rounded-full bg-[#f5e8f4] px-4 py-1 text-sm font-semibold text-[#8a3f88]">
              Built for AI-assisted PCOS self-management
            </div> */}

            <h1 className="mt-6 max-w-2xl text-[2.55rem] font-semibold leading-tight tracking-tight text-[#2e1830] sm:text-[3.2rem] lg:text-[3.35rem]">
              A calmer way to log meals, symptoms, and lifestyle patterns in{" "}
              <span className="bg-gradient-to-r from-[#8a3fd8] via-[#cf41ca] to-[#e36a95] bg-clip-text text-transparent">
                one structured workspace
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#6f5a72]">
              myPCOS helps users capture AI-assisted meal records, structured
              symptom entries, and daily lifestyle habits, then review repeated
              weekly behavioural patterns through non-diagnostic feedback.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-6 py-4 text-base font-semibold text-white shadow-[0_14px_36px_rgba(207,65,202,0.26)] transition hover:opacity-95"
              >
                Start tracking
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full border border-[#d7c0d4] bg-white px-6 py-4 text-base font-semibold text-[#4f2550] shadow-sm transition hover:border-[#c4a7c2] hover:bg-[#fcf6fa]"
              >
                See how it works
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlightCards.map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-lg shadow-pink-100/50 backdrop-blur"
                >
                  <p className="font-medium text-[#4f2550]">{title}</p>
                  <p className="mt-1 text-sm text-[#7b667c]">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-12 h-44 w-44 rounded-full bg-pink-300/40 blur-3xl" />
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-300/30 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-[0_30px_80px_rgba(236,72,153,0.18)] backdrop-blur-xl">
              <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[1.7rem] bg-gradient-to-br from-[#4a2348] via-[#6f2d72] to-[#9a4a86] p-6 text-white shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white/70">Weekly logging view</p>
                      <h3 className="mt-2 text-2xl font-semibold">
                        Behaviour patterns, clearly visualised
                      </h3>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">⌁</div>
                  </div>

                  <div className="mt-6 grid grid-cols-7 gap-2">
                    {[52, 66, 48, 78, 71, 84, 75].map((height, index) => (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div className="flex h-40 w-full items-end rounded-full bg-white/10 p-1">
                          <div
                            className="w-full rounded-full bg-gradient-to-t from-[#cf41ca] via-[#d85db8] to-[#f0bfd9]"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60">
                          {["M", "T", "W", "T", "F", "S", "S"][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.7rem] bg-white p-5 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[#f5e8f4] p-3 text-[#8a3f88]">
                        ✿
                      </div>
                      <div>
                        <p className="font-medium text-[#4f2550]">Meal logging</p>
                        <p className="text-sm text-[#7b667c]">
                          AI image support + user confirmation
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#fff6fa] to-[#f8eef7] p-4 text-sm text-[#6f5a72]">
                      Confirm meals, save glycaemic classifications, and keep a
                      cleaner record for later review.
                    </div>
                  </div>

                  <div className="rounded-[1.7rem] bg-white p-5 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[#efe6fb] p-3 text-[#7d45bf]">
                        ✦
                      </div>
                      <div>
                        <p className="font-medium text-[#4f2550]">Structured review</p>
                        <p className="text-sm text-[#7b667c]">
                          Symptoms, lifestyle, and routine context
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {reminders.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-2xl bg-[#faf6fb] px-4 py-3 text-sm text-[#6f5a72]"
                        >
                          <span className="text-emerald-500">●</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto mt-2 max-w-7xl rounded-[34px] border border-white/65 bg-white/62 px-6 py-10 shadow-[0_18px_50px_rgba(118,78,116,0.08)] backdrop-blur sm:px-8 lg:px-10"
        >
          <div className="mb-8 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.18em] text-[#946183]">
              Platform features
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#4f2550] md:text-4xl">
              Designed around the actual workflow of the myPCOS application
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6f5a72] md:text-base">
              The platform combines AI-assisted meal capture, structured
              symptom and lifestyle logging, weekly history review, and
              non-diagnostic insight summaries in one connected experience.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.75rem] border border-white/80 bg-white/78 p-6 shadow-lg shadow-slate-200/60 backdrop-blur"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-[linear-gradient(180deg,#5a2858_0%,#6b2e73_100%)] p-3 text-white">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-[#4f2550]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#6f5a72]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className="mx-auto mt-8 max-w-7xl rounded-[34px] bg-white/78 px-6 py-10 shadow-[0_18px_50px_rgba(118,78,116,0.08)] sm:px-8 lg:px-10"
        >
          <div className="mb-8 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.18em] text-[#946183]">
              Workflow
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#4f2550] md:text-4xl">
              From meal capture to weekly pattern review
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6f5a72] md:text-base">
              myPCOS is built to reduce trial-and-error self-management by
              helping users log real daily behaviour and review repeated
              patterns more clearly over time.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              [
                "1. Capture meals",
                "Upload a meal image, review detections, confirm foods, and save a structured meal record with metabolic context.",
              ],
              [
                "2. Log symptoms and lifestyle",
                "Record symptoms, sleep, stress, hydration, exercise, and mood with timestamps that support better weekly comparison.",
              ],
              [
                "3. Review insights",
                "Use the dashboard, history, and insights pages to review repeated behaviour-symptom observations without medical diagnosis.",
              ],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-[28px] bg-[#fcf6fa] p-6 shadow-sm"
              >
                <p className="text-lg font-semibold text-[#4f2550]">{title}</p>
                <p className="mt-3 text-sm leading-7 text-[#6f5a72]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="insights"
          className="mx-auto mt-8 max-w-7xl rounded-[34px] bg-[linear-gradient(135deg,#fff8fb_0%,#f5edf7_100%)] px-6 py-10 shadow-[0_18px_50px_rgba(118,78,116,0.08)] sm:px-8 lg:px-10"
        >
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] bg-[#f8eef5] p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-[#8d7391]">
                Why this design works
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#4f2550]">
                Premium, calm, and easy to trust
              </h2>
              <p className="mt-4 max-w-xl leading-8 text-[#6f5a72]">
                myPCOS gives users a softer premium interface while still
                reflecting the real goal of the project: capturing structured
                behaviour data and turning repeated weekly records into more
                understandable self-management feedback.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm font-medium">
                <span className="rounded-full bg-white px-4 py-2">
                  Soft healthcare gradients
                </span>
                <span className="rounded-full bg-white px-4 py-2">
                  Premium product cards
                </span>
                <span className="rounded-full bg-white px-4 py-2">
                  Clear conversion path
                </span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                [
                  "Smart routines",
                  "Sleep, hydration, exercise, and meal consistency are easier to review in one place.",
                ],
                [
                  "Understanding patterns",
                  "Clear summaries help users notice possible relationships in their entries without medical claims.",
                ],
                [
                  "Welcoming design",
                  "Supportive colours and polished spacing create a premium health experience from the first screen.",
                ],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-[#4f2550]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6f5a72]">
                    {text}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#4f2550]">
                    Learn more <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer
        id="faq"
        className="border-t border-white/10 bg-gradient-to-br from-[#4a2348] via-[#6f2d72] to-[#9a4a86] text-white"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr] lg:px-8">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-white">
                ♡
              </div>
              <div>
                <p className="text-xs text-white/65">myPCOS</p>
                <p className="text-base font-semibold text-white">
                  Your personal PCOS companion
                </p>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/78">
              A modern PCOS web experience for tracking, understanding, and
              improving daily wellbeing with clarity and confidence.
            </p>
          </div>

          <div>
            <p className="font-semibold text-white">Product</p>
            <div className="mt-4 space-y-3 text-sm text-white/78">
              <p>Symptom tracker</p>
              <p>Meal logging</p>
              <p>Routine insights</p>
              <p>Health dashboard</p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-white">Company</p>
            <div className="mt-4 space-y-3 text-sm text-white/78">
              <p>About myPCOS</p>
              <p>Privacy</p>
              <p>Contact</p>
              <p>Support</p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-white">Stay informed</p>
            <div className="mt-4 flex gap-2">
              <input
                placeholder="Enter email"
                className="h-11 w-full rounded-full border border-white/18 bg-white/10 px-4 text-white outline-none placeholder:text-white/45"
              />
              <button className="rounded-full bg-white px-5 text-sm font-semibold text-[#5a2858] transition hover:bg-white/90">
                Join
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

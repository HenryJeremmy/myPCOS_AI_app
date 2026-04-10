"use client";

import { useEffect, useState } from "react";
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
    { label: "Overview", href: "/dashboard" },
    { label: "Meals", href: "/meals" },
    { label: "Symptoms", href: "/symptoms" },
    { label: "Lifestyle", href: "/lifestyle" },
    { label: "Insights", href: "/insights" },
    { label: "History", href: "/history" },
    { label: "Settings", href: "/settings" },
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
                item.label === "Settings"
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
          <p className="text-sm font-semibold">Settings workspace</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Review your profile details and manage account access in the same
            premium workspace as the rest of the app.
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
  tone = "default",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={`rounded-[28px] p-6 shadow-sm ${
        tone === "danger" ? "bg-[#fff4f6]" : "bg-white/88"
      }`}
    >
      <p
        className={`text-sm font-semibold uppercase tracking-[0.16em] ${
          tone === "danger" ? "text-[#b24f74]" : "text-[#9f6f9d]"
        }`}
      >
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setFirstName(user?.first_name ?? "");
    setLastName(user?.last_name ?? "");
  }, [user?.first_name, user?.last_name]);

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMessage("");
    setProfileError("");

    const token = Cookies.get("access_token");
    if (!token) {
      setProfileError("You are not authenticated.");
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setProfileError("First name and last name are required.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setProfileError(data.detail ?? "Unable to update profile.");
        return;
      }

      setFirstName(data.first_name ?? trimmedFirstName);
      setLastName(data.last_name ?? trimmedLastName);
      setProfileMessage("Profile updated successfully.");
    } catch {
      setProfileError("Unable to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    const token = Cookies.get("access_token");
    if (!token) {
      setPasswordError("You are not authenticated.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setPasswordError(data.detail ?? "Unable to update password.");
      return;
    }

    setPasswordMessage(data.message ?? "Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  }

  async function handleDeleteAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDeleteMessage("");
    setDeleteError("");

    const token = Cookies.get("access_token");
    if (!token) {
      setDeleteError("You are not authenticated.");
      return;
    }
    if (deleteConfirmation !== "DELETE") {
      setDeleteError("Type DELETE to confirm account removal.");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/v1/auth/delete-account`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setDeleteError(data.detail ?? "Unable to delete account.");
      return;
    }

    setDeleteMessage(data.message ?? "Account deleted successfully");
    setDeleteConfirmation("");
    logout();
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
                    Settings
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#4f2550] md:text-4xl">
                    Account settings
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#69536d] md:text-base">
                    Review your profile details, update your password, and
                    manage your account safely in one place.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <Card title="Profile Details">
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={handleUpdateProfile}>
                    {profileMessage ? (
                      <p className="rounded-2xl bg-[#edf8f1] px-4 py-3 text-sm font-medium text-[#256944] md:col-span-2">
                        {profileMessage}
                      </p>
                    ) : null}

                    {profileError ? (
                      <p className="rounded-2xl bg-[#fff1f4] px-4 py-3 text-sm font-medium text-[#a43f62] md:col-span-2">
                        {profileError}
                      </p>
                    ) : null}

                    <div className="rounded-[22px] bg-[#fcf6fa] p-4">
                      <label
                        htmlFor="firstName"
                        className="text-sm font-semibold text-[#5f2f60]"
                      >
                        First name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-white px-4 py-3 text-sm text-[#5f2f60] outline-none"
                      />
                    </div>

                    <div className="rounded-[22px] bg-[#fcf6fa] p-4">
                      <label
                        htmlFor="lastName"
                        className="text-sm font-semibold text-[#5f2f60]"
                      >
                        Last name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-white px-4 py-3 text-sm text-[#5f2f60] outline-none"
                      />
                    </div>

                    <div className="rounded-[22px] bg-[#fcf6fa] p-4 md:col-span-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-semibold text-[#5f2f60]"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        readOnly
                        value={user?.email ?? ""}
                        className="mt-3 w-full cursor-not-allowed rounded-2xl border border-[#ecd8ea] bg-[#f7edf4] px-4 py-3 text-sm text-[#7e657e] outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="rounded-2xl bg-[#5f2f60] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#522753] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSavingProfile ? "Updating..." : "Update profile"}
                      </button>
                    </div>
                  </form>
                </Card>

                <Card title="Change Password">
                  <form className="space-y-4" onSubmit={handleChangePassword}>
                    {passwordMessage ? (
                      <p className="rounded-2xl bg-[#edf8f1] px-4 py-3 text-sm font-medium text-[#256944]">
                        {passwordMessage}
                      </p>
                    ) : null}

                    {passwordError ? (
                      <p className="rounded-2xl bg-[#fff0f3] px-4 py-3 text-sm font-medium text-[#a22b52]">
                        {passwordError}
                      </p>
                    ) : null}

                    <div className="rounded-[22px] bg-[#fcf6fa] p-4">
                      <label
                        htmlFor="currentPassword"
                        className="text-sm font-semibold text-[#5f2f60]"
                      >
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-white px-4 py-3 text-sm text-[#4f2550] outline-none"
                      />
                    </div>

                    <div className="rounded-[22px] bg-[#fcf6fa] p-4">
                      <label
                        htmlFor="newPassword"
                        className="text-sm font-semibold text-[#5f2f60]"
                      >
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-white px-4 py-3 text-sm text-[#4f2550] outline-none"
                      />
                    </div>

                    <div className="rounded-[22px] bg-[#fcf6fa] p-4">
                      <label
                        htmlFor="confirmNewPassword"
                        className="text-sm font-semibold text-[#5f2f60]"
                      >
                        Confirm New Password
                      </label>
                      <input
                        id="confirmNewPassword"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="mt-3 w-full rounded-2xl border border-[#ecd8ea] bg-white px-4 py-3 text-sm text-[#4f2550] outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-2xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-4 py-3 text-sm font-semibold text-white shadow-md"
                    >
                      Update Password
                    </button>
                  </form>
                </Card>

                <Card title="Delete Account" tone="danger">
                  <p className="text-sm leading-7 text-[#6e4a57]">
                    Permanently remove your account and data.
                  </p>

                  <form className="mt-4 space-y-4" onSubmit={handleDeleteAccount}>
                    {deleteMessage ? (
                      <p className="rounded-2xl bg-[#edf8f1] px-4 py-3 text-sm font-medium text-[#256944]">
                        {deleteMessage}
                      </p>
                    ) : null}

                    {deleteError ? (
                      <p className="rounded-2xl bg-[#fff0f3] px-4 py-3 text-sm font-medium text-[#a22b52]">
                        {deleteError}
                      </p>
                    ) : null}

                    <div className="rounded-[22px] bg-white/80 p-4">
                      <label
                        htmlFor="deleteConfirmation"
                        className="text-sm font-semibold text-[#6e4a57]"
                      >
                        Type DELETE to confirm
                      </label>
                      <input
                        id="deleteConfirmation"
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="mt-3 w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-[#4f2550] outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-2xl bg-[linear-gradient(135deg,#b3325a,#e04f76)] px-4 py-3 text-sm font-semibold text-white shadow-md"
                    >
                      Delete Account
                    </button>
                  </form>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

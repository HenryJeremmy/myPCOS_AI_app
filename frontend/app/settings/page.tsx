"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");

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
      }
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
      }
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
      <div className="min-h-screen bg-[linear-gradient(135deg,#fbf6f8_0%,#f7edf2_40%,#f0e6f2_100%)] p-6">
        <div className="mx-auto max-w-4xl rounded-[32px] bg-white/90 p-8 shadow-[0_24px_60px_rgba(119,77,116,0.14)]">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#4f2550]">
            Settings
          </h1>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className="rounded-[24px] bg-[#fcf6fa] p-6">
              <h2 className="text-lg font-bold text-[#592b5a]">Profile Details</h2>
              <div className="mt-4 space-y-3 text-sm text-[#5f4a60]">
                <p>{user?.first_name}</p>
                <p>{user?.email}</p>
              </div>
            </section>

            <section className="rounded-[24px] bg-[#fcf6fa] p-6">
              <h2 className="text-lg font-bold text-[#592b5a]">Change Password</h2>

              <form className="mt-4 space-y-4" onSubmit={handleChangePassword}>
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

                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-medium text-[#5f4a60]"
                  >
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-[#4f2550] focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-[#5f4a60]"
                  >
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-[#4f2550] focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmNewPassword"
                    className="mb-2 block text-sm font-medium text-[#5f4a60]"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-[#4f2550] focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-2xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-4 py-2.5 text-sm font-semibold text-white shadow-md"
                >
                  Update Password
                </button>
              </form>
            </section>

            <section className="rounded-[24px] bg-[#fff4f6] p-6 md:col-span-2">
              <h2 className="text-lg font-bold text-[#8a2d4f]">Delete Account</h2>
              <p className="mt-4 text-sm text-[#6e4a57]">
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

                <div>
                  <label
                    htmlFor="deleteConfirmation"
                    className="mb-2 block text-sm font-medium text-[#6e4a57]"
                  >
                    Type DELETE to confirm
                  </label>
                  <input
                    id="deleteConfirmation"
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-[#4f2550] focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-2xl bg-[linear-gradient(135deg,#b3325a,#e04f76)] px-4 py-2.5 text-sm font-semibold text-white shadow-md"
                >
                  Delete Account
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

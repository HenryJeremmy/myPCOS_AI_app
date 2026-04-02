"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth";

export default function SettingsPage() {
  const { user } = useAuth();

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
              <p className="mt-4 text-sm text-[#5f4a60]">
                Update your password securely.
              </p>
            </section>

            <section className="rounded-[24px] bg-[#fff4f6] p-6 md:col-span-2">
              <h2 className="text-lg font-bold text-[#8a2d4f]">Delete Account</h2>
              <p className="mt-4 text-sm text-[#6e4a57]">
                Permanently remove your account and data.
              </p>
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

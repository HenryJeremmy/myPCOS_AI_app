import { AuthForm } from '@/components/auth-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Illustration Area */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="relative w-full h-96">
              {/* Decorative gradient shapes */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl" />
              {/* Illustration placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-48 h-48 mx-auto text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h3 className="text-2xl font-bold text-purple-700 mb-2">Your Wellness Awaits</h3>
                  <p className="text-slate-600">Track your health journey with confidence</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auth Card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-200/50 p-8 border border-pink-100">
            {/* Brand Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-2">
                myPCOS
              </h1>
              <p className="text-slate-600 text-sm">
                Track your meals, symptoms, and health patterns with confidence.
              </p>
            </div>

            {/* Auth Form */}
            <AuthForm mode="login" />

            {/* Navigate to Signup */}
            <div className="mt-6 text-center border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-purple-600 hover:text-purple-700 transition"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          Your health data is private and secure
        </p>
      </div>
    </div>
  );
}
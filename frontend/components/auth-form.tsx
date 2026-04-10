'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Eye, EyeOff, CheckCircle2, HeartPulse } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login, signup } = useAuth();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        router.push('/dashboard');
        onSuccess?.();
      } else {
        const result = await signup(email, password, firstName, lastName);
        setIsOtpSent(true);
        router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === 'login' ? 'Welcome Back!' : 'Join MyPCOS Today!';
  const subtitle = mode === 'login' ? 'Sign in to your account' : 'Create your free account';
  const submitLabel = mode === 'login' ? 'Sign In' : 'Create Account';
  const switchLabel = mode === 'login'
    ? 'Don’t have an account? Create one'
    : 'Already have an account? Sign in';
  const switchHref = mode === 'login' ? '/signup' : '/login';

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#fcf7fa_0%,#f4ebf1_42%,#ece2ee_100%)] shadow-2xl ring-1 ring-white/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(207,65,202,0.16),_transparent_55%)]" />
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative hidden md:flex items-center justify-center p-10">
            <div className="relative w-full max-w-xs rounded-2xl bg-white/76 p-6 shadow-xl backdrop-blur">
              <Link
                href="/"
                className="mb-4 flex items-center justify-center gap-2 text-3xl font-bold tracking-wide text-[#4f2550]"
              >
                <HeartPulse className="h-8 w-8 text-[#8a3fd8]" />
                myPCOS
              </Link>
              <p className="text-center text-sm text-[#6f5a72]">
                Track your meals, symptoms, and health patterns with confidence.
              </p>
              <div className="mt-6 h-36 rounded-xl bg-[linear-gradient(135deg,#fff6fa_0%,#f5ebf8_100%)] px-4 py-4">
                <div className="h-20 w-full rounded-xl bg-[linear-gradient(135deg,#d98bc1_0%,#b678d4_100%)]" />
              </div>
            </div>
          </div>

          <div className="relative px-6 py-10 sm:px-10 md:px-12 lg:px-14">
            <div className="mb-8 text-center">
              <Link
                href="/"
                aria-label="Go to landing page"
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-[#7d45bf] shadow-md ring-1 ring-white/70 transition hover:bg-white"
              >
                <HeartPulse size={28} />
              </Link>
              <h1 className="text-3xl font-bold text-[#4f2550]">{title}</h1>
              <p className="mt-2 text-sm text-[#6f5a72]">{subtitle}</p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              {mode === 'signup' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-[#5a2858]">First Name</label>
                    <input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      type="text"
                      placeholder="Jane"
                      className="w-full rounded-xl border border-[#e3cfdf] bg-white px-4 py-2.5 text-[#4f2550] focus:border-[#b678d4] focus:outline-none focus:ring-2 focus:ring-[#ead8fb]"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-[#5a2858]">Last Name</label>
                    <input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      type="text"
                      placeholder="Doe"
                      className="w-full rounded-xl border border-[#e3cfdf] bg-white px-4 py-2.5 text-[#4f2550] focus:border-[#b678d4] focus:outline-none focus:ring-2 focus:ring-[#ead8fb]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#5a2858]">Email Address</label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder=""
                  className="w-full rounded-xl border border-[#e3cfdf] bg-white px-4 py-2.5 text-[#4f2550] focus:border-[#b678d4] focus:outline-none focus:ring-2 focus:ring-[#ead8fb]"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#5a2858]">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#e3cfdf] bg-white px-4 py-2.5 pr-10 text-[#4f2550] focus:border-[#b678d4] focus:outline-none focus:ring-2 focus:ring-[#ead8fb]"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d7391] hover:text-[#5a2858]"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Show password"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[#5a2858]">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#e3cfdf] bg-white px-4 py-2.5 pr-10 text-[#4f2550] focus:border-[#b678d4] focus:outline-none focus:ring-2 focus:ring-[#ead8fb]"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d7391] hover:text-[#5a2858]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Show confirm password"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {isOtpSent && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#5a2858]">OTP Code</label>
                  <input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    type="text"
                    placeholder="123456"
                    className="w-full rounded-xl border border-[#e3cfdf] bg-white px-4 py-2.5 text-[#4f2550] focus:border-[#b678d4] focus:outline-none focus:ring-2 focus:ring-[#ead8fb]"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-4 py-3 font-semibold text-white shadow-lg shadow-fuchsia-300/40 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Please wait...' : submitLabel}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[#6f5a72]">
              {switchLabel}{' '}
              <a href={switchHref} className="font-semibold text-[#8a3fd8] hover:text-[#6b2e73]">
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </a>
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#8d7391]">
              <CheckCircle2 size={16} />
              <span>Secure encryption and empathetic care, designed for your wellbeing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

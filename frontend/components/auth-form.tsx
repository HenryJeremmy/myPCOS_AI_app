'use client';

import { useState } from 'react';
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
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-rose-50 via-pink-50 to-violet-100 shadow-2xl ring-1 ring-white/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,192,203,0.45),_transparent_55%)]" />
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative hidden md:flex items-center justify-center p-10">
            <div className="relative w-full max-w-xs rounded-2xl bg-white/70 p-6 shadow-xl backdrop-blur">
              <div className="mb-4 flex items-center justify-center gap-2 text-3xl font-bold tracking-wide text-violet-700">
                <HeartPulse className="h-8 w-8 text-fuchsia-500" />
                myPCOS
              </div>
              <p className="text-center text-sm text-violet-600">
                Track your meals, symptoms, and health patterns with confidence.
              </p>
              <div className="mt-6 h-36 rounded-xl bg-gradient-to-br from-rose-200 via-pink-100 to-violet-200 px-4 py-4">
                <div className="h-20 w-full rounded-xl bg-gradient-to-br from-rose-300 via-pink-200 to-violet-300" />
              </div>
            </div>
          </div>

          <div className="relative px-6 py-10 sm:px-10 md:px-12 lg:px-14">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/60 text-purple-600 shadow-md ring-1 ring-white/70">
                <HeartPulse size={28} />
              </div>
              <h1 className="text-3xl font-bold text-violet-900">{title}</h1>
              <p className="mt-2 text-sm text-violet-600">{subtitle}</p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              {mode === 'signup' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-violet-700">First Name</label>
                    <input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      type="text"
                      placeholder="Jane"
                      className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-violet-800 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-violet-700">Last Name</label>
                    <input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      type="text"
                      placeholder="Doe"
                      className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-violet-800 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-violet-700">Email Address</label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder=""
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-violet-800 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-violet-700">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 pr-10 text-violet-800 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-500 hover:text-violet-700"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Show password"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-violet-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 pr-10 text-violet-800 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-500 hover:text-violet-700"
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
                  <label className="mb-2 block text-sm font-medium text-violet-700">OTP Code</label>
                  <input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    type="text"
                    placeholder="123456"
                    className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-violet-800 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
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
                className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 font-semibold text-white shadow-lg shadow-fuchsia-300/40 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Please wait...' : submitLabel}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-violet-600">
              {switchLabel}{' '}
              <a href={switchHref} className="font-semibold text-fuchsia-500 hover:text-fuchsia-600">
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </a>
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-violet-500">
              <CheckCircle2 size={16} />
              <span>Secure encryption and empathetic care, designed for your wellbeing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
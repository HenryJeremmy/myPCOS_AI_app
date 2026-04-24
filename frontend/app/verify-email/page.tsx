'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HeartPulse, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { OTPInput } from '@/components/otp-input';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { verifyEmail, resendOTP } = useAuth();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (otpValue?: string) => {
    if (isLoading) {
      return;
    }

    const codeToVerify = otpValue ?? otp;

    if (codeToVerify.length !== 5) {
      setError('Please enter the complete 5-digit code');
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await verifyEmail(email, codeToVerify);
      setSuccessMessage('Email verified! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setIsResending(true);

    try {
      await resendOTP(email);
      setSuccessMessage('Verification code resent to your email');
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#fcf7fa_0%,#f4ebf1_42%,#ece2ee_100%)] px-4 py-8 sm:px-6 sm:py-12 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#fcf7fa_0%,#f4ebf1_42%,#ece2ee_100%)] shadow-2xl ring-1 ring-white/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(207,65,202,0.16),_transparent_55%)]" />
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative hidden items-center justify-center p-10 md:flex">
              <div className="relative w-full max-w-xs rounded-2xl bg-white/76 p-6 shadow-xl backdrop-blur">
                <Link
                  href="/"
                  className="mb-4 flex items-center justify-center gap-2 text-3xl font-bold tracking-wide text-[#4f2550]"
                >
                  <HeartPulse className="h-8 w-8 text-[#8a3fd8]" />
                  myPCOS
                </Link>
                <p className="text-center text-sm text-[#6f5a72]">
                  Confirm your email to activate meal logging, symptom tracking,
                  lifestyle review, and insight generation.
                </p>
                <div className="mt-6 rounded-xl bg-[linear-gradient(135deg,#fff6fa_0%,#f5ebf8_100%)] px-4 py-5">
                  <div className="rounded-xl bg-[linear-gradient(135deg,#d98bc1_0%,#b678d4_100%)] p-5 text-white">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/80">
                      Verification step
                    </p>
                    <p className="mt-3 text-lg font-semibold">
                      Secure your account before continuing into the workspace.
                    </p>
                  </div>
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
                <h1 className="text-3xl font-bold text-[#4f2550]">Verify Email</h1>
                <p className="mt-2 text-sm text-[#6f5a72]">
                  Enter the 5-digit code sent to <span className="font-semibold">{email}</span>
                </p>
              </div>

              <div className="mb-8">
                <OTPInput
                  length={5}
                  value={otp}
                  onChange={setOtp}
                  onComplete={(completedOtp) => {
                    void handleVerify(completedOtp);
                  }}
                />
              </div>

              {error && (
                <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              <button
                onClick={() => {
                  void handleVerify();
                }}
                disabled={isLoading || otp.length !== 5}
                className="w-full rounded-xl bg-[linear-gradient(135deg,#8a3fd8,#cf41ca)] px-4 py-3 font-semibold text-white shadow-lg shadow-fuchsia-300/40 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="mt-6 border-t border-[#ecdbe8] pt-6 text-center">
                <p className="mb-3 text-sm text-[#6f5a72]">Didn&apos;t receive the code?</p>
                <button
                  onClick={handleResend}
                  disabled={isResending || resendCooldown > 0}
                  className="text-sm font-semibold text-[#8a3fd8] transition hover:text-[#6b2e73] disabled:cursor-not-allowed disabled:text-[#a497ad]"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#ecdbe8] pt-6 text-center text-xs text-[#8d7391]">
                <CheckCircle2 size={16} />
                <span>Check your email, including spam, for the verification code.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,#fcf7fa_0%,#f4ebf1_42%,#ece2ee_100%)] text-[#6f5a72]">
          Loading verification page...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

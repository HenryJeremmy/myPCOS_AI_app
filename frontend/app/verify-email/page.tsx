'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { OTPInput } from '@/components/otp-input';

export default function VerifyEmailPage() {
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

  const handleVerify = async () => {
    if (otp.length !== 5) {
      setError('Please enter the complete 5-digit code');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await verifyEmail(email, otp);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg shadow-purple-200/50 p-8 border border-pink-100">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Verify Email
            </h1>
            <p className="text-slate-600 text-sm">
              Enter the 5-digit code sent to <span className="font-semibold">{email}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <OTPInput
              length={5}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerify}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-4">
              <p className="text-sm text-rose-700 font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || otp.length !== 5}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 text-white font-semibold hover:from-purple-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>

          {/* Resend Code */}
          <div className="mt-6 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-600 mb-3">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm disabled:text-slate-400 disabled:cursor-not-allowed transition"
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend Code'}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Check your email (including spam folder) for the verification code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
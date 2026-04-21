'use client';

import { useRef, useEffect, useState } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  value: string;
  onChange: (value: string) => void;
}

export function OTPInput({ length = 5, onComplete, value, onChange }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));

  useEffect(() => {
    setOtp(value.split('').slice(0, length).concat(Array(length).fill('')).slice(0, length));
  }, []);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange(otpString);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (otpString.length === length) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="h-14 w-14 rounded-xl border-2 border-[#e3cfdf] bg-white text-center text-2xl font-bold text-[#4f2550] shadow-sm transition focus:border-[#b678d4] focus:outline-none focus:ring-2 focus:ring-[#ead8fb]"
        />
      ))}
    </div>
  );
}

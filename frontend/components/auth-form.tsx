// 'use client';

// import { useState } from 'react';
// import { useAuth } from '@/lib/auth';
// import { useRouter } from 'next/navigation';

// interface AuthFormProps {
//   mode: 'login' | 'signup';
//   onSuccess?: () => void;
// }

// export function AuthForm({ mode, onSuccess }: AuthFormProps) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const router = useRouter();
//   const { login, signup } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (mode === 'signup' && password !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       if (mode === 'login') {
//         await login(email, password);
//         onSuccess?.();
//       } else {
//         const result = await signup(email, password, firstName, lastName);
//         router.push(`/verify-email?email=${encodeURIComponent(result.email)}`);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-md">
//       <div className="mb-8">
//         <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent text-center">
//           {mode === 'login' ? 'Welcome Back!' : 'Join MyPCOS Today!'}
//         </h2>
//         <p className="mt-2 text-center text-sm text-slate-600">
//           {mode === 'login'
//             ? 'Sign in to your account'
//             : 'Create your free account'}
//         </p>
//       </div>

//       <form className="space-y-5" onSubmit={handleSubmit}>
//         {/* Signup: First and Last Name */}
//         {mode === 'signup' && (
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
//                 First Name
//               </label>
//               <input
//                 id="firstName"
//                 name="firstName"
//                 type="text"
//                 placeholder="Jane"
//                 required
//                 className="w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
//                 value={firstName}
//                 onChange={(e) => setFirstName(e.target.value)}
//               />
//             </div>
//             <div>
//               <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
//                 Last Name
//               </label>
//               <input
//                 id="lastName"
//                 name="lastName"
//                 type="text"
//                 placeholder="Doe"
//                 required
//                 className="w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
//                 value={lastName}
//                 onChange={(e) => setLastName(e.target.value)}
//               />
//             </div>
//           </div>
//         )}

//         {/* Email */}
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
//             Email Address
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             autoComplete="email"
//             placeholder="you@example.com"
//             required
//             className="w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//         </div>

//         {/* Password */}
//         <div>
//           <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
//             Password
//           </label>
//           <div className="relative">
//             <input
//               id="password"
//               name="password"
//               type={showPassword ? 'text' : 'password'}
//               autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
//               placeholder="••••••••"
//               required
//               className="w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition pr-10"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
//             >
//               {showPassword ? (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0m7.6 0A10.05 10.05 0 1012 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 4.803m-5.596 3.856" />
//                 </svg>
//               ) : (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Signup: Confirm Password */}
//         {mode === 'signup' && (
//           <div>
//             <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
//               Confirm Password
//             </label>
//             <div className="relative">
//               <input
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 type={showConfirmPassword ? 'text' : 'password'}
//                 placeholder="••••••••"
//                 required
//                 className="w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition pr-10"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
//               >
//                 {showConfirmPassword ? (
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0m7.6 0A10.05 10.05 0 1012 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 4.803m-5.596 3.856" />
//                   </svg>
//                 ) : (
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                   </svg>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="rounded-lg bg-rose-50 border border-rose-200 p-4">
//             <p className="text-sm text-rose-700 font-medium">{error}</p>
//           </div>
//         )}

//         {/* Submit Button */}
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full mt-6 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 text-white font-semibold hover:from-purple-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
//         >
//           {isLoading
//             ? 'Processing...'
//             : mode === 'login'
//               ? 'Sign In'
//               : 'Create Account'}
//         </button>
//       </form>
//     </div>
//   );
// }



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
                    <label className="mb-2 block text-sm font-medium text-violet-700">First Name</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      type="text"
                      placeholder="Jane"
                      className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-violet-800 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-violet-700">Last Name</label>
                    <input
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
                <label className="mb-2 block text-sm font-medium text-violet-700">Email Address</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="you@domain.com"
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-violet-800 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-violet-700">Password</label>
                <div className="relative">
                  <input
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
                  <label className="mb-2 block text-sm font-medium text-violet-700">Confirm Password</label>
                  <div className="relative">
                    <input
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
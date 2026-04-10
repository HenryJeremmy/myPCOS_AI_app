// import { AuthForm } from '@/components/auth-form';
// import Link from 'next/link';

// export default function SignupPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <AuthForm mode="signup" />
//         <div className="text-center">
//           <p className="text-sm text-gray-600">
//             Already have an account?{' '}
//             <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


import { AuthForm } from '@/components/auth-form';

export default function SignupPage() {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-violet-100 flex items-center justify-center">
      <AuthForm mode="signup" />
    </div>
  );
}
// import { AuthForm } from '@/components/auth-form';
// import Link from 'next/link';

// export default function LoginPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <AuthForm mode="login" />
//         <div className="text-center">
//           <p className="text-sm text-gray-600">
//             Don't have an account?{' '}
//             <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
//               Sign up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#fcf7fa_0%,#f4ebf1_42%,#ece2ee_100%)] px-4 py-8 sm:px-6 sm:py-12 flex items-center justify-center">
      <AuthForm mode="login" />
    </div>
  );
}

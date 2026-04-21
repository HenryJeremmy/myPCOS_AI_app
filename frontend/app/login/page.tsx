import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#fcf7fa_0%,#f4ebf1_42%,#ece2ee_100%)] px-4 py-8 sm:px-6 sm:py-12 flex items-center justify-center">
      <AuthForm mode="login" />
    </div>
  );
}

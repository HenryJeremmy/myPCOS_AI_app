import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Cookies from 'js-cookie';

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/lib/auth';
import SettingsPage from '@/app/settings/page';

function mockAuthenticatedUser() {
  vi.mocked(useAuth).mockReturnValue({
    user: {
      id: 1,
      email: 'user@example.com',
      first_name: 'Henry',
      is_active: true,
      is_verified: true,
    },
    isLoading: false,
    login: vi.fn(),
    signup: vi.fn(),
    verifyEmail: vi.fn(),
    resendOTP: vi.fn(),
    logout: vi.fn(),
  });

  vi.mocked(Cookies.get).mockReturnValue('test-token');
}

describe('settings page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows profile details and account actions', () => {
    mockAuthenticatedUser();

    render(<SettingsPage />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText(/profile details/i)).toBeInTheDocument();
    expect(screen.getByText(/change password/i)).toBeInTheDocument();
    expect(screen.getByText(/delete account/i)).toBeInTheDocument();
    expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/henry/i)).toBeInTheDocument();
  });
});

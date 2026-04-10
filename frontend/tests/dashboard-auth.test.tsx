import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();
const mockLogin = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/lib/auth';
import { ProtectedRoute } from '@/components/protected-route';
import { AuthForm } from '@/components/auth-form';

describe('dashboard auth flow', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockLogin.mockClear();
  });

  it('redirects unauthenticated users away from protected dashboard routes', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      verifyEmail: vi.fn(),
      resendOTP: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Dashboard Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('renders protected dashboard content for authenticated users', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        email: 'henry@example.com',
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

    render(
      <ProtectedRoute>
        <div>Dashboard Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects verified users to /dashboard after login', async () => {
    mockLogin.mockResolvedValue(undefined);

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: mockLogin,
      signup: vi.fn(),
      verifyEmail: vi.fn(),
      resendOTP: vi.fn(),
      logout: vi.fn(),
    });

    render(<AuthForm mode="login" />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'henry@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Secret123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('henry@example.com', 'Secret123');
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});

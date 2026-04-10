import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

let mockLogout: ReturnType<typeof vi.fn>;

function mockAuthenticatedUser() {
  mockLogout = vi.fn();

  vi.mocked(useAuth).mockReturnValue({
    user: {
      id: 1,
      email: 'user@example.com',
      first_name: 'Henry',
      last_name: 'Chijioke',
      is_active: true,
      is_verified: true,
    },
    isLoading: false,
    login: vi.fn(),
    signup: vi.fn(),
    verifyEmail: vi.fn(),
    resendOTP: vi.fn(),
    logout: mockLogout,
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

    expect(screen.getByText(/account settings/i)).toBeInTheDocument();
    expect(screen.getByText(/change password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Henry');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Chijioke');
    expect(screen.getByLabelText(/email/i)).toHaveValue('user@example.com');
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('readonly');
  });
});

it('submits the profile details form', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      id: 1,
      email: 'user@example.com',
      first_name: 'Ada',
      last_name: 'Okafor',
      is_active: true,
      is_verified: true,
    }),
  });

  vi.stubGlobal('fetch', mockFetch);
  mockAuthenticatedUser();

  render(<SettingsPage />);

  fireEvent.change(screen.getByLabelText(/first name/i), {
    target: { value: 'Ada' },
  });

  fireEvent.change(screen.getByLabelText(/last name/i), {
    target: { value: 'Okafor' },
  });

  fireEvent.click(screen.getByRole('button', { name: /update profile/i }));

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/profile'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        }),
        body: JSON.stringify({
          first_name: 'Ada',
          last_name: 'Okafor',
        }),
      })
    );
  });

  expect(
    await screen.findByText(/profile updated successfully/i)
  ).toBeInTheDocument();
});

it('submits the change password form', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      message: 'Password updated successfully',
    }),
  });

  vi.stubGlobal('fetch', mockFetch);
  mockAuthenticatedUser();

  render(<SettingsPage />);

  fireEvent.change(screen.getByLabelText(/^current password/i), {
    target: { value: 'OldPass123' },
  });

  fireEvent.change(screen.getByLabelText(/^new password/i), {
    target: { value: 'NewPass456' },
  });

  fireEvent.change(screen.getByLabelText(/^confirm new password/i), {
    target: { value: 'NewPass456' },
  });

  fireEvent.click(screen.getByRole('button', { name: /update password/i }));

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/change-password'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        }),
        body: JSON.stringify({
          current_password: 'OldPass123',
          new_password: 'NewPass456',
        }),
      })
    );
  });

  expect(
    await screen.findByText(/password updated successfully/i)
  ).toBeInTheDocument();
});

it('shows an error when the current password is incorrect', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({
      detail: 'Current password is incorrect',
    }),
  });

  vi.stubGlobal('fetch', mockFetch);
  mockAuthenticatedUser();

  render(<SettingsPage />);

  fireEvent.change(screen.getByLabelText(/^current password/i), {
    target: { value: 'WrongPass123' },
  });

  fireEvent.change(screen.getByLabelText(/^new password/i), {
    target: { value: 'NewPass456' },
  });

  fireEvent.change(screen.getByLabelText(/^confirm new password/i), {
    target: { value: 'NewPass456' },
  });

  fireEvent.click(screen.getByRole('button', { name: /update password/i }));

  expect(
    await screen.findByText(/current password is incorrect/i)
  ).toBeInTheDocument();
});

it('submits account deletion and logs the user out', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      message: 'Account deleted successfully',
    }),
  });

  vi.stubGlobal('fetch', mockFetch);
  mockAuthenticatedUser();

  render(<SettingsPage />);

  fireEvent.change(screen.getByLabelText(/type delete to confirm/i), {
    target: { value: 'DELETE' },
  });

  fireEvent.click(screen.getByRole('button', { name: /^delete account$/i }));

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/delete-account'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  expect(
    await screen.findByText(/account deleted successfully/i)
  ).toBeInTheDocument();
  expect(mockLogout).toHaveBeenCalled();
});

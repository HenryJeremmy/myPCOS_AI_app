import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import Cookies from 'js-cookie';
import MealsPage from '@/app/meals/page';

vi.mock('@/components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(() => ({
    logout: vi.fn(),
  })),
}));

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('meals page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(Cookies.get).mockReturnValue('test-token');
  });

  it('shows the simplified meal logging workspace', () => {
    render(<MealsPage />);

    expect(screen.getByText(/meal logging workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/^upload image$/i)).toBeInTheDocument();
    expect(screen.getByText(/^ai prediction$/i)).toBeInTheDocument();
    expect(screen.getByText(/^confirm meal details$/i)).toBeInTheDocument();
    expect(screen.getByText(/^metabolic classification$/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save meal entry/i })
    ).toBeInTheDocument();
  });

  it('shows an uploaded image preview', async () => {
    render(<MealsPage />);

    const file = new File(['meal-image'], 'meal.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/meal image/i);

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('meal.jpg')).toBeInTheDocument();
    expect(
      await screen.findByRole('img', { name: /selected meal preview/i })
    ).toBeInTheDocument();
  });

  it('uploads a meal image and shows prediction results', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        filename: 'meal.jpg',
        content_type: 'image/jpeg',
        total_detections: 1,
        detections: [
          {
            class_id: 0,
            label: 'Rice',
            confidence: 0.92,
            bbox: { x1: 10, y1: 20, x2: 200, y2: 240 },
          },
        ],
      }),
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<MealsPage />);

    const file = new File(['meal-image'], 'meal.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/meal image/i);

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /run ai prediction/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/ai/predict'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    expect(await screen.findByText('Rice')).toBeInTheDocument();
    expect(screen.getByText(/0.92/i)).toBeInTheDocument();
  });

  it('allows a detected food to be confirmed', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        filename: 'meal.jpg',
        content_type: 'image/jpeg',
        total_detections: 1,
        detections: [
          {
            class_id: 0,
            label: 'Rice',
            confidence: 0.92,
            bbox: { x1: 10, y1: 20, x2: 200, y2: 240 },
          },
        ],
      }),
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<MealsPage />);

    const file = new File(['meal-image'], 'meal.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/meal image/i);

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /run ai prediction/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /confirm rice/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /confirm rice/i }));

    expect(screen.getByDisplayValue('Rice')).toBeInTheDocument();
  });

  it('allows the confirmed foods list to be edited manually', () => {
    render(<MealsPage />);

    fireEvent.change(screen.getByLabelText(/confirmed foods/i), {
      target: { value: 'Rice, Green salad, Chicken' },
    });

    expect(
      screen.getByDisplayValue('Rice, Green salad, Chicken')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/you can edit this list manually if the ai misses part of the meal/i)
    ).toBeInTheDocument();
  });

  it('allows a detected food to be removed', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        filename: 'meal.jpg',
        content_type: 'image/jpeg',
        total_detections: 1,
        detections: [
          {
            class_id: 0,
            label: 'Rice',
            confidence: 0.92,
            bbox: { x1: 10, y1: 20, x2: 200, y2: 240 },
          },
        ],
      }),
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<MealsPage />);

    const file = new File(['meal-image'], 'meal.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/meal image/i);

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /run ai prediction/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /remove rice/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /remove rice/i }));

    expect(
      screen.queryByRole('button', { name: /confirm rice/i })
    ).not.toBeInTheDocument();
  });

  it('lets the user fill in meal details', () => {
    render(<MealsPage />);

    fireEvent.change(screen.getByLabelText(/meal type/i), {
      target: { value: 'Lunch' },
    });

    fireEvent.change(screen.getByLabelText(/meal time/i), {
      target: { value: '13:00' },
    });

    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: 'Felt very hungry before eating.' },
    });

    expect(screen.getByDisplayValue('Lunch')).toBeInTheDocument();
    expect(screen.getByDisplayValue('13:00')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Felt very hungry before eating.')
    ).toBeInTheDocument();
  });

  it('saves the confirmed meal entry and resets the form', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          filename: 'meal.jpg',
          content_type: 'image/jpeg',
          total_detections: 1,
          detections: [
            {
              class_id: 0,
              label: 'Rice',
              confidence: 0.92,
              bbox: { x1: 10, y1: 20, x2: 200, y2: 240 },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          user_id: 1,
          meal_type: 'Lunch',
          foods_text: 'Rice',
          image_url: null,
          notes: 'Felt very hungry before eating.',
          glycaemic_band: 'high',
          metabolic_summary:
            'Tagged as high glycaemic impact. Metabolic profile: refined_carb.',
          created_at: '2026-04-08T01:00:00Z',
        }),
      });

    vi.stubGlobal('fetch', mockFetch);

    render(<MealsPage />);

    const file = new File(['meal-image'], 'meal.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText(/meal image/i), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole('button', { name: /run ai prediction/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /confirm rice/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /confirm rice/i }));

    fireEvent.change(screen.getByLabelText(/meal type/i), {
      target: { value: 'Lunch' },
    });
    fireEvent.change(screen.getByLabelText(/meal time/i), {
      target: { value: '13:00' },
    });
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: 'Felt very hungry before eating.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save meal entry/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/api/v1/logs/meals'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify({
            meal_type: 'Lunch',
            foods_text: 'Rice',
            image_url: null,
            notes: 'Felt very hungry before eating.',
            meal_time: '13:00',
          }),
        })
      );
    });

    expect(
      await screen.findByText(/meal entry saved successfully/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/glycaemic band/i)).toBeInTheDocument();
    expect(screen.getByText(/^high$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/tagged as high glycaemic impact/i)
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/meal type/i)).toHaveValue('');
    expect(screen.getByLabelText(/meal time/i)).toHaveValue('');
    expect(screen.getByLabelText(/notes/i)).toHaveValue('');
    expect(screen.getByLabelText(/confirmed foods/i)).toHaveValue('');
    expect(screen.getByText(/no file selected/i)).toBeInTheDocument();
  });

  it('saves manually added foods together with AI-confirmed foods', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          filename: 'meal.jpg',
          content_type: 'image/jpeg',
          total_detections: 1,
          detections: [
            {
              class_id: 0,
              label: 'Rice',
              confidence: 0.92,
              bbox: { x1: 10, y1: 20, x2: 200, y2: 240 },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 2,
          user_id: 1,
          meal_type: 'Lunch',
          foods_text: 'Rice, Green salad',
          image_url: null,
          notes: '',
          created_at: '2026-04-08T01:00:00Z',
        }),
      });

    vi.stubGlobal('fetch', mockFetch);

    render(<MealsPage />);

    const file = new File(['meal-image'], 'meal.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText(/meal image/i), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole('button', { name: /run ai prediction/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /confirm rice/i })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /confirm rice/i }));
    fireEvent.change(screen.getByLabelText(/confirmed foods/i), {
      target: { value: 'Rice, Green salad' },
    });
    fireEvent.change(screen.getByLabelText(/meal type/i), {
      target: { value: 'Lunch' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save meal entry/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/api/v1/logs/meals'),
        expect.objectContaining({
          body: JSON.stringify({
            meal_type: 'Lunch',
            foods_text: 'Rice, Green salad',
            image_url: null,
            notes: '',
            meal_time: null,
          }),
        })
      );
    });
  });
});

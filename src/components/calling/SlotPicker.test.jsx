import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SlotPicker from './SlotPicker.jsx';

const localDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

describe('SlotPicker extra availability', () => {
  it('shows extra-availability dates as chips and loads that day when one is picked', async () => {
    // Five days out at local noon, so the window can't straddle midnight in the test runner's zone.
    const day = new Date();
    day.setDate(day.getDate() + 5);
    day.setHours(12, 0, 0, 0);
    const end = new Date(day.getTime() + 2 * 3600_000);
    const startIso = day.toISOString();
    const load = vi.fn().mockResolvedValue({ slots: [{ startTime: startIso, endTime: new Date(day.getTime() + 1800_000).toISOString() }] });

    render(
      <SlotPicker
        durationMinutes={30}
        timezone="UTC"
        selected={null}
        onSelect={() => {}}
        loadAvailability={load}
        extraWindows={[{ startTime: startIso, endTime: end.toISOString() }]}
      />,
    );

    const label = day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    fireEvent.click(await screen.findByRole('button', { name: label }));

    await waitFor(() => {
      const last = load.mock.calls.at(-1)[0];
      expect(localDate(new Date(last.rangeStart))).toBe(localDate(day));
    });
    expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByRole('option')).toBeInTheDocument();
  });

  it('shows no chips for windows that are already over', () => {
    render(
      <SlotPicker
        durationMinutes={30}
        selected={null}
        onSelect={() => {}}
        loadAvailability={vi.fn().mockResolvedValue([])}
        extraWindows={[{ startTime: '2020-01-01T10:00:00Z', endTime: '2020-01-01T12:00:00Z' }]}
      />,
    );
    expect(screen.queryByText('Extra availability')).not.toBeInTheDocument();
  });
});

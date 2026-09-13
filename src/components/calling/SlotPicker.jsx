/**
 * Date + time-slot picker backed by `calendar.availability`. The backend
 * already applies working hours, holidays, buffers, min-notice and existing
 * bookings — this never widens or invents availability, it only additionally
 * hides anything that's slipped into the past by the time it renders. Used by
 * both `BookingModal` (new meeting) and `RescheduleMeetingModal` (existing
 * meeting), so a slot picked here always comes straight from the API.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Skeleton, ErrorState, EmptyState, cn } from '../ui';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDaysStr(days) {
  const d = new Date(Date.now() + days * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Local midnight -> local end-of-day for the picked date, as ISO instants. */
function dayBounds(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return {
    rangeStart: new Date(y, m - 1, d, 0, 0, 0, 0).toISOString(),
    rangeEnd: new Date(y, m - 1, d, 23, 59, 59, 999).toISOString(),
  };
}

/** Accepts a plain array of ISO strings or of slot-ish objects; never assumes
 * a specific shape beyond "something with a start time". */
function normalizeSlots(raw) {
  const arr = Array.isArray(raw) ? raw : raw?.slots ?? raw?.data ?? [];
  return arr
    .map((s) => {
      if (typeof s === 'string') return { start: s, available: true };
      const start = s.startTimeIso || s.startTime || s.start || s.startAt || s.time;
      if (!start) return null;
      const end = s.endTimeIso || s.endTime || s.end || s.endAt || null;
      const unavailable =
        s.available === false || s.isAvailable === false || /booked|unavailable/i.test(String(s.status || ''));
      return { start, end, available: !unavailable };
    })
    .filter(Boolean);
}

export default function SlotPicker({
  durationMinutes,
  connectionId,
  timezone,
  selected,
  onSelect,
  maxHorizonDays,
  reloadKey,
  enabled = true,
}) {
  const [date, setDate] = useState(todayStr());
  const { rangeStart, rangeEnd } = useMemo(() => dayBounds(date), [date]);

  // Refreshed on an interval (an external-clock subscription, not a direct
  // render-time read) so a slot that ticks into the past while the modal
  // sits open still gets disabled.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const availability = useAsync(
    () =>
      enabled
        ? api.calendar.availability({
            rangeStart,
            rangeEnd,
            durationMinutes,
            connectionId: connectionId || undefined,
            timezone,
          })
        : Promise.resolve([]),
    [rangeStart, rangeEnd, durationMinutes, connectionId, timezone, reloadKey, enabled],
  );

  const slots = useMemo(() => {
    return normalizeSlots(availability.data)
      .filter((s) => s.available && new Date(s.start).getTime() > now)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [availability.data, now]);

  const minDate = todayStr();
  const maxDate = maxHorizonDays ? addDaysStr(maxHorizonDays) : undefined;

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <CalendarDays size={15} className="text-slate-400" aria-hidden="true" />
          Date
        </span>
        <input
          type="date"
          value={date}
          min={minDate}
          max={maxDate}
          onChange={(e) => {
            if (!e.target.value) return;
            setDate(e.target.value);
            onSelect(null); // a slot picked on the previous date no longer applies
          }}
          className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
        />
      </label>

      <div>
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Clock size={15} className="text-slate-400" aria-hidden="true" />
          Available times
        </span>

        {availability.loading && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        )}

        {availability.error && <ErrorState error={availability.error} onRetry={availability.reload} compact />}

        {!availability.loading && !availability.error && slots.length === 0 && enabled && (
          <EmptyState icon={Clock} title="No open slots this day" hint="Try another date." className="py-6" />
        )}

        {!availability.loading && !availability.error && slots.length > 0 && (
          <div
            role="listbox"
            aria-label="Available times"
            className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4"
          >
            {slots.map((s) => {
              const isSelected = selected === s.start;
              return (
                <button
                  key={s.start}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onSelect(s)}
                  className={cn(
                    'rounded-lg border px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                    isSelected
                      ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50',
                  )}
                >
                  {new Date(s.start).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

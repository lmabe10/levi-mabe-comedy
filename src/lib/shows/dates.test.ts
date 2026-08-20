import { describe, expect, it } from 'vitest';
import { getDateDay, getDateMonth, getDayOfWeek, parseLocalDate } from '@/lib/dates';

describe('parseLocalDate', () => {
  it('does not shift the calendar day', () => {
    const date = parseLocalDate('2026-09-11');
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(11);
  });

  it('formats month, day, and weekday from a local date', () => {
    expect(getDateMonth('2026-09-11')).toBe('SEP');
    expect(getDateDay('2026-09-11')).toBe('11');
    expect(getDayOfWeek('2026-09-11', 'short').toUpperCase()).toBe('FRI');
  });
});

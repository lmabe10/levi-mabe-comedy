import type { Show } from '@/types/content';
import type { ApiPerformance, ApiShow } from '@/types/shows-api';

const CITY_REGION_PATTERN = /^(.*?)\s*,?\s*([A-Z]{2,3})$/;

export function parseCityRegion(cityRegion: string | null | undefined): {
  city: string;
  state: string;
} {
  const value = cityRegion?.trim() ?? '';
  if (!value) return { city: '', state: '' };

  const match = value.match(CITY_REGION_PATTERN);
  if (!match) return { city: value, state: '' };

  return {
    city: match[1].replace(/,\s*$/, '').trim(),
    state: match[2],
  };
}

function stripUnnecessaryExclamations(value: string): string {
  return value
    .trim()
    .replace(/^!+\s*|\s*!+$/g, '')
    .replace(/!+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function mapShowStatus(soldOut: boolean, specialBanner: string | null | undefined): string | undefined {
  if (soldOut) return 'Sold Out';

  const trimmed = specialBanner?.trim();
  if (!trimmed) return undefined;

  const cleaned = stripUnnecessaryExclamations(trimmed);
  if (/^hurry few tickets remaining$/i.test(cleaned)) return 'Low Tickets';
  if (/^hurry tickets are going fast$/i.test(cleaned)) return 'Tickets Going Fast';
  return cleaned || undefined;
}

/**
 * Temporary fallback for two-performance, consecutive-day records that
 * currently expose `dateLabel` instead of a machine-readable `date`.
 * Replace this when every performance includes `date`.
 */
export function fallbackPerformanceDateFromShowRange(show: ApiShow, performanceIndex: number): string {
  if (performanceIndex === 1) return show.endDate;
  return show.startDate;
}

export function resolvePerformanceDate(
  show: ApiShow,
  performance: ApiPerformance,
  performanceIndex: number
): string | null {
  const explicit = performance.date?.trim();
  if (explicit) return explicit;

  const fallback = fallbackPerformanceDateFromShowRange(show, performanceIndex).trim();
  return fallback || null;
}

export function timeSortKey(time: string): number {
  const normalized = time.trim().toLowerCase().replace(/\s+/g, '');
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
  if (!match) return Number.MAX_SAFE_INTEGER;

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const period = match[3];

  if (period === 'pm' && hours < 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function adaptApiShow(show: ApiShow): Show[] {
  const { city, state } = parseCityRegion(show.venue.cityRegion);
  const venue = show.venue.name?.trim() ?? '';

  return (show.performances ?? []).flatMap((performance, performanceIndex) => {
    const date = resolvePerformanceDate(show, performance, performanceIndex);
    if (!date) return [];

    const soldOut = Boolean(show.soldOut || performance.soldOut);
    const ticketUrl = performance.ticketUrl?.trim() || undefined;

    return [
      {
        id: `show-${show.sourceId}-${date}-${performanceIndex}`,
        date,
        time: performance.showtime?.trim() ?? '',
        city,
        state,
        venue,
        status: mapShowStatus(soldOut, show.specialBanner),
        detail: 'with Jeff Leeson',
        ticketUrl,
        soldOut,
      },
    ];
  });
}

export function adaptApiShows(shows: ApiShow[]): Show[] {
  return shows
    .flatMap(adaptApiShow)
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      if (byDate !== 0) return byDate;
      return timeSortKey(a.time) - timeSortKey(b.time);
    });
}

import { describe, expect, it } from 'vitest';
import type { ApiShow } from '@/types/shows-api';
import {
  adaptApiShows,
  fallbackPerformanceDateFromShowRange,
  mapShowStatus,
  parseCityRegion,
  resolvePerformanceDate,
  timeSortKey,
} from './adapter';

function makeShow(overrides: Partial<ApiShow> = {}): ApiShow {
  return {
    sourceId: 100,
    slug: 'test-show',
    title: 'Test Show',
    showUrl: 'https://example.com/show',
    startDate: '2026-10-02',
    endDate: '2026-10-03',
    multiDay: true,
    venue: {
      name: 'Test Venue',
      address: '123 Main',
      cityRegion: 'Austin, MN',
    },
    ageRestriction: null,
    soldOut: false,
    specialBanner: null,
    performances: [
      {
        dateLabel: 'Friday, October 2',
        doors: '6 pm',
        showtime: '7 pm',
        ticketUrl: 'https://example.com/fri',
        soldOut: false,
      },
      {
        dateLabel: 'Saturday, October 3',
        doors: '6 pm',
        showtime: '8 pm',
        ticketUrl: 'https://example.com/sat',
        soldOut: false,
      },
    ],
    ticketTiers: [{ label: 'General Admission', price: '$36' }],
    ...overrides,
  };
}

describe('parseCityRegion', () => {
  it('parses comma-separated two-letter regions', () => {
    expect(parseCityRegion('Ridgeway, ON')).toEqual({ city: 'Ridgeway', state: 'ON' });
    expect(parseCityRegion('Austin, MN')).toEqual({ city: 'Austin', state: 'MN' });
  });

  it('parses three-letter regions', () => {
    expect(parseCityRegion('Summerside, PEI')).toEqual({ city: 'Summerside', state: 'PEI' });
  });

  it('parses a region without a comma', () => {
    expect(parseCityRegion('Saint John NB')).toEqual({ city: 'Saint John', state: 'NB' });
  });
});

describe('mapShowStatus', () => {
  it('uses Sold Out and ignores promotional banners', () => {
    expect(mapShowStatus(true, 'Hurry! Few Tickets Remaining!')).toBe('Sold Out');
  });

  it('maps known banners after stripping exclamation marks', () => {
    expect(mapShowStatus(false, 'Hurry! Few Tickets Remaining!')).toBe('Low Tickets');
    expect(mapShowStatus(false, 'Hurry! Tickets Are Going Fast!')).toBe('Tickets Going Fast');
  });

  it('returns cleaned unknown banner text', () => {
    expect(mapShowStatus(false, '  Just Added!!  ')).toBe('Just Added');
  });

  it('returns undefined for an empty banner', () => {
    expect(mapShowStatus(false, '   ')).toBeUndefined();
    expect(mapShowStatus(false, null)).toBeUndefined();
  });
});

describe('performance dates', () => {
  it('prefers a machine-readable performance date', () => {
    const show = makeShow();
    expect(
      resolvePerformanceDate(
        show,
        { date: '2026-09-11', doors: null, showtime: '8 pm', ticketUrl: null, soldOut: false },
        1
      )
    ).toBe('2026-09-11');
  });

  it('falls back to start/end dates for consecutive two-performance records', () => {
    const show = makeShow();
    expect(fallbackPerformanceDateFromShowRange(show, 0)).toBe('2026-10-02');
    expect(fallbackPerformanceDateFromShowRange(show, 1)).toBe('2026-10-03');
    expect(resolvePerformanceDate(show, show.performances[0], 0)).toBe('2026-10-02');
    expect(resolvePerformanceDate(show, show.performances[1], 1)).toBe('2026-10-03');
  });
});

describe('adaptApiShows', () => {
  it('emits one row per performance with mapped fields', () => {
    const rows = adaptApiShows([makeShow()]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: 'show-100-2026-10-02-0',
      date: '2026-10-02',
      time: '7 pm',
      city: 'Austin',
      state: 'MN',
      venue: 'Test Venue',
      detail: 'with Jeff Leeson',
      ticketUrl: 'https://example.com/fri',
      soldOut: false,
    });
    expect(rows[1].id).toBe('show-100-2026-10-03-1');
    expect(rows[1].ticketUrl).toBe('https://example.com/sat');
  });

  it('sorts by date then time', () => {
    const rows = adaptApiShows([
      makeShow({
        sourceId: 2,
        startDate: '2026-10-02',
        endDate: '2026-10-02',
        multiDay: false,
        performances: [
          {
            date: '2026-10-02',
            doors: null,
            showtime: '9PM',
            ticketUrl: 'https://example.com/late',
            soldOut: false,
          },
          {
            date: '2026-10-02',
            doors: null,
            showtime: '7:00 PM',
            ticketUrl: 'https://example.com/early',
            soldOut: false,
          },
        ],
      }),
      makeShow({
        sourceId: 1,
        startDate: '2026-10-01',
        endDate: '2026-10-01',
        multiDay: false,
        performances: [
          {
            date: '2026-10-01',
            doors: null,
            showtime: '8PM',
            ticketUrl: 'https://example.com/first',
            soldOut: false,
          },
        ],
      }),
    ]);

    expect(rows.map((row) => row.ticketUrl)).toEqual([
      'https://example.com/first',
      'https://example.com/early',
      'https://example.com/late',
    ]);
  });
});

describe('timeSortKey', () => {
  it('orders common showtime formats', () => {
    expect(timeSortKey('7 pm')).toBeLessThan(timeSortKey('8PM'));
    expect(timeSortKey('7:30PM')).toBeLessThan(timeSortKey('8:00 PM'));
  });
});

import siteJson from '../../content/site.json';
import showsJson from '../../content/shows.json';
import videosJson from '../../content/videos.json';
import bioRaw from '../../content/bio.md?raw';
import type {
  Show,
  SiteContent,
  SocialPlatform,
  VideosContent,
} from '@/types/content';

export const site = siteJson as SiteContent;

export const bio: string[] = bioRaw
  .trim()
  .split(/\n\s*\n/)
  .map((p) => p.replace(/\n/g, ' ').trim())
  .filter(Boolean);

export const shows: Show[] = [...(showsJson as Show[])].sort((a, b) =>
  a.date.localeCompare(b.date)
);

export const videos = videosJson as VideosContent;

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X',
  threads: 'Threads',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

const SOCIAL_ORDER: SocialPlatform[] = [
  'instagram',
  'facebook',
  'x',
  'threads',
  'youtube',
  'tiktok',
];

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  url: string;
};

export function getSocialLinks(social: SiteContent['social']): SocialLink[] {
  return SOCIAL_ORDER.flatMap((platform) => {
    const url = social[platform]?.trim();
    if (!url) return [];
    return [{ platform, label: SOCIAL_LABELS[platform], url }];
  });
}

/** Parse ISO date (YYYY-MM-DD) at noon UTC to avoid timezone day shifts. */
function parseIsoDate(isoDate: string): Date | null {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function getDayOfWeek(isoDate: string, style: 'short' | 'long' = 'short'): string {
  const date = parseIsoDate(isoDate);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: style,
    timeZone: 'UTC',
  }).format(date);
}

export function getDateDay(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  if (!date) return '';
  return String(date.getUTCDate()).padStart(2, '0');
}

export function getDateMonth(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
    .format(date)
    .toUpperCase();
}

/** Split hero corner text like "01 / 04" for styled slash. */
export function splitCorner(corner: string): { before: string; after: string } | null {
  const parts = corner.split('/').map((p) => p.trim());
  if (parts.length !== 2) return null;
  return { before: parts[0], after: parts[1] };
}

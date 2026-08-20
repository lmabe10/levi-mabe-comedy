import siteJson from '../../content/site.json';
import videosJson from '../../content/videos.json';
import bioRaw from '../../content/bio.md?raw';
import type {
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

export { getDateDay, getDateMonth, getDayOfWeek, parseLocalDate } from '@/lib/dates';

/** Split hero corner text like "01 / 04" for styled slash. */
export function splitCorner(corner: string): { before: string; after: string } | null {
  const parts = corner.split('/').map((p) => p.trim());
  if (parts.length !== 2) return null;
  return { before: parts[0], after: parts[1] };
}

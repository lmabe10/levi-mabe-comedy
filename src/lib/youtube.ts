/** Extract a YouTube video ID from common watch, short, and embed URLs. */
export function getYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }

      const parts = parsed.pathname.split('/').filter(Boolean);
      if (
        (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live' || parts[0] === 'v') &&
        parts[1]
      ) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeThumb(url: string): string {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

export function youtubeEmbedSrc(url: string, autoplay = false): string {
  const id = getYoutubeId(url);
  if (!id) return '';
  const params = new URLSearchParams({ rel: '0' });
  if (autoplay) params.set('autoplay', '1');
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

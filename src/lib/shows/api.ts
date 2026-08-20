import type { ShowsApiResponse } from '@/types/shows-api';
import { adaptApiShows } from '@/lib/shows/adapter';
import type { Show } from '@/types/content';

export const DEFAULT_SHOWS_API_URL = 'https://jeffleesoncomedy.com/wp-json/jeff-shows/v1/shows';

export const SHOWS_API_URL =
  import.meta.env.VITE_JEFF_SHOWS_API_URL?.trim() || DEFAULT_SHOWS_API_URL;

export async function fetchTourShows(signal?: AbortSignal): Promise<Show[]> {
  const response = await fetch(SHOWS_API_URL, { signal });
  if (!response.ok) {
    throw new Error(`Shows API failed with ${response.status}`);
  }

  const data = (await response.json()) as ShowsApiResponse;
  return adaptApiShows(data.shows ?? []);
}

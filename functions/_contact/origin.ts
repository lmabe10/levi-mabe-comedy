/**
 * Conservative Origin checks for browser form posts.
 * Uses CONTACT_ALLOWED_ORIGINS (exact URLs and optional `*.pages.dev`).
 */
export function isAllowedOrigin(
  request: Request,
  allowedOrigins: string[]
): boolean {
  if (allowedOrigins.length === 0) {
    // Misconfiguration — fail closed for browser submissions.
    return false;
  }

  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');

  const candidates: string[] = [];
  if (origin) candidates.push(origin);
  if (referer) {
    try {
      const url = new URL(referer);
      candidates.push(url.origin);
    } catch {
      // ignore malformed referer
    }
  }

  if (candidates.length === 0) {
    // Non-browser or stripped Origin — reject for this form endpoint.
    return false;
  }

  return candidates.some((candidate) => matchesAllowedOrigin(candidate, allowedOrigins));
}

export function matchesAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }

  for (const entry of allowedOrigins) {
    if (entry === '*.pages.dev') {
      if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.pages.dev')) {
        return true;
      }
      continue;
    }

    try {
      const allowed = new URL(entry);
      if (
        allowed.protocol === parsed.protocol &&
        allowed.host === parsed.host
      ) {
        return true;
      }
    } catch {
      // ignore invalid allowlist entries
    }
  }

  return false;
}

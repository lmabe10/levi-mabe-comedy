export type TurnstileResult =
  | { ok: true }
  | { ok: false; reason: 'rejected' | 'unexpected' | 'hostname' };

type SiteverifyResponse = {
  success?: boolean;
  hostname?: string;
  'error-codes'?: string[];
};

/**
 * Server-side Turnstile verification via Cloudflare siteverify.
 * Uses raw fetch — no SDK.
 */
export async function verifyTurnstile(options: {
  token: string;
  secret: string;
  remoteIp?: string | null;
  expectedHostname?: string | null;
  fetchImpl?: typeof fetch;
}): Promise<TurnstileResult> {
  const fetchFn = options.fetchImpl ?? fetch;

  const body = new URLSearchParams();
  body.set('secret', options.secret);
  body.set('response', options.token);
  if (options.remoteIp) {
    body.set('remoteip', options.remoteIp);
  }

  let response: Response;
  try {
    response = await fetchFn(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      }
    );
  } catch {
    return { ok: false, reason: 'unexpected' };
  }

  let payload: SiteverifyResponse;
  try {
    payload = (await response.json()) as SiteverifyResponse;
  } catch {
    return { ok: false, reason: 'unexpected' };
  }

  if (typeof payload.success !== 'boolean') {
    return { ok: false, reason: 'unexpected' };
  }

  if (!payload.success) {
    return { ok: false, reason: 'rejected' };
  }

  if (options.expectedHostname) {
    if (typeof payload.hostname !== 'string' || payload.hostname !== options.expectedHostname) {
      return { ok: false, reason: 'hostname' };
    }
  }

  return { ok: true };
}

import { CONTACT_LIMITS, loadContactConfig, type ContactEnv } from './config';
import { sendContactEmail } from './email';
import { isAllowedOrigin } from './origin';
import { errorResponse, okResponse } from './response';
import { verifyTurnstile } from './turnstile';
import { validateContactPayload } from './validation';

export type HandleContactOptions = {
  fetchImpl?: typeof fetch;
};

/**
 * Core contact endpoint logic — testable without Pages runtime.
 */
export async function handleContactRequest(
  request: Request,
  env: ContactEnv,
  options: HandleContactOptions = {}
): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed.', 405);
  }

  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return errorResponse('Unsupported content type.', 415);
  }

  const config = loadContactConfig(env);
  if (!config) {
    return errorResponse('Contact form is not configured yet.', 503);
  }

  if (!isAllowedOrigin(request, config.allowedOrigins)) {
    return errorResponse('Unable to send your message. Please try again.', 403);
  }

  const contentLength = request.headers.get('Content-Length');
  if (contentLength) {
    const length = Number(contentLength);
    if (Number.isFinite(length) && length > CONTACT_LIMITS.bodyBytes) {
      return errorResponse('Request is too large.', 413);
    }
  }

  let rawText: string;
  try {
    rawText = await readBodyWithLimit(request, CONTACT_LIMITS.bodyBytes);
  } catch (err) {
    if (err instanceof BodyTooLargeError) {
      return errorResponse('Request is too large.', 413);
    }
    return errorResponse('Invalid request.', 400);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return errorResponse('Invalid JSON.', 400);
  }

  const validated = validateContactPayload(parsed);
  if (!validated.ok) {
    return errorResponse(validated.error, validated.status);
  }

  const turnstile = await verifyTurnstile({
    token: validated.data.turnstileToken,
    secret: config.turnstileSecretKey,
    remoteIp: request.headers.get('CF-Connecting-IP'),
    expectedHostname: config.turnstileExpectedHostname,
    fetchImpl: options.fetchImpl,
  });

  if (!turnstile.ok) {
    return errorResponse('Unable to send your message. Please try again.', 400);
  }

  const emailed = await sendContactEmail({
    apiKey: config.resendApiKey,
    toEmail: config.toEmail,
    fromEmail: config.fromEmail,
    contact: validated.data,
    fetchImpl: options.fetchImpl,
  });

  if (!emailed.ok) {
    return errorResponse('Unable to send your message. Please try again.', 502);
  }

  return okResponse();
}

class BodyTooLargeError extends Error {
  constructor() {
    super('body too large');
    this.name = 'BodyTooLargeError';
  }
}

async function readBodyWithLimit(request: Request, maxBytes: number): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) {
    return '';
  }

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        // ignore
      }
      throw new BodyTooLargeError();
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(merged);
}

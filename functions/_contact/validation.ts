import { CONTACT_LIMITS } from './config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEADER_UNSAFE = /[\r\n]/;

export type ValidatedContact = {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
};

export type ValidationFailure = {
  ok: false;
  error: string;
  status: number;
};

export type ValidationSuccess = {
  ok: true;
  data: ValidatedContact;
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * Authoritative server validation and normalization.
 * Rejects CR/LF in name and email to prevent header injection.
 */
export function validateContactPayload(raw: unknown): ValidationSuccess | ValidationFailure {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Invalid request.', status: 400 };
  }

  const body = raw as Record<string, unknown>;
  const website = asString(body.website).trim();
  if (website) {
    // Honeypot tripped — generic error, no special signal to bots.
    return { ok: false, error: 'Unable to send your message. Please try again.', status: 400 };
  }

  const name = asString(body.name).trim();
  const email = asString(body.email).trim();
  const message = asString(body.message).trim();
  const turnstileToken = asString(body.turnstileToken).trim();

  if (!name || !email || !message) {
    return { ok: false, error: 'Please fill in all fields.', status: 400 };
  }

  if (HEADER_UNSAFE.test(name) || HEADER_UNSAFE.test(email)) {
    return { ok: false, error: 'Invalid request.', status: 400 };
  }

  if (name.length > CONTACT_LIMITS.name) {
    return { ok: false, error: 'Name is too long.', status: 400 };
  }

  if (email.length > CONTACT_LIMITS.email || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.', status: 400 };
  }

  if (message.length > CONTACT_LIMITS.message) {
    return { ok: false, error: 'Message is too long.', status: 400 };
  }

  if (!turnstileToken) {
    return { ok: false, error: 'Please complete the verification challenge.', status: 400 };
  }

  return {
    ok: true,
    data: { name, email, message, turnstileToken },
  };
}

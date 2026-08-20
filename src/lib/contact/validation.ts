import { CONTACT_LIMITS, type ContactSubmission } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ClientValidationError = {
  ok: false;
  error: string;
};

export type ClientValidationSuccess = {
  ok: true;
  data: ContactSubmission;
};

/**
 * Lightweight browser-side checks. Server validation is authoritative.
 */
export function validateContactClient(input: {
  name: string;
  email: string;
  message: string;
  website?: string;
  turnstileToken: string;
}): ClientValidationSuccess | ClientValidationError {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  const website = input.website?.trim() ?? '';
  const turnstileToken = input.turnstileToken.trim();

  if (website) {
    return { ok: false, error: 'Unable to send your message. Please try again.' };
  }

  if (!name || !email || !message) {
    return { ok: false, error: 'Please fill in all fields.' };
  }

  if (name.length > CONTACT_LIMITS.name) {
    return { ok: false, error: 'Name is too long.' };
  }

  if (email.length > CONTACT_LIMITS.email || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  if (message.length > CONTACT_LIMITS.message) {
    return { ok: false, error: 'Message is too long.' };
  }

  if (!turnstileToken) {
    return { ok: false, error: 'Please complete the verification challenge.' };
  }

  return {
    ok: true,
    data: { name, email, message, website: '', turnstileToken },
  };
}

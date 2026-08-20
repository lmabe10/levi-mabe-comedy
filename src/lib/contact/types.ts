/** Shared field limits for browser and server validation. */
export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
  /** Max raw request body size in bytes (after optional Content-Length check). */
  bodyBytes: 32_768,
} as const;

export type ContactSubmission = {
  name: string;
  email: string;
  message: string;
  /** Honeypot — must be empty when present. */
  website?: string;
  turnstileToken: string;
};

export type ContactSuccess = { ok: true };

export type ContactFailure = {
  ok: false;
  error: string;
};

export type ContactResult = ContactSuccess | ContactFailure;

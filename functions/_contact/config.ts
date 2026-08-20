/** Field and body limits — keep in sync with src/lib/contact/types.ts */
export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
  bodyBytes: 32_768,
} as const;

export type ContactEnv = {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
  TURNSTILE_SECRET_KEY: string;
  /**
   * Comma-separated allowed Origins for browser submissions.
   * Exact matches, plus optional patterns:
   * - `*.pages.dev` matches https://*.pages.dev preview hosts
   * Examples: http://localhost:5173,http://localhost:8788,https://example.com,*.pages.dev
   */
  CONTACT_ALLOWED_ORIGINS?: string;
  /**
   * When set, Turnstile siteverify `hostname` must match this value exactly
   * (e.g. example.com). Leave unset for local test keys / flexible previews.
   */
  CONTACT_TURNSTILE_EXPECTED_HOSTNAME?: string;
};

export type ContactConfig = {
  resendApiKey: string;
  toEmail: string;
  fromEmail: string;
  turnstileSecretKey: string;
  allowedOrigins: string[];
  turnstileExpectedHostname: string | null;
};

function required(env: ContactEnv, key: keyof ContactEnv): string | null {
  const value = env[key];
  if (typeof value !== 'string' || !value.trim()) return null;
  return value.trim();
}

export function loadContactConfig(env: ContactEnv): ContactConfig | null {
  const resendApiKey = required(env, 'RESEND_API_KEY');
  const toEmail = required(env, 'CONTACT_TO_EMAIL');
  const fromEmail = required(env, 'CONTACT_FROM_EMAIL');
  const turnstileSecretKey = required(env, 'TURNSTILE_SECRET_KEY');

  if (!resendApiKey || !toEmail || !fromEmail || !turnstileSecretKey) {
    return null;
  }

  const allowedOrigins = (env.CONTACT_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const hostname = env.CONTACT_TURNSTILE_EXPECTED_HOSTNAME?.trim();

  return {
    resendApiKey,
    toEmail,
    fromEmail,
    turnstileSecretKey,
    allowedOrigins,
    turnstileExpectedHostname: hostname || null,
  };
}

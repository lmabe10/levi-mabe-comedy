import { validateContactClient } from './validation';
import type { ContactResult, ContactSubmission } from './types';

export type { ContactResult, ContactSubmission } from './types';
export { validateContactClient } from './validation';
export { CONTACT_LIMITS } from './types';

/**
 * Browser client: POST validated contact payload to the Pages Function.
 * Design-agnostic — no CSS, copy, or domain assumptions.
 */
export async function submitContact(input: {
  name: string;
  email: string;
  message: string;
  website?: string;
  turnstileToken: string;
}): Promise<ContactResult> {
  const validated = validateContactClient(input);
  if (!validated.ok) {
    return validated;
  }

  let response: Response;
  try {
    response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(validated.data satisfies ContactSubmission),
    });
  } catch {
    return { ok: false, error: 'Unable to send your message. Please try again.' };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, error: 'Unable to send your message. Please try again.' };
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'ok' in payload &&
    (payload as { ok: unknown }).ok === true
  ) {
    return { ok: true };
  }

  const error =
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    typeof (payload as { error: unknown }).error === 'string'
      ? (payload as { error: string }).error
      : 'Unable to send your message. Please try again.';

  return { ok: false, error };
}

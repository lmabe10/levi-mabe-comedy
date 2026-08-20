import type { ValidatedContact } from './validation';

const SUBJECT = 'New website contact message';

export type ResendPayload = {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  text: string;
  html: string;
};

export type SendEmailResult =
  | { ok: true; payload: ResendPayload }
  | { ok: false; reason: 'rejected' | 'unexpected' };

/** Escape visitor-controlled values for HTML email bodies. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildContactEmail(options: {
  toEmail: string;
  fromEmail: string;
  contact: ValidatedContact;
}): ResendPayload {
  const { name, email, message } = options.contact;

  const text = [
    'New contact form message',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const html = [
    '<h2>New contact form message</h2>',
    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
    '<p><strong>Message:</strong></p>',
    `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
  ].join('');

  return {
    from: options.fromEmail,
    to: [options.toEmail],
    reply_to: email,
    subject: SUBJECT,
    text,
    html,
  };
}

/**
 * Send via Resend HTTP API using raw fetch — no SDK.
 * Visitor email is Reply-To only; From is always CONTACT_FROM_EMAIL.
 */
export async function sendContactEmail(options: {
  apiKey: string;
  toEmail: string;
  fromEmail: string;
  contact: ValidatedContact;
  fetchImpl?: typeof fetch;
}): Promise<SendEmailResult> {
  const payload = buildContactEmail({
    toEmail: options.toEmail,
    fromEmail: options.fromEmail,
    contact: options.contact,
  });

  const fetchFn = options.fetchImpl ?? fetch;

  let response: Response;
  try {
    response = await fetchFn('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, reason: 'unexpected' };
  }

  if (!response.ok) {
    return { ok: false, reason: 'rejected' };
  }

  return { ok: true, payload };
}

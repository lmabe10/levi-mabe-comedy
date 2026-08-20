import { describe, expect, it } from 'vitest';
import { loadContactConfig, type ContactEnv } from './config';
import { buildContactEmail, escapeHtml, sendContactEmail } from './email';
import { handleContactRequest } from './handler';
import { matchesAllowedOrigin } from './origin';
import { verifyTurnstile } from './turnstile';
import { validateContactPayload } from './validation';

const baseEnv: ContactEnv = {
  RESEND_API_KEY: 're_test',
  CONTACT_TO_EMAIL: 'inbox@example.com',
  CONTACT_FROM_EMAIL: 'noreply@example.com',
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  CONTACT_ALLOWED_ORIGINS: 'http://localhost:5173,*.pages.dev',
};

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Hello from the form.',
    website: '',
    turnstileToken: 'turnstile-token',
    ...overrides,
  };
}

function jsonRequest(
  body: unknown,
  init: {
    method?: string;
    origin?: string;
    contentType?: string | null;
    contentLength?: string;
  } = {}
) {
  const method = init.method ?? 'POST';
  const headers = new Headers();
  if (init.contentType !== null) {
    headers.set('Content-Type', init.contentType ?? 'application/json');
  }
  if (init.origin) headers.set('Origin', init.origin);
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  if (init.contentLength) headers.set('Content-Length', init.contentLength);

  return new Request('https://example.com/api/contact', {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : payload,
  });
}

function mockFetchSequence(
  handlers: Array<(url: string, init?: RequestInit) => Promise<Response> | Response>
) {
  let i = 0;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const handler = handlers[i++];
    if (!handler) {
      throw new Error(`Unexpected fetch: ${url}`);
    }
    return handler(url, init);
  };
}

describe('validateContactPayload', () => {
  it('accepts valid payload', () => {
    const result = validateContactPayload(validBody());
    expect(result.ok).toBe(true);
  });

  it('rejects honeypot', () => {
    const result = validateContactPayload(validBody({ website: 'http://spam.test' }));
    expect(result.ok).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = validateContactPayload(validBody({ name: '' }));
    expect(result.ok).toBe(false);
  });

  it('rejects CR/LF in name', () => {
    const result = validateContactPayload(validBody({ name: 'Ada\r\nBcc: evil@x.com' }));
    expect(result.ok).toBe(false);
  });

  it('rejects oversized message', () => {
    const result = validateContactPayload(validBody({ message: 'x'.repeat(5001) }));
    expect(result.ok).toBe(false);
  });
});

describe('escapeHtml / email construction', () => {
  it('escapes visitor HTML', () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toContain('&lt;script&gt;');
  });

  it('builds safe Resend payload', () => {
    const payload = buildContactEmail({
      toEmail: 'inbox@example.com',
      fromEmail: 'noreply@example.com',
      contact: {
        name: 'Ada <b>L</b>',
        email: 'ada@example.com',
        message: 'Line 1\nLine 2',
        turnstileToken: 't',
      },
    });

    expect(payload.from).toBe('noreply@example.com');
    expect(payload.to).toEqual(['inbox@example.com']);
    expect(payload.reply_to).toBe('ada@example.com');
    expect(payload.subject).toBe('New website contact message');
    expect(payload.html).toContain('Ada &lt;b&gt;L&lt;/b&gt;');
    expect(payload.html).not.toContain('<b>L</b>');
    expect(payload.text).toContain('Line 1\nLine 2');
  });
});

describe('origin matching', () => {
  it('matches localhost exactly', () => {
    expect(
      matchesAllowedOrigin('http://localhost:5173', ['http://localhost:5173'])
    ).toBe(true);
  });

  it('matches pages.dev wildcard', () => {
    expect(
      matchesAllowedOrigin('https://abc.template-stage.pages.dev', ['*.pages.dev'])
    ).toBe(true);
  });

  it('rejects unknown origins', () => {
    expect(matchesAllowedOrigin('https://evil.test', ['http://localhost:5173'])).toBe(
      false
    );
  });
});

describe('loadContactConfig', () => {
  it('returns null when required secrets missing', () => {
    expect(loadContactConfig({} as ContactEnv)).toBeNull();
  });
});

describe('verifyTurnstile', () => {
  it('rejects unsuccessful verification', async () => {
    const result = await verifyTurnstile({
      token: 't',
      secret: 's',
      fetchImpl: async () =>
        new Response(JSON.stringify({ success: false }), { status: 200 }),
    });
    expect(result).toEqual({ ok: false, reason: 'rejected' });
  });

  it('rejects unexpected payload shape', async () => {
    const result = await verifyTurnstile({
      token: 't',
      secret: 's',
      fetchImpl: async () => new Response(JSON.stringify({}), { status: 200 }),
    });
    expect(result).toEqual({ ok: false, reason: 'unexpected' });
  });

  it('rejects incorrect hostname when configured', async () => {
    const result = await verifyTurnstile({
      token: 't',
      secret: 's',
      expectedHostname: 'example.com',
      fetchImpl: async () =>
        new Response(JSON.stringify({ success: true, hostname: 'evil.test' }), {
          status: 200,
        }),
    });
    expect(result).toEqual({ ok: false, reason: 'hostname' });
  });
});

describe('handleContactRequest', () => {
  it('rejects non-POST', async () => {
    const res = await handleContactRequest(jsonRequest(validBody(), { method: 'GET' }), baseEnv);
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Method not allowed.');
  });

  it('rejects unsupported content type', async () => {
    const res = await handleContactRequest(
      jsonRequest(validBody(), { contentType: 'text/plain', origin: 'http://localhost:5173' }),
      baseEnv
    );
    expect(res.status).toBe(415);
  });

  it('rejects malformed JSON', async () => {
    const res = await handleContactRequest(
      jsonRequest('{not-json', { origin: 'http://localhost:5173' }),
      baseEnv
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid JSON.');
  });

  it('rejects oversized Content-Length', async () => {
    const res = await handleContactRequest(
      jsonRequest(validBody(), {
        origin: 'http://localhost:5173',
        contentLength: String(40_000),
      }),
      baseEnv
    );
    expect(res.status).toBe(413);
  });

  it('rejects invalid fields', async () => {
    const res = await handleContactRequest(
      jsonRequest(validBody({ email: 'not-an-email' }), {
        origin: 'http://localhost:5173',
      }),
      baseEnv
    );
    expect(res.status).toBe(400);
  });

  it('rejects honeypot submission', async () => {
    const res = await handleContactRequest(
      jsonRequest(validBody({ website: 'bot' }), { origin: 'http://localhost:5173' }),
      baseEnv
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).not.toMatch(/honeypot/i);
  });

  it('rejects missing configuration', async () => {
    const res = await handleContactRequest(
      jsonRequest(validBody(), { origin: 'http://localhost:5173' }),
      { ...baseEnv, RESEND_API_KEY: '' }
    );
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe('Contact form is not configured yet.');
  });

  it('rejects Turnstile failure without leaking details', async () => {
    const fetchImpl = mockFetchSequence([
      async () => new Response(JSON.stringify({ success: false, 'error-codes': ['internal'] })),
    ]);
    const res = await handleContactRequest(
      jsonRequest(validBody(), { origin: 'http://localhost:5173' }),
      baseEnv,
      { fetchImpl }
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Unable to send your message. Please try again.');
    expect(JSON.stringify(body)).not.toContain('internal');
  });

  it('rejects unexpected Turnstile response', async () => {
    const fetchImpl = mockFetchSequence([
      async () => new Response('not-json', { status: 200 }),
    ]);
    const res = await handleContactRequest(
      jsonRequest(validBody(), { origin: 'http://localhost:5173' }),
      baseEnv,
      { fetchImpl }
    );
    expect(res.status).toBe(400);
  });

  it('rejects incorrect configured Turnstile hostname', async () => {
    const fetchImpl = mockFetchSequence([
      async () =>
        new Response(JSON.stringify({ success: true, hostname: 'wrong.test' }), {
          status: 200,
        }),
    ]);
    const res = await handleContactRequest(
      jsonRequest(validBody(), { origin: 'http://localhost:5173' }),
      { ...baseEnv, CONTACT_TURNSTILE_EXPECTED_HOSTNAME: 'example.com' },
      { fetchImpl }
    );
    expect(res.status).toBe(400);
  });

  it('rejects Resend failure safely', async () => {
    const fetchImpl = mockFetchSequence([
      async () =>
        new Response(JSON.stringify({ success: true, hostname: 'localhost' }), {
          status: 200,
        }),
      async () => new Response(JSON.stringify({ message: 'secret-provider-error' }), { status: 500 }),
    ]);
    const res = await handleContactRequest(
      jsonRequest(validBody(), { origin: 'http://localhost:5173' }),
      baseEnv,
      { fetchImpl }
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Unable to send your message. Please try again.');
    expect(JSON.stringify(body)).not.toContain('secret-provider-error');
  });

  it('accepts valid submission and constructs Resend request correctly', async () => {
    let resendBody: unknown;
    const fetchImpl = mockFetchSequence([
      async () =>
        new Response(JSON.stringify({ success: true, hostname: 'localhost' }), {
          status: 200,
        }),
      async (_url, init) => {
        resendBody = JSON.parse(String(init?.body));
        return new Response(JSON.stringify({ id: 'email_1' }), { status: 200 });
      },
    ]);

    const res = await handleContactRequest(
      jsonRequest(validBody({ name: 'Ada <script>' }), { origin: 'http://localhost:5173' }),
      baseEnv,
      { fetchImpl }
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(resendBody).toMatchObject({
      from: 'noreply@example.com',
      to: ['inbox@example.com'],
      reply_to: 'ada@example.com',
      subject: 'New website contact message',
    });
    expect(JSON.stringify(resendBody)).toContain('Ada &lt;script&gt;');
    expect(JSON.stringify(resendBody)).not.toContain('Authorization');
  });

  it('returns only safe public error shape', async () => {
    const res = await handleContactRequest(jsonRequest(validBody(), { method: 'PUT' }), baseEnv);
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(['error', 'ok']);
    expect(body.ok).toBe(false);
    expect(typeof body.error).toBe('string');
  });
});

describe('sendContactEmail', () => {
  it('returns rejected on non-OK Resend response', async () => {
    const result = await sendContactEmail({
      apiKey: 'k',
      toEmail: 'a@example.com',
      fromEmail: 'b@example.com',
      contact: {
        name: 'A',
        email: 'a@example.com',
        message: 'Hi',
        turnstileToken: 't',
      },
      fetchImpl: async () => new Response('nope', { status: 400 }),
    });
    expect(result.ok).toBe(false);
  });
});

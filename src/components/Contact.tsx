import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { site } from '@/lib/content';
import { renderHeadline } from '@/lib/headline';
import { submitContact } from '@/lib/contact/client';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

export function Contact() {
  const copy = site.sections.contact;
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const turnstileConfigured = Boolean(TURNSTILE_SITE_KEY?.trim());
  const formBusy = !turnstileConfigured || status === 'submitting';

  useEffect(() => {
    if (!turnstileConfigured || !widgetRef.current) return;

    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !widgetRef.current || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY!.trim(),
        callback: (token) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      });
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile-script="true"]'
    );

    if (window.turnstile) {
      renderWidget();
    } else if (existing) {
      window.onTurnstileLoad = renderWidget;
    } else {
      const script = document.createElement('script');
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
      script.async = true;
      script.defer = true;
      script.dataset.turnstileScript = 'true';
      window.onTurnstileLoad = renderWidget;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
      widgetIdRef.current = null;
    };
  }, [turnstileConfigured]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus('submitting');
    setError('');

    if (!turnstileConfigured) {
      setStatus('error');
      setError('Contact form is not configured yet.');
      return;
    }

    const result = await submitContact({
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      website: String(data.get('website') ?? ''),
      turnstileToken,
    });

    if (result.ok) {
      setStatus('success');
      form.reset();
      setTurnstileToken('');
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
      return;
    }

    setStatus('error');
    setError(result.error);
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken('');
    }
  }

  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="contact-side">
        <span>{copy.sideLabel}</span>
        <div className="contact-mark">✳</div>
      </div>
      <div className="contact-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="contact-title">{renderHeadline(copy.headline)}</h2>
        <p>{copy.blurb}</p>
      </div>
      {status === 'success' ? (
        <div className="contact-success" role="status" aria-live="polite">
          <h3 className="contact-success-title">{copy.success}</h3>
          <p>{copy.successBody}</p>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="contact-honeypot" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <label htmlFor="name">
            Name
            <input
              id="name"
              name="name"
              type="text"
              placeholder={copy.namePlaceholder}
              autoComplete="name"
              required
              disabled={formBusy}
            />
          </label>
          <label htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              placeholder={copy.emailPlaceholder}
              autoComplete="email"
              required
              disabled={formBusy}
            />
          </label>
          <label className="message-field" htmlFor="message">
            Message
            <textarea
              id="message"
              name="message"
              rows={3}
              placeholder={copy.messagePlaceholder}
              required
              disabled={formBusy}
            />
          </label>
          {turnstileConfigured ? (
            <div ref={widgetRef} className="contact-turnstile" />
          ) : (
            <p className="contact-error" role="status">
              Contact form is not configured yet.
            </p>
          )}
          {status === 'error' && error ? (
            <p className="contact-error" role="alert" aria-live="assertive">
              {error}
            </p>
          ) : null}
          <button className="submit-button" type="submit" disabled={formBusy}>
            {copy.submitLabel} <ArrowUpRight size={19} />
          </button>
        </form>
      )}
    </section>
  );
}

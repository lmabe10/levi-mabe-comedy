import { describe, expect, it } from 'vitest';
import { validateContactClient } from './validation';

describe('validateContactClient', () => {
  it('requires turnstile token', () => {
    const result = validateContactClient({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hello',
      turnstileToken: '',
    });
    expect(result.ok).toBe(false);
  });

  it('accepts valid input', () => {
    const result = validateContactClient({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hello',
      turnstileToken: 'token',
    });
    expect(result.ok).toBe(true);
  });
});

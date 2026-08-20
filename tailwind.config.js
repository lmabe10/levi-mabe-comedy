/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
        'accent-contrast': 'var(--color-accent-contrast)',
        border: 'var(--color-border)',
        link: 'var(--color-link)',
        tag: 'var(--color-tag)',
        'block-warm': 'var(--color-block-warm)',
        'block-cool': 'var(--color-block-cool)',
        'block-soft': 'var(--color-block-soft)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-sans)',
      },
    },
  },
  plugins: [],
};

# Comedian Website Template (Folio)

Reusable Vite + React template for comedian marketing sites. Deployable on Cloudflare Pages.

Internal package / local Wrangler name: `comedian-template-folio` (development identifier only — not a production Cloudflare project name).

## Create a new client site

1. Copy this repository.
2. Replace content files in `content/`:
   - `site.json` — name, SEO, images, social links, section copy
   - `bio.md` — biography paragraphs
   - `shows.json` — tour dates (each show needs a unique `id`; use ISO `YYYY-MM-DD` dates)
   - `videos.json` — featured + additional videos (each needs a unique `id` and a full YouTube URL)
3. Replace images under `public/uploads/` (demo assets only — swap for the client).
4. Update theme tokens in `src/styles/tokens.css` (colors, fonts, spacing).
5. Make only minor layout tweaks in components if needed.
6. Configure contact delivery in the Cloudflare dashboard (see `CONTACT-FORM.md`) — never put inbox credentials in content files.

## Development

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

```bash
npm test
```

UI-only Vite (`npm run dev`) does not serve `/api/contact`. For full-stack local testing with Pages Functions:

```bash
npm run pages:dev
```

See `CONTACT-FORM.md` for Turnstile, Resend, and `.dev.vars` setup.

## Contact form

The form posts through `submitContact()` in `src/lib/contact/client.ts` to the Cloudflare Pages Function at `POST /api/contact` (Resend + Turnstile).

- Prefer **Invisible** Turnstile in production so the form does not reserve an empty widget gap.
- Message delivery is controlled by server environment variables only — not by `content/site.json`.
- Full setup, env vars, and production checklist: [`CONTACT-FORM.md`](./CONTACT-FORM.md).

## Pages CMS

Cloudflare Pages CMS is configured in `.pages.yml`. Content lives in `content/`; uploads live in `public/uploads/`.

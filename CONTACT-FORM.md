# Contact form setup (Cloudflare Pages Functions + Turnstile + Resend)

This template ships a reusable contact endpoint at `POST /api/contact`.
Delivery uses **Resend**. Bot protection uses **Cloudflare Turnstile** plus a honeypot field.
Message delivery is controlled only by server environment variables — never by `content/site.json`.

## Turnstile widget mode

**Recommended for production: Invisible Turnstile.**

When creating the widget in the Cloudflare dashboard, choose **Invisible**. The contact form mounts Turnstile with explicit render and does not reserve a fixed checkbox height, so Invisible leaves no empty gap. A Managed/visible site key still works — the widget sizes itself when Cloudflare injects the visible challenge.

Do not hide a Managed/visible Turnstile iframe with CSS.

## Environment variables

### Browser (Vite)

| Variable | Purpose |
|----------|---------|
| `VITE_TURNSTILE_SITE_KEY` | Turnstile site key (public) |

### Server (Cloudflare Pages / Wrangler)

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API key |
| `CONTACT_TO_EMAIL` | Inbox that receives form messages |
| `CONTACT_FROM_EMAIL` | Verified Resend “from” address |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key |
| `CONTACT_ALLOWED_ORIGINS` | Comma-separated allowed `Origin` values for browser posts |
| `CONTACT_TURNSTILE_EXPECTED_HOSTNAME` | Optional. When set, Turnstile `hostname` must match exactly (e.g. `yourdomain.com`) |

Only `VITE_*` values are embedded in the client bundle. Never put secrets in `VITE_` variables.

### Example `CONTACT_ALLOWED_ORIGINS`

```text
http://localhost:5173,http://127.0.0.1:5173,http://localhost:8788,http://127.0.0.1:8788,https://www.yourdomain.com,*.pages.dev
```

- Exact origins for localhost and your production site
- `*.pages.dev` allows Cloudflare Pages preview URLs (`https://<preview>.pages.dev`)

### Turnstile hostname checks

- **Production:** set `CONTACT_TURNSTILE_EXPECTED_HOSTNAME` to your live hostname (no protocol), e.g. `www.yourdomain.com`
- **Local + preview:** leave `CONTACT_TURNSTILE_EXPECTED_HOSTNAME` unset so Cloudflare test keys / preview hostnames are not rejected
- The endpoint always checks Turnstile `success`; hostname matching is an extra production hardening step

## Local development

### UI only (`npm run dev`)

Runs Vite. The site renders even if `VITE_TURNSTILE_SITE_KEY` is missing — the contact form shows an unconfigured state and submission stays disabled. `/api/contact` is **not** available under plain Vite.

### Full stack (`npm run pages:dev`)

Uses Wrangler locally. The CLI passes `dist` and `--compatibility-date` explicitly (`wrangler pages dev dist --compatibility-date=2024-11-01`). Secrets load from `.dev.vars` in the repo root. There is no root `wrangler.toml`, so Cloudflare Pages Git deploys do not auto-detect Wrangler-managed production configuration. (`wrangler.local.toml` documents this template’s local-dev identity; current Wrangler does not accept `--config` for `pages dev`.)

1. Create `.dev.vars` in the repo root (Wrangler loads this for Functions; do not commit it):

```text
RESEND_API_KEY=re_xxxxxxxxx
CONTACT_TO_EMAIL=you@example.com
CONTACT_FROM_EMAIL=onboarding@resend.dev
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
CONTACT_ALLOWED_ORIGINS=http://localhost:8788,http://127.0.0.1:8788,http://localhost:5173,http://127.0.0.1:5173
```

2. Put the matching **always-passes Invisible** Turnstile site key in `.env` (do not commit this as a default in the repo):

```text
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000BB
```

Cloudflare official test keys: https://developers.cloudflare.com/turnstile/troubleshooting/testing/

- Invisible always-passes site key: `1x00000000000000000000BB`
- Matching always-passes secret: `1x0000000000000000000000000000000AA`

These test keys exercise the real verification code path. There is **no** production bypass in the Function.

3. Build and run Pages with Functions:

```bash
npm run pages:dev
```

This builds the Vite app into `dist/` and serves it with Wrangler Pages + `functions/`.

## Cloudflare Pages production

**Production configuration lives in each client’s Cloudflare dashboard — not in a root Wrangler config file.**

This template keeps `wrangler.local.toml` as a local-dev identity reference only (not passed via `--config` — Pages does not support that). It must not include `pages_build_output_dir` or client-specific secrets/origins, and there must be no root `wrangler.toml` / `wrangler.json` / `wrangler.jsonc` so Cloudflare does not treat the repo as Wrangler-managed for production env vars. Manage production variables and secrets in the Cloudflare dashboard.

1. Connect the repo to Cloudflare Pages (build command: `npm run build`, output directory: `dist`). Configure that in the **Pages project settings**, not via Wrangler production config.
2. In the Cloudflare dashboard, create a Turnstile widget with **Invisible** mode for this site’s hostnames.
3. In **Settings → Environment variables** (or **Variables and Secrets**), set the variables below for Production (and Preview if needed). Encrypt secrets as noted in the setup checklist.
4. Set `VITE_TURNSTILE_SITE_KEY` to that Invisible widget’s site key so it is available at **build** time (Vite embeds `VITE_*` into the client bundle).
5. Set runtime Function secrets/vars: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `TURNSTILE_SECRET_KEY`, `CONTACT_ALLOWED_ORIGINS`.
6. Optionally set `CONTACT_TURNSTILE_EXPECTED_HOSTNAME` on Production to your live hostname (no protocol). Leave it unset when using Cloudflare Turnstile **test** keys.
7. After changing variables (especially `VITE_*`), trigger a new deployment from the dashboard (**Deployments → Retry deployment**).

Client-owned accounts: each comedian site’s Resend keys, Turnstile keys, recipient email, from-address, and allowed origins are configured per Pages project in the dashboard — never committed to the template.
## Optional production hardening: rate limiting

v1 does **not** bind Cloudflare rate-limiting products (keeps each client repo simple).

Optional next steps on a live client project:

- Cloudflare WAF rate limiting rules on `/api/contact`
- Bot Fight Mode / Super Bot Fight Mode

Document any account-specific rules in that client’s ops notes — not in this shared template code.

## Copying into other visual templates

This repository is the reference contact implementation for the comedian website collection.

### Copy unchanged (design-agnostic)

- `src/lib/contact/` — browser client, types, validation, and client tests
- `functions/api/contact.ts` + `functions/_contact/` — Pages Function pipeline and tests
- `functions/types.d.ts`
- `vitest.config.ts`
- `CONTACT-FORM.md`
- Contact-related contents of `.env.example`

### Merge into the target template (do not blind-overwrite)

- `package.json` scripts: `test`, `test:watch`, and  
  `pages:dev` → `npm run build && wrangler pages dev dist --compatibility-date=2024-11-01`  
  (**do not** pass `--config` — current Wrangler rejects it for `pages dev`)
- `package.json` devDependencies: `vitest`, `wrangler`, `@cloudflare/workers-types`
- Remove replaced backends (e.g. unused Supabase) from the target
- `.gitignore`: ignore `.env`, `.dev.vars`, `.wrangler/`; keep `!wrangler.local.toml`
- `src/vite-env.d.ts`: declare `VITE_TURNSTILE_SITE_KEY`
- `wrangler.local.toml`: local-dev identity only; set `name` to that template’s internal id (not a production Cloudflare project name)
- `.pages.yml`: mirror contact CMS fields only as needed for that template’s content model

### Adapt in the target template (do not copy editorial UI)

- `src/components/Contact.tsx` — keep the target’s visual design; wire honeypot, Invisible-ready Turnstile (no fixed-height gap), `submitContact()` from `@/lib/contact/client`, and accessible status/error announcements
- Do **not** redesign the form or change CMS copy unless required for the shared payload shape
- Do **not** copy credentials, live domains, emails, test origins, or account identifiers
- Do **not** add a production root `wrangler.toml` / `wrangler.json` / `wrangler.jsonc`

### Verify after porting

```bash
npm test
npm run typecheck
npm run pages:dev
```

## Tests

```bash
npm test
```

Covers validation, origin checks, Turnstile/Resend failure modes, and endpoint behavior with mocked `fetch`.

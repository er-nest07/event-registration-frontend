# Event Registration Frontend: Project Guide

> Read this file first. It tells any AI assistant or developer what this project is, what must be built, how it talks to the backend, and the rules that must not be broken.
> Tip: copy this file to `CLAUDE.md` (Claude Code) or keep it as `AGENTS.md` (Codex, Cursor, others) so tools find it automatically.

## 1. What this project is

The frontend for the **KNUST Computer Science Society (CSS) Event Registration** system.

- People register for **free events** without an account.
- They get a **ticket** (a secret code and a QR code) on screen and by email.
- Door staff scan the QR code to check people in.
- The backend already exists (separate repo). **This project is the frontend only.**
- It is a **separate project** from the official CSS website, but it must **look consistent** with it (see section 4).

Status: not started. Update the checklist in section 12 as work completes.

## 2. Sources of truth

| What | Where |
|---|---|
| Backend repo | https://github.com/CSS-Developers/event-registration (branch `feat/backend-core`, `dev` once merged) |
| Backend handover | `docs/event-registration-frontend-handover.pdf` (copy the PDF into this repo's `docs/` folder) |
| Full API reference | `API.md` in the backend repo |
| TypeScript types and fetch examples | `frontend/types.ts` and `frontend/examples.md` in the backend repo (also reproduced in the handover PDF appendices) |
| Official CSS website (design reference) | thecssknust.vercel.app (confirm the exact URL) |
| Official site source (design reference) | https://github.com/BinaryBond/CSS_WEBSITE (README has the design rules) |

If this guide and the backend handover ever disagree, **the handover and the backend win**. Tell the project owner so this file can be fixed.

> **Status note (Oct 2026):** the backend repo was unreachable when the frontend was started
> (GitHub returns "repository not found" for every branch — likely private or renamed), and the
> handover PDF was not in this folder. `src/api/types.ts` and `src/api/client.ts` were therefore
> **derived from this file** (sections 5–7). Verify them against `API.md` / `frontend/types.ts`
> once the backend repo is accessible, especially the `Ticket.event.id` field and the exact
> register/resend response envelopes.

## 3. Tech stack

- **React + TypeScript**, built with **Vite**
- **Tailwind CSS** (the official site also uses Tailwind, which keeps styling consistent)
- **React Router** for pages
- **motion** (Framer Motion) for animation
- Optional: **shadcn/ui** and **Aceternity UI** components (copied into the project through the shadcn CLI, so we own and can edit the code)
- Optional: **TanStack Query** for data fetching. Turn off refetch on window focus (see section 7).
- Plain `fetch` through one helper (section 6). No axios needed.

Environment variable: `VITE_API_BASE_URL` (no trailing slash). Local value: `http://localhost:3000`. Never hard-code the URL in components.

## 4. Design system (match the official CSS website)

Source: the `BinaryBond/CSS_WEBSITE` README. **Verify against the live site before finalising**, since the site may have changed.

### Colours (define as Tailwind theme tokens)

| Token | Hex | Use |
|---|---|---|
| `brand-blue` | `#3366FF` | Dominant colour: main sections, accents, primary buttons |
| `text-body` | `#737373` | Paragraph text |
| `text-heading` | `#464555` | Section titles and subtitles on light backgrounds |
| `white` | `#FFFFFF` | Section backgrounds, text on blue |
| `green` | `#22BA5C` | Green buttons or text (WhatsApp related) |
| `cyan` | `#22A4C8` | Cyan buttons or text (Telegram related) |
| `purple` | `#8C51FF` | Bootcamp accent (Zaptek). Probably not needed here |
| `black` | `#000000` | Binary Basic Club accent. Probably not needed here |

New elements must follow this palette. For status screens (scanner, ticket states) use green for success, and add clear red and amber tokens for errors and warnings. Always pair colour with text and an icon, never colour alone.

### Typography

- **Headings:** DM Sans, weight Black (900) for page and section titles
- **Body:** Montserrat, weight Medium (500) for paragraphs
- **Buttons:** Bold (700)
- Semi-bold and Extra-bold for special text in cards and sections

**Self-host the fonts** (for example the `@fontsource/dm-sans` and `@fontsource/montserrat` npm packages). Do not load them from Google Fonts. The ticket page must not load third-party fonts (see section 8).

### Components

- **Buttons:** hover lightens the colour with a smooth transition. The official site uses pill (fully rounded) buttons on its Events and Resources pages and subtly rounded buttons elsewhere. Use **pill buttons** here since this belongs with the Events pages.
- **Navbar:** transparent, static, subtle animation, hamburger menu on mobile, a Dark Mode / Light Mode toggle.
- **Footer:** page links, social links, contact info.
- **Imagery:** bright, professional, real photos from events. Avoid generic stock photos.
- **Breakpoints:** Tailwind defaults (`md` 768px, `lg` 1024px). Design mobile first. Most attendees will be on phones.

### Creative freedom

Aceternity-style effects (spotlights, gradients, animated cards) are welcome on the event list, event detail and registration pages **as long as** colours, fonts and the overall feel stay recognisably the CSS brand. Keep animation light on the ticket and scanner pages.

## 5. Pages and routes

| Page | Route | Required |
|---|---|---|
| Event list | `/` or `/events` | Yes |
| Event detail | `/events/:id` | Yes |
| Registration form | `/events/:id/register` (or a form on the detail page) | Yes |
| Ticket page | `/tickets/:code` | Yes. **This exact path is fixed** because confirmation emails link to it |
| Resend my ticket | `/resend` (optional `?event=<id>`) | Yes |
| Door scanner | `/scanner/:eventId` | Optional, staff only, never linked publicly |

Out of scope: admin UI, user accounts, login, payments.

### Page behaviour

**Event list.** `GET /api/events?page=1&limit=20`. Shows only published events that have not ended, soonest first. Each card: banner (or placeholder), title, start time in Accra time, venue, spots left. When `spotsLeft === 0` show "Sold out" but still link to the detail page. Needs loading skeletons, an empty state ("No upcoming events right now. Check back soon."), an error state with retry, and pagination from `meta.totalPages`. If the user lands on a page past the end (empty `data`), send them to page 1. Show "Happening now" when `startsAt <= now <= endsAt`. Do not poll.

**Event detail.** `GET /api/events/:id`. Shows banner, title, full description (use `whitespace: pre-line`), venue, start and end times, spots left. Register button: disabled with "Sold out" when `spotsLeft === 0`; disabled with "This event has ended" when `hasEnded` is true (trust the server value, never recompute from the browser clock); otherwise enabled. A 404 (unknown, draft or cancelled event) and a 400 (malformed id) both show "Event not found" with a link back to the list.

**Registration form.** `POST /api/events/:id/register` with `{ fullName, email, phone? }`. Exactly those keys, anything else is a 400. Rules to mirror client-side (the server re-checks everything):
- `fullName`: required, trimmed, 2 to 100 characters
- `email`: required, valid address, at most 254 characters. Keep client checks basic (an `@` and a dot). Tell users the ticket is emailed there
- `phone`: optional. **Omit the key when empty** (`""` and `null` are rejected). Ghana mobile numbers only: spaces, hyphens and parentheses are ignored, then it must be `0XXXXXXXXX`, `+233XXXXXXXXX` or `233XXXXXXXXX`, where the first two of the nine digits are one of `20 23 24 25 26 27 28 29 50 53 54 55 56 57 59`. Hint text: "e.g. 024 123 4567"

On `201`: navigate to `/tickets/<ticketCode>` using a **replace** navigation (so Back does not return to a filled-in form) and show "Check your email for your ticket". The ticket page must still work on a hard refresh by calling `GET /api/tickets/:code`. Disable the submit button while the request is in flight. Do not store the form in browser storage.

Validation errors arrive as `error.details[]` with `{ path, message }`. Map `path` to the form field. A body-level problem has `path: ""`: show it at the top of the form. Write friendly messages ourselves for `fullName` and `email` (the server's wording is for developers). Keep the server's message for `phone` only, since it is already friendly.

**Ticket page.** `GET /api/tickets/:code` for data, QR image from `API_BASE + qrUrl` in a plain `<img>`. The response has no email, phone or code, so take the code from the URL. Show name, event title, venue, start and end in Accra time, the QR, and the **code as text under the QR**. Tell people to keep the page private.

| State | How to detect | What to show |
|---|---|---|
| Valid | `status: "CONFIRMED"`, `checkedInAt: null` | QR, details, Cancel button |
| Checked in | `CONFIRMED` and `checkedInAt` set | "Checked in at <Accra time>". Dim or hide the QR. Hide Cancel |
| Cancelled | `status: "CANCELLED"`, `qrUrl: null` | "This ticket was cancelled." No QR. Link to the event |
| Event over | `event.hasEnded === true` | Neutral "This event has ended" banner |
| Not found | 404 `NOT_FOUND` | "We couldn't find this ticket." Link to the resend form (old codes die when someone cancels and re-registers) |
| Loading / error | | Skeleton; retry on network error |

Cancel: a "Cancel my ticket" button behind a confirmation dialog ("Cancel your ticket? This frees your spot and the QR code stops working. You can register again, but you will get a new ticket."). Calls `DELETE /api/tickets/:code`. `204` means reload the ticket (it now shows cancelled; repeating is also 204). `409 ALREADY_CHECKED_IN` means "This ticket has already been used and can't be cancelled." and refresh.

Offline use at the door: a "Print / save as PDF" button (`window.print()` with print CSS showing only name, event, time, venue, QR and code), and a "Download QR" button (fetch the QR as a blob and use an object URL with `<a download="ticket.png">`). Tell users to screenshot the ticket too.

**Resend my ticket.** `POST /api/events/:id/resend` with `{ "email": "..." }`. The server **always** replies `202` with the same message, whatever the address. Show that message (or text that says the same and nothing more). **Never** say whether the email exists, "no registration found", or "email sent to <address>". Do not change wording, redirects or any other behaviour based on the answer. Say "it may take a minute". Client-side email format checks are fine.

**Door scanner (optional).** `POST /api/admin/events/:id/check-in` with `{ "ticketCode": "<decoded QR text>" }` and header `x-api-key: <CHECK-IN key>`. This is a separate key from the admin key. Staff type it into the page on start; keep it in memory only (at most `sessionStorage`), never in the build, URL or analytics. Use `getUserMedia` plus a QR decoding library (camera needs HTTPS or localhost). Add a manual code field. Pause for 1 to 2 seconds after each result and ignore repeated identical decodes. Screens:

| Response | Staff screen |
|---|---|
| `200` | Big green: "Welcome, <fullName>" and Accra time |
| `409 ALREADY_CHECKED_IN` | Big amber/red: "Already used", with `details.fullName` and first-scan time |
| `409 TICKET_CANCELLED` | Red: "Ticket cancelled" |
| `409 WRONG_EVENT` | Red: "This ticket is for a different event" |
| `404 TICKET_NOT_FOUND` | Red: "Ticket not recognised" |
| `404 NOT_FOUND` or `400 VALIDATION_ERROR` | "This scanner is set up for an event that doesn't exist. Ask the organiser." Stop scanning |
| `401 UNAUTHORIZED` | "Wrong or missing access key". Ask again. Stop scanning |
| `429` | "Too many scans. Wait <Retry-After> seconds". Pause camera |
| Network error or 5xx | Amber: "Couldn't check this ticket. Try again". Never show "welcome" without a 200 |

## 6. How the frontend talks to the backend

### Endpoints used

| Action | Request |
|---|---|
| List events | `GET /api/events?page=&limit=` |
| One event | `GET /api/events/:id` |
| Register | `POST /api/events/:id/register` |
| View ticket | `GET /api/tickets/:code` |
| QR image | `GET /api/tickets/:code/qr.png` (use in `<img>`) |
| Cancel ticket | `DELETE /api/tickets/:code` |
| Resend ticket | `POST /api/events/:id/resend` |
| Scanner check-in | `POST /api/admin/events/:id/check-in` |

`/health` and `/ready` exist at the root but are **not** for the UI.

### Conventions

- **Success:** `{ "data": ... }`. Lists add `"meta": { page, limit, total, totalPages }`. `204` has no body.
- **Error:** `{ "error": { "code": "EVENT_FULL", "message": "...", "details"?: ... } }`. **Branch on `code`, never on `message`.**
- Send `Content-Type: application/json` **only** on requests with a body. Do not set it on GETs (a header-less GET skips the CORS preflight).
- **No cookies, never `credentials: "include"`.**
- Replies that are not JSON (a proxy 502 page, a dropped connection) must be handled as generic errors.
- Pagination: `page` starts at 1, `limit` is 1 to 50 (default 20).
- Event ids are UUIDs. A malformed id is 400, a missing one is 404: handle both as "event not found".
- Dates are ISO 8601 UTC with trailing `Z`. **Display in Africa/Accra** and name the timezone:

```ts
const accra = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Accra',
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: false,
});
export const label = (iso: string) => `${accra.format(new Date(iso))} (Accra time, GMT)`;
```

- `bannerUrl` is `null`, a relative path (local dev) or an absolute URL (production). Use `new URL(bannerUrl, API_BASE).href`. For `null`, show a neutral placeholder (not a broken image) and reserve the space so the layout does not jump. Use a fixed-ratio frame with `object-fit: cover`.
- `fullName`, `title`, `description` and `venue` are plain text. Never render as HTML.
- Ticket, register, resend and check-in responses are `Cache-Control: no-store`. Do not override that and do not put them in a service-worker cache.

### The one API helper

All API calls go through a single `request()` helper in `src/api/client.ts` that never throws and returns `{ ok: true, data }` or `{ ok: false, code, message, details, retryAfterSeconds }`, with `NETWORK_ERROR` and `UNEXPECTED_RESPONSE` codes for failures with no proper reply. A complete version, plus a `fieldErrors()` helper and one function per endpoint, is in **Appendix B of the handover PDF** and in `frontend/examples.md` in the backend repo. Copy it rather than rewriting it. Types are in Appendix A / `frontend/types.ts`.

## 7. Error codes and rate limits

| HTTP | `code` | Meaning | UI message |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Body, query or id invalid | Per-field messages. For an event id: "Event not found" |
| 400 | `INVALID_JSON` | Bad JSON (a bug) | "Something went wrong. Please try again." |
| 401 | `UNAUTHORIZED` | Scanner key missing or wrong | "Wrong or missing access key." |
| 404 | `NOT_FOUND` | Unknown, draft or cancelled event; unknown ticket | "Event not found" / "Ticket not found" |
| 404 | `TICKET_NOT_FOUND` | Scanner only | "Ticket not recognised." |
| 409 | `ALREADY_REGISTERED` | Email already registered for this event | "This email is already registered for this event." Link to resend |
| 409 | `EVENT_FULL` | No spots | "Sorry, this event is full." Switch page to sold out |
| 409 | `EVENT_ENDED` | Event over | "This event has already ended." Switch page to ended |
| 409 | `ALREADY_CHECKED_IN` | Cancel: used ticket. Scanner: already scanned | see sections 5 |
| 409 | `WRONG_EVENT`, `TICKET_CANCELLED` | Scanner only | see scanner table |
| 413 | `PAYLOAD_TOO_LARGE` | Body over 100 KB (a bug) | Generic message |
| 429 | `RATE_LIMITED` | Too many requests | "Too many requests. Please wait <n> seconds and try again." |
| 500 | `INTERNAL_ERROR` | Server error | "Something went wrong on our side. Please try again in a moment." |

Spots left can change between page load and submit. Registration does not reserve a spot. If submit returns `EVENT_FULL` or `EVENT_ENDED`, update the page state.

### Rate limits (per IP)

| Limit | Applies to | Window |
|---|---|---|
| 600 | Public reads (events, tickets, QR, banners) | 15 min |
| 100 | Register, resend, cancel, unknown routes | 15 min |
| 30 | Register, resend, cancel (shared) | 10 min |
| 5 | Register and resend for the same event and email (shared) | 1 hour |
| 300 | Scanner check-in | 10 min |

On 429: read `Retry-After` (seconds, fall back to 60 if missing), disable the button, show a countdown (use "about N minutes" over 90 seconds), re-enable when it ends. **Never retry automatically. Never auto-retry POSTs.** Campus networks share one IP, so keep requests low: fetch the list once per visit, do not poll, **turn off refetch on window focus**, load each QR once, reuse the register response instead of refetching.

## 8. Security and privacy rules (non-negotiable)

1. **No admin key anywhere** in the frontend: not in the bundle, env files, comments, URL, storage or analytics. There is no admin UI, so there is no reason to have it.
2. The **check-in key** appears only on the scanner page, typed in by staff, never baked into the build, never logged.
3. **Ticket codes are secrets** (anyone with one can view, cancel and use the ticket). Do not log them (console, error trackers, session replay), do not send them to analytics, do not put them in localStorage or cookies.
4. Treat `/tickets/<code>` URLs like passwords. Exclude `/tickets/*` from analytics page-view tracking. Set `Referrer-Policy: no-referrer` (or `same-origin`) on the ticket page. **No third-party scripts, fonts or images on the ticket page**, and check that error reporters and chat widgets do not capture the URL.
5. Do not log request or response bodies (names, emails, phones, codes).
6. Render all user-supplied text as text: no `innerHTML`, no `dangerouslySetInnerHTML`. This includes the attendee name on the scanner screen.
7. HTTPS only in production (frontend and API). Camera access also needs HTTPS.
8. No cookies. Do not store the registration form in browser storage. Do not pre-fill someone else's details.
9. **Do not reveal whether an email is registered**, beyond what the API already does (`ALREADY_REGISTERED` on register is the one known exception). Draft, cancelled and unknown events must look identical. Never undo the API's deliberate uninformative responses.
10. The register response contains the ticket code, and emails are unverified, so someone can register with another person's email. **Do not describe the on-screen ticket as proof of identity.**
11. Check licences for any copied template or component before shipping.

## 9. Backend setup for local development

Needs Node, PostgreSQL 16 and the backend repo. Full steps are in the backend README ("Quick start") and Appendix C of the handover.

```bash
git clone https://github.com/CSS-Developers/event-registration.git
cd event-registration
npm ci && npm run prisma:generate
# create the database and .env (see README steps 2 and 3), add to .env:
#   CHECKIN_API_KEY="<different random string, 16+ chars>"
#   APP_BASE_URL="http://localhost:5173"
npm run migrate:deploy
npm run seed
npm run dev          # http://localhost:3000, check /ready
```

- `npm run seed` creates three `[SEED]` events: **Accra Developer Meetup** (open, 100 capacity), **Sold-Out Design Workshop** (full, for testing `EVENT_FULL`), **Hackathon (Draft)** (hidden, its id returns 404). Event ids change every time you seed. Get published ids from `GET /api/events`.
- `npm run seed:reset` deletes only the `[SEED]` data.
- CORS: in development, `http://localhost:<any port>` already works. Other origins (a phone over LAN) must be listed in the backend `.env` as `CORS_ORIGINS`.
- In development, emails are written to the backend's `outbox/` folder as `.eml` files instead of being sent.

## 10. Suggested folder structure

```
src/
  api/
    client.ts        # request() helper, API_BASE, absoluteUrl()
    types.ts         # copied from the backend handover
    events.ts        # listEvents, getEvent
    tickets.ts       # register, getTicket, cancelTicket, resendTicket
    scanner.ts       # checkIn
  components/
    ui/              # Button, Card, Input, Badge, Dialog (shared, branded)
    events/          # EventCard, EventBanner, SpotsBadge
    ticket/          # TicketCard, QrImage
  pages/
    EventListPage.tsx
    EventDetailPage.tsx
    RegisterPage.tsx
    TicketPage.tsx
    ResendPage.tsx
    ScannerPage.tsx
  lib/
    dates.ts         # Accra time formatting
    phone.ts         # client-side phone check (mirrors server rules)
  styles/            # Tailwind theme tokens, fonts
```

## 11. Working method

1. Set up Vite + React + TS + Tailwind, theme tokens (section 4) and self-hosted fonts.
2. Build the shared UI components (Button, Card, Input, Dialog) once, in the CSS brand.
3. Copy the API layer from the handover appendices into `src/api/`.
4. Build each page **with fake data first**, shaped exactly like the `PublicEvent` and `Ticket` types, so the design can be iterated without the backend.
5. Keep components **presentational** (they take props) and pages **smart** (they fetch and pass props down), so restyling never breaks data logic.
6. Swap fake data for real calls one page at a time, against the seeded backend.
7. Design every state: loading, empty, error with retry, sold out, ended, rate-limited, not found.
8. Run the full test checklist (handover section 10, 22 scenarios) against the seeded backend before calling anything done.

### Rules for AI assistants working in this repo

- Follow sections 4 (design), 6 (API conventions) and 8 (security) exactly.
- Do not add dependencies that load third-party scripts, fonts or analytics on the ticket page.
- Do not invent endpoints, fields or error codes. If something is not in the handover or `API.md`, say it is missing and ask.
- Do not store tickets codes, emails or keys in browser storage.
- Prefer small, reviewable changes, and update the checklist below when a task is finished.

## 12. Task checklist

- [x] Project setup (Vite, React, TS, Tailwind, router)
- [x] Theme tokens, self-hosted fonts, dark/light toggle
- [x] Shared components (Button, Card, Input, Dialog, skeletons)
- [x] Navbar and footer matching the official site
- [x] API layer (`client.ts`, `types.ts`, endpoint functions) — derived from this file, see section 2 status note
- [x] Event list page (loading, empty, error, sold out, pagination)
- [x] Event detail page (sold out, ended, not found)
- [x] Registration form (validation, phone rules, field errors, redirect)
- [x] Ticket page (all states, cancel dialog, print, download QR)
- [x] Resend page (uninformative message, 429 countdown)
- [x] Rate-limit handling everywhere
- [ ] Door scanner (optional)
- [ ] Security review against section 8
- [ ] Test checklist run (22 scenarios) — needs the real seeded backend
- [ ] Deployment and CORS/APP_BASE_URL configured

Pages currently run against a **mock API layer** (`src/api/mock.ts`, enabled by
`VITE_USE_MOCKS=true` in `.env.development`) because the backend was unavailable. Set
`VITE_USE_MOCKS=false` and point `VITE_API_BASE_URL` at the real API to go live — no page code
changes needed.

## 13. Open questions and blockers

Fill in answers as they arrive.

| # | Question | Answer |
|---|---|---|
| 1 | Deployed API base URL | (blank in handover) |
| 2 | Production frontend origin (for backend `CORS_ORIGINS` and `APP_BASE_URL`) | |
| 3 | Is the 600 reads / 15 min per IP budget enough for the expected crowd? | |
| 4 | Who distributes and rotates the check-in key? | |
| 5 | How does the scanner learn the event id (link, QR, picker)? | |
| 6 | Is returning the ticket code from register acceptable at launch? | |
| 7 | `TRUST_PROXY` setting in production; is the shared-IP rate limit acceptable for campus events? | |
| 8 | Support contact or wording for registration or email failures | |
| 9 | Organisation name, logo, brand colours (the colours in section 4 come from the official site's repo README) | |
| 10 | Privacy notice and terms links for the registration form | |
| 11 | How do the official site's Events page and this app connect? Do the website's events link to `/events/:id/register` here, and are the website's events the same as the backend's events? | |
| 12 | Confirm the official site's exact URL, and whether its design has changed since the README | |

## 14. Known backend limitations (design around them)

- No authentication or accounts. Tickets are identified only by the secret code. This is why there is no admin UI.
- The register response contains the ticket code; emails are not verified.
- Rate limits are in memory and per IP; they reset on restart.
- No waitlist, no payments.
- Phone numbers and emails are unverified (phone is format-checked only).
- Email delivery is at-least-once (a person may get it twice, or it may land in spam).
- Times in emails are always Accra time; there is no per-event timezone.

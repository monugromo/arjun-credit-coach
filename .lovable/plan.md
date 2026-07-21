## Goal

Rebuild the GroScore onboarding as a stack of single-purpose full-screen steps (matching the new spec / screenshots) with a new brand palette. The WhatsApp-style Arjun chat becomes the product home the user lands in only after payment. Same components/UI library, new flow + UX.

## New brand tokens (added to `src/styles.css`)

- `--gs-brand: #1c6b4f` (header/dark green)
- `--gs-accent: #4bbf72` / hover `#3aa762` (CTA pill)
- `--gs-ink: #0e1b2a`, `--gs-muted: #6b7a86`
- `--gs-card: #f4f8f4`, `--gs-hairline: #e3e8e2`, `--gs-navy: #12294a`
- Chat header stays WhatsApp-green (product home only)

## Screen sequence (state machine in `src/routes/index.tsx`)

Editable dev-nav toggles for `userState`, `bureauResult`, `isNTC`, `tasks`, `trialAvailable` so every branch is testable.

1. **Landing** — white bg, GroScore wordmark (Gro accent / Score navy), tagline, animated gauge 413 (red/POOR) → 750+ (green/GOOD) over ~2.2s with arc colour interpolation, CTA fades in on completion, trust line at bottom.
2. **Phone** — green header "Enter your phone number", +91 selector, 10-digit numpad, pre-checked soft-check consent, demo rows, `Next`.
3. **OTP** — header "Verifying your number", 4 boxes auto-filling 1-2-3-4 with "✨ Detecting code from SMS…", resend timer, auto-advance.
4. **Router** (invisible): new → screen 5, active → home, lapsed → ₹99 restart paywall variant → home.
5. **Name** — header "What's your name?", empty text field, PAN-card illustration with "Name" circled + arrow, caption, `Continue` triggers mock fetch.
6. **Fetching** — header "GroScore", spinner + "Aapki details check kar rahe hain…" ~1.5s → branch.
7. **Confirm identity** (`bureauResult=hit`) — masked "IS THIS YOU?" card, `Yes, that's me`, secondary `Edit name` / `Change number` / `PAN not found? Enter manually`.
7a. **PAN input** — auto-uppercase 10-char field → re-fetch. If still no-hit → `isNTC=true` → screen 8 NTC variant.
8. **Analyzing** — header "GROSCORE", 4 progress ticks over ~1.8s, trust footer. Mocks task-gen → `tasks`.
9. **Paywall `<Paywall score tasks isNTC amount />`** (reusable):
   - Aspiration hero: gauge + "413 → 750+" (NTC copy variant).
   - 4-row value stack (always).
   - Dynamic hero line depending on tasks/score/NTC.
   - Task module: 0 hidden, 1–2 "sabse tez jeet", 3+ top-3 by points + "aur N aur"; each row = title + green `+pts` chip (fix locked).
   - Loud autopay line: "₹9 aaj · phir ₹99/mahina 3 din baad · 1 din pehle yaad dilayenge · kabhi bhi cancel."
   - Price: ~~₹299~~ → ₹9, 67% OFF chip.
   - CTA copy depends on NTC. Trust line. Single screen, CTA visible without scrolling.
10. **Razorpay mock** — CTA → success → home. Amount = ₹9 or ₹99.
11. **Product home** — existing WhatsApp-style Arjun chat: header + score summary card at top (413 / POOR / Powered by Equifax / reassurance) + first Arjun message "Ho gaya! 🎉 Sabse pehle aapki #1 problem theek karte hain." No popup.

## Reusable pieces

- `<OnboardHeader title />` — dark-green bar, white title, back chevron.
- `<PrimaryCta />` — full-width green pill pinned bottom with safe-area padding.
- `<Paywall score tasks isNTC amount />` — takes props, renders adaptively.
- Score gauge component (SVG arc, colour interpolation) reused on Landing + Paywall.

## Mock data

Update `src/lib/groscore-data.ts`:
- Rename coach → Arjun everywhere in strings.
- Demo accounts: Rahul (new, NTC), Sonu (new, hit, 413, 3 tasks), Darpan (lapsed → ₹99 restart).
- Task list with `{title, points, urgent?}` shape; helper to sum points; dev toggles for `[]` / `[one]` / decent-score 720 case.

## What gets removed / kept

- Remove old landing, permissions, NTC checklist, email intro, score-journey, expired, etc. that don't map to new spec (keep the chat + report + tasks + profile + subscription screens; those are already the product home).
- Keep the mini-profile popup work? **No** — spec says "No separate popup — value already shown on the wall." Remove `showCallPopup` and `MiniProfilePopup`.

## Out of scope

- Real Equifax / Razorpay / auth (still mocked with timeouts).
- Desktop layout — mWeb only (max-width 430px).

## Technical notes

- All screens live inside `Index()` state machine; each screen is a component in `src/routes/index.tsx` (mirrors current pattern). No new routes.
- Brand tokens via CSS vars → Tailwind arbitrary values (`bg-[var(--gs-brand)]`) or added to `@theme inline` for `bg-gs-brand` utilities.
- Gauge animation: `requestAnimationFrame` over 2200ms, ease-out; arc stroke colour lerped red→amber→green.
- Playwright verify: landing→phone→otp→name→fetch→confirm→analyzing→paywall→success→chat happy path with Sonu.

This is a large rewrite (~1000+ lines touched in `src/routes/index.tsx`). Approve to proceed.

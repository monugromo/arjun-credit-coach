
## Goal

When the user first lands on the chat screen (right after onboarding), show a modal popup with their mini credit profile + reassurance copy. The popup offers two actions:

- **Ask our finance expert** → starts the existing call flow, which after the call triggers the existing auto‑message flow (unchanged).
- **Cancel** → just closes the popup.

Works for both demo users: NTC (Rahul) and Credit-score / Distressed (Sonu). Nothing else in the app changes.

## What appears in the popup

Header: user avatar/initial + name + phone.

Mini credit profile card (same numbers already used elsewhere in the app):

- **Distressed (Sonu, 9876500002)** — Score `413`, band `Poor`, `3 loans · 0 cards · 5 enquiries`, small "6 issues to fix" chip.
- **NTC (Rahul, 9876500001)** — Score `—`, band `No score yet`, `0 loans · 0 cards · 0 enquiries`, small "No credit history" chip.

Reassurance line (as requested, same copy for both):
> "It's okay, you are not rejected for a loan. Your score is just less. We will help you build it."

Buttons:
- Primary: **Ask our finance expert** (phone icon)
- Secondary: **Cancel**

## Behavior change on the landing chat screen

Current flow (`src/routes/index.tsx`, `useEffect` around lines 141–161):
1. Enter chat → Kabir auto-streams intro messages → auto navigates to `call-incoming`.

New flow:
1. Enter chat → Kabir auto-streams the same intro messages (unchanged).
2. Instead of auto‑navigating to `call-incoming`, open the new popup (state: `showCallPopup = true`).
3. **Ask our finance expert** → close popup, `setChatPhase("awaiting-consent")`, `go("call-incoming")` (this reuses the existing `IncomingCall` → `ActiveCall` → `postCallChat` path, so the existing auto messages after the call fire exactly as they do today).
4. **Cancel** → close popup only. Chat stays where it is; no other side effects. (The user can re-open by tapping the existing header call icon if they want — no new entry points added.)

Nothing else in the chat, post-call streaming, tasks, report screens, or landing/onboarding is touched.

## Technical details

- **New component** `MiniProfilePopup` in `src/routes/index.tsx` (kept local to match the file's existing pattern of co-located components). Props: `user: DemoUser`, `onCall: () => void`, `onCancel: () => void`. Renders as a centered modal with a dark scrim (`fixed inset-0 z-50`), rounded card, uses existing tokens (`WA.green`, gray palette) and `lucide-react` icons already imported (`Phone`, `X`, `TrendingDown`/`UserPlus`).
- **Content branching** inside the component on `user.key === "ntc"` vs `"distressed"` — reuse numbers already present in `KabirProfile` / `CreditReport` (score `413`, `NTC`, counts `3/0/5` vs `0/0/0`, `distressedFactors` count for the "issues" chip).
- **State**: add `const [showCallPopup, setShowCallPopup] = useState(false)` in the main `App` component.
- **Trigger**: in the intro `useEffect`, replace `setScreen("call-incoming")` with `setShowCallPopup(true)` (keep `setChatPhase("awaiting-consent")` so we stay in the correct phase).
- **Reset**: clear `showCallPopup` in `logout()` alongside the other resets.
- **Render**: mount `{showCallPopup && user && <MiniProfilePopup ... />}` alongside the existing screen switch so it overlays the chat.
- No changes to `IncomingCall`, `ActiveCall`, `postCallChat`, or any chat message content — the automatic post-call messages continue to fire from the existing code path.

## Out of scope

- No changes to landing, phone/OTP, PAN, permissions, NTC checklist, chat messages, report, tasks, profile, or subscription screens.
- No new routes, no new data, no design-token changes.

# Onboarding GroScore Credit Coach (Kabir)

GroScore — Lovable Build Spec v2 (Disha-replica, Coach "Arjun")

Paste into Lovable. Build a mobile-first web app that is an exact visual replica of the Disha AI app, but as a credit coach named Arjun (male). Use mock/static data — simulate OTP, bureau fetch, permissions, payments, and calls. The goal is a clickable prototype a reviewer can play through for two demo users: NTC and Distressed.

0. Two demo logins (important)

Build it so a reviewer can: log in as the NTC user → log out → log in as the Distressed user. Each identity loads its own scripted chat, report, and tasks.

Demo A — NTC: phone 98765 00001, name Rahul, PAN found, no credit score yet ("new to credit").

Demo B — Distressed: phone 98765 00002, name Sonu, PAN found, score 413 (Poor), 6 fixable issues.

(Any OTP 123456 works. Map each phone number to its demo dataset.)

1. Design language — copy Disha exactly

Light theme. Background = warm cream #F3EFE7 with faint line-art doodles (use finance/credit doodles: ₹, cards, charts, coins, calculator, piggy bank — same style as Disha's health doodles).

Message bubbles = white #FFFFFF, rounded 16px, soft shadow, dark text #1C1C1E, small grey timestamp #9AA0A6 bottom-right inside the bubble.

Header bar = white, with coach avatar (circle), name in bold black, "online" with a green dot #22C55E.

Accent / primary = green #16A34A (buttons, highlights, call accept).

Coach avatar = a friendly professional MALE photo (placeholder), name Arjun.

Rounded everything, clean, generous spacing. Mobile width ~390px.

2. ONBOARDING (screen-based — not chat)

S1 — Landing

Green gradient full screen, GroScore logo at center-top.

Headline (white, bold): "Aapka personal credit coach"

Sub: "Loan nahi mila? Koi baat nahi — main aapko loan-ready banaunga."

Trust row with lock icon: "Private & judgment-free" · "Aapka data safe rehta hai."

Big light button: "Let's Get Started"

Fine print: "By continuing you agree to Terms & Privacy."

S2 — Mobile number

Title: "Apna number daalein"

Phone field +91 | __________.

Smart hint (simulate the Google number-hint API): show a small chooser of number(s) linked to the user's PAN — e.g., a tappable chip "98765 00001 (PAN-linked)". Tapping fills the field. (In prototype, just show 1–2 mock chips.)

Button: "Send OTP"

S3 — OTP (auto-fetch)

Title: "OTP daalein", sub "Bheja gaya 98765 0000X par".

6 OTP boxes. Auto-fetch & auto-fill the OTP (simulate SMS auto-read — boxes fill themselves after ~1s), then auto-advance.

"Resend OTP (timer)".

S4 — Name

Title: "Aapka naam?"

Single text input + "Continue".

S5 — Fetch & validate bureau report

Loading state: "Aapki credit report aa rahi hai…" (spinner ~2s).

PAN confirmation (single click): show a card — "Yeh aap hain?" with Name + masked PAN (ABCxxxx1F) → button "Haan, yeh main hoon" (one tap confirms).

If details NOT found: show "Aapki details nahi mili — apna PAN daalein" → PAN input → "Continue", then proceed.

S6 — Permissions (sequence of simple prompts)

Show one after another, each as a clean prompt with icon, one-line reason, and Allow:

SMS — "Bills aur EMI track karne ke liye."

Phone state — "Behtar experience ke liye."

Notifications — "Reminders aur updates ke liye."

Microphone — "Taaki main aapko call kar sakoon."

Email setup (Google flow) — a "Continue with Google" style screen → pick account → "Allow email access" (so Arjun can prep dispute emails).

After the last permission → "Sab set hai! Arjun se baat karte hain…" → go to Chat and immediately trigger the incoming call (S9).

3. CHAT SCREEN (exact Disha replica, for Arjun)

Header (top bar, white)

Left: back chevron · round Arjun avatar · name "Arjun" bold · "online" + green dot. Right (in this order):

Call button (phone icon) → opens an outgoing call screen to Arjun.

Dropdown caret ▼ → small menu "Other screens" listing:

Report (with a small "Updated" badge when new) → opens Report screen (§4).

Tasks (with "Updated" badge) → opens Task screen (§5).

3-dots ⋮ → menu (§6): My Profile · Manage Subscription · Help · Logout.

Body

Cream doodle background, white bubbles, timestamps.

Supports: coach text bubbles, user text bubbles, document/report cards (white bubble with a preview image on top + a light-green strip with a red PDF icon + filename, e.g. "Credit Report.pdf", "Action Plan.pdf"), system chips ("Today", "✅ Done"), and call log entries ("Voice call 3:12 mins", "Missed voice call · Tap to call back").

Input bar (bottom, white): emoji · "Message" field · attach · camera · green send button. A mic affordance for voice.

4. REPORT SCREEN (clean — full screen, opened from dropdown)

Header: back · "Credit Report" · download icon.

Distressed (Sonu):

Score hero card: big 413, pill Poor (red), a semicircular gauge, "Equifax-powered · Updated 20 Jun 2026".

Counts row: Loans 32 · Cards 0 · Enquiries 5.

"What's affecting your score": 5 rows, each = factor name, weight %, status chip:

Payment History — 35% — Needs fix (red) · "8 accounts past due"

Credit Utilization — 30% — OK (amber)

Credit Age — 15% — Great (green) · "5 yr avg"

Credit Mix — 10% — Great (green)

Enquiries — 10% — OK (amber)

Problems detected (6) list with a small "Fix in Tasks →" link.

Bottom CTA: "Arjun se poochho" (returns to chat) + "Download PDF".

NTC (Rahul):

Score hero shows "—" with pill "No score yet", line "Aap bank ke liye abhi invisible ho."

Counts: Loans 0 · Cards 0.

Instead of factors: a card "How to build your score" with 3 simple steps (Get a secured card → Use it → Pay on time). CTA "Start building" → chat.

5. TASK SCREEN (clean — full screen, opened from dropdown)

Header: back · "Tasks" · the Updated badge if new.

Top progress card: "In kaamon ko poora karo" → projected jump (e.g., 413 → ~690), a progress bar (e.g., 2 of 6 done).

Task cards (list) — each card:

Title (e.g., "Written-off account — Hari & Co")

Impact chip +115 (green)

Short line ("Yeh galat lagta hai — bureau ko likho")

Status pill: To do / In review / Done

Button "Take action" → opens the relevant chat flow (e.g., the one-click dispute email).

Distressed (Sonu) tasks (6): Pay overdue (Hari & Co) · Written-off account (+115) · Unrecognised enquiry · Enquiry pressure (+13) · Overdue payment (+70) · Old closed account update.

NTC (Rahul) tasks: "Get your first secured card" · "Add ₹500 deposit" · "Make first purchase" · "Set autopay for card bill" — framed as build steps, each +points when done.

6. 3-DOTS MENU (replica of Disha's SS3)

A white rounded dropdown with icon + label rows:

👤 My Profile

⚙️ Manage Subscription ("GroScore Plus · ₹99/mo · AutoPay active")

💬 Help

⎋ Logout (returns to Landing so reviewer can log in as the other demo)

7. INSTANT CALL ON LOGIN (replica of Disha's SS4)

Right after onboarding completes, Arjun calls the user automatically.

Incoming call screen:

Soft green gradient background.

Pill "Incoming Call" at top.

Arjun avatar centered with concentric pulsing rings.

Name "Arjun" bold below.

Two buttons: Decline (red circle, end-call icon) · Accept (green circle, call icon), with labels.

On Accept → in-call screen (simulate, no real audio):

Arjun avatar, "Arjun · 00:12" timer, live subtitles of what he's saying (so reviewer can read the script), mute/speaker/end buttons.

NTC call script (subtitles): "Namaste Rahul! Main Arjun. Aapki report dekhi — aap bank ke liye abhi invisible ho, par tension mat lo. Main aapko ek guaranteed card dilwa deta hoon jisse aapka score banega. 2 minute mein samjhata hoon…"

Distressed call script: "Namaste Sonu! Main Arjun. Aapka score 413 hai par 6 cheezein theek ho sakti hain. Sabse pehle ek galat entry hata dete hain — main aapko guide karta hoon."

End call → returns to Chat, where Arjun has already posted a summary + the first action card (a Report card + the first Task card). For NTC: a secured-card card. For Distressed: the dispute-email task card.

If Declined → Arjun messages in chat: "Koi baat nahi, jab free ho tab call karna 🙂 Tab tak yeh dekho 👇" + the report card, and shows a "Missed voice call · Tap to call back" log (Disha-style persistence).

8. CHAT CONTENT after the call (scripted)

Distressed (Sonu):

Report card "Credit Report.pdf" + "Action Plan.pdf".

Arjun: "Aaj ka sabse zaroori kaam 👇" → Task card (Written-off, +115) → on action → Dispute-email card ("Open in my email & send" — simulate opening a mail composer; user sends from own email).

Arjun follow-up: "Bhej diya? Bureau ko 30 din mein jawab dena hota hai. Main track karunga ✅".

NTC (Rahul):

Report card "Credit Report.pdf" (no score) .

Arjun: "Aapka pehla card dilwata hoon — guaranteed approval, secured." → Secured-card card (SBM Secured, ₹1,000 limit, "Details pre-filled ✓", "Confirm & apply").

Arjun: "Card aate hi har on-time payment aapka score banayega 🚀".

9. Non-goals (do NOT build)

No real OTP/SMS read, bureau API, payments, email send, or phone calls — simulate all.

No backend/auth — static per-demo data keyed off the phone number.

No second (female) coach — single male coach Arjun.

Keep it to the screens above. We'll add more after this works.

10. Build/UX notes for Lovable

Make every button advance the scripted flow (append next messages) so the prototype is playable.

Pre-fill each demo chat with a few past messages so it feels lived-in.

The Updated badge on Report/Tasks should appear after the call (to show "new").

Match Disha's spacing, fonts (clean sans-serif), and the cream doodle background closely.

Placeholders to swap later: coach "Arjun" + male avatar, card partner "SBM Secured", price ₹99/mo, demo names/numbers.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bbefce13-fee3-44cc-be39-c1a2a48484e9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

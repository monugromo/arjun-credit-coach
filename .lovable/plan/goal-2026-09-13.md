## Goal

Extend the existing **Loan / CC** tab with two testable demo journeys while preserving the current bottom navigation, chat screen, header styling, and colour system.

## What will be built

### Two direct-login demo accounts
- Add two clearly labeled demo phone numbers for testing:
  - **Returning offers journey** — OTP leads directly to chat; Loan / CC opens the populated offers experience.
  - **First-visit journey** — OTP leads directly to chat; first Loan / CC visit starts the four-question eligibility flow.
- Keep all current demo accounts and their existing flows unchanged.

### Returning user Loan / CC experience
- Header with requested amount/date and a **Change amount** link opening a warning sheet.
- **Ab mil sakta hai** section with exactly three top-ranked lender cards initially, personalised ranges, segmented approval chance, enquiry note, lender option grouping, green Apply button, and a six-more expander.
- Arjun advice strip below available offers, linked to the existing chat screen.
- Lightweight **Abhi nahi mil raha** section with at most five cards, amber edge, a single distance message, and chat hand-off.
- Persona switcher in the top corner for Rejected, Prime, Thin file, NTC, and Zero states.
- NTC-specific lender list and score-building chat hand-off; zero-eligible fallback card.

### First-visit eligibility flow
- Intro card with lender marks and **Mere offers dikhao**.
- One question per screen with progress and Back:
  1. Work type via custom bottom-sheet picker.
  2. Monthly income with an on-screen number pad and Indian formatting.
  3. Salary method via custom bottom-sheet picker, skipped when not salaried.
  4. Six-box pincode input and location shortcut.
  5. Date of birth only for NTC.
- Preserve answers and current step when leaving and reopening the tab.
- Show the two-second lender-checking screen, then display offers.

### Apply journey
- Green Apply action opens the enquiry confirmation sheet.
- Confirmation opens a full-screen simulated lender page inside the app.
- Closing returns to the same Loan / CC scroll position and marks that offer **Applied · 12 Sep**, with Undo.
- No close survey or external navigation.

### Chat hand-offs
- Reuse the current chat interface unchanged.
- Add the specified three-message sequences with typing indicators for issue-bound and time-bound locked offers.
- Add the requested user/Arjun exchange from the recommendation strip.
- Add quick replies for the issue-bound conversation.

## Technical details

- Extend the local demo-user type with a loan-journey discriminator and add two demo records.
- Replace only the current `LoansScreen` implementation; keep `BottomNav` unchanged.
- Add local state in the main route for onboarding progress, persisted answers, selected persona, applied offers, and pending loan-chat hand-off.
- Use custom in-frame sheets and buttons; no native select, external browser, amount slider, or tenure field.
- Keep lender data as prototype constants and ensure duplicate lender products collapse into one expandable card.
- Update the home route metadata only where needed to complete its existing required social metadata.

## Verification

- Run the focused app build.
- Test both demo numbers end-to-end in the browser.
- Verify first-visit resume, salaried/non-salaried branching, NTC DOB step, offers expansion, locked-offer chat, recommendation chat, Apply confirmation, in-app lender page, Close return position, and Undo.
- Check mobile screenshots for overflow, alignment, and bottom-navigation access.

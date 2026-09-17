## Goal

Replace the fresh-user Loan questionnaire sheet with a clean two-page form while preserving the existing app colours, Loan header, offers, and chat behaviour.

## What will change

### Page 1 — Work and loan details
- Show four fields together: work type, monthly income, salary method, and required loan amount.
- Keep salary method visible only for salaried users.
- Use restrained dropdown fields matching the supplied white form reference; dropdown options open inline on the page, not in a bottom sheet.
- Focusing income or loan amount opens the device numeric keyboard, with a ₹ prefix and Indian number formatting.

### Page 2 — Location and identity
- Show six-box pincode entry with auto-advance and the existing “Use my location” action.
- Show date of birth only for the no-credit-record persona.
- Use a wheel-style day/month/year selector so the user can scroll each value instead of typing.

### Journey behaviour
- Keep the intro, two-second lender check, offers, returning-user journey, and chat answers unchanged.
- Preserve entered answers when moving backward or leaving the Loan tab.
- Replace the current question bottom sheet entirely with full white pages under the existing Loan back-arrow header.
- Update progress to two pages and validate each visible field before Continue.

## Verification

- Test the fresh-user salaried path across both pages.
- Test non-salaried salary-field skipping.
- Test the no-credit-record date selector.
- Confirm numeric keyboards, Indian amount grouping, pincode entry, back navigation, and clean mobile layout.

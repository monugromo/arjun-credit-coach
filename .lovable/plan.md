
## Goal

Pure design consistency pass across the onboarding screens (Landing → Phone → OTP → Name → PAN → Bureau Validate → No-history → Edit → Verify linked number → Paywall → Razorpay). No copy, no icons, no new/removed elements — only visual normalization so every screen feels like the same product.

## Inconsistencies observed

Screens compared: `Landing`, `PhoneScreen`, `OtpScreen`, `NameScreen`, `PanCardScreen`, `PanInputScreen`, `EditDetailsScreen`, `PanMobileLinkScreen`, `BureauValidateScreen`, `BureauRefetch`, `Ntc2FetchScreen`, `Ntc2NoHistoryScreen`, `ExpiredScreen`.

1. **Body / footer padding drifts** between `p-6` (Phone, Name, PanInput, EditDetails, PanMobileLink) and `p-5` (PanCard, BureauValidate, Ntc2NoHistory, ExpiredScreen).
2. **Primary CTA styling drifts**: onboarding uses `py-3.5 rounded-full`, `ExpiredScreen` uses `py-4 shadow-md`, Razorpay uses `rounded-lg`. Onboarding secondary buttons use two slightly different border colors (`border-gray-300` vs the ring inside disabled state).
3. **Input styles are mixed**: underline `border-b-2` on Name / PanInput / EditDetails, boxed `border-2 rounded-xl` on PanMobileLink phone field. All onboarding text inputs should share one shape.
4. **Eyebrow labels drift**: `text-xs uppercase font-semibold tracking-wide` on BureauValidate ("Is this you?") vs `text-[11px] uppercase font-bold tracking-wider` on Ntc2NoHistory / PanMobileLink / PanInput / EditDetails.
5. **Amber alert cards differ**: Ntc2NoHistory uses `bg #FFFBEB / border-amber-100 / icon bg #FEF3C7 / icon w-11 h-11`, PanMobileLink uses `bg #FFF8EC / border-amber-200 / icon bg #FDE9C2 / icon w-12 h-12`. Same component role, different look.
6. **Bureau-match card eyebrow** is `text-sm uppercase font-bold` — noticeably larger than every other eyebrow in the flow.
7. **Loading spinners** vary in size (`w-12` in PanCard/BureauValidate, `w-14` in BureauRefetch/Ntc2Fetch) with the same visual role.
8. **Footer padding** mixes `p-6 pt-2`, `p-5 pt-2`, `p-6` — creates uneven bottom safe-area across the flow.
9. **"Where to find" helper card**: NameScreen has a small caption under the image; PanInput / EditDetails omit it — asymmetric with the same block.

## Changes (visual only)

Introduce local shared style constants at the top of `src/routes/index.tsx` (near the existing `WA` tokens) and apply them across the onboarding screens listed above. No new components, no changed markup structure, no text edits.

- **Spacing**: standardize onboarding body to `p-5` and footer button area to `px-5 pb-6 pt-3` on every WATopBar screen (Phone, OTP, Name, PanCard, PanInput, EditDetails, PanMobileLink, BureauValidate, Ntc2NoHistory). ExpiredScreen keeps its own hero layout but adopts the same horizontal padding (`px-5`).
- **Primary CTA**: single class token — `w-full text-white font-bold py-3.5 rounded-full disabled:opacity-40` with `background: WA.accent`. Apply everywhere in onboarding. ExpiredScreen keeps `shadow-md` (hero emphasis) but drops `py-4` → `py-3.5` to match. Razorpay is a separate skin (Razorpay-branded) — untouched.
- **Secondary CTA**: single token — `w-full font-semibold py-3.5 rounded-full border border-gray-300 text-gray-700 bg-white`. Apply on BureauValidate "Not me" and PanMobileLink "I'll do it later".
- **Inputs**: standardize on the underline pattern already used by Name/PanInput/EditDetails (`w-full border-b-2 pb-2 text-lg outline-none bg-transparent`, `borderColor: WA.accent`). Convert the PanMobileLink phone field to the same underline shape (keep the `+91` prefix inline).
- **Eyebrow label**: single token — `text-[11px] uppercase font-bold tracking-wider text-gray-500` (amber variant uses `text-amber-700`, emerald variant uses `text-emerald-700`). Applies to "Is this you?", "Bureau result", "Bureau Match", "Where to find", "Quick check", "Payment methods"-style labels inside onboarding (Razorpay's own eyebrow untouched).
- **Amber alert card**: unify to `bg #FFFBEB / border border-amber-100 / rounded-2xl p-5`, icon bubble `w-11 h-11 rounded-full bg #FEF3C7` with `AlertTriangle w-5 h-5 text-amber-700`. Apply to Ntc2NoHistory and PanMobileLink.
- **Loading spinner**: single size `w-12 h-12 border-4`, `borderColor: #E5E7EB`, `borderTopColor: WA.accent`, with body copy `text-gray-700 font-semibold` + subcopy `text-gray-500 text-sm`. Apply to PanCard, BureauValidate, BureauRefetch, Ntc2Fetch.
- **"Where to find" helper card**: same shell in Name, PanInput, EditDetails — `rounded-xl border border-gray-200 bg-gray-50 p-3`, eyebrow token, image `w-full rounded-lg`, no caption line (removes the extra caption from NameScreen to match the other two). Image sources unchanged (NameScreen keeps `panCardRef`, recheck screens keep `panCardRefV2` per prior instructions).
- **Bureau Match card header**: switch the "BUREAU MATCH" label to the eyebrow token so it matches every other eyebrow in the flow; layout unchanged.

## Out of scope

- No copy changes.
- No new or removed elements/icons/screens.
- No routing changes.
- No changes to Razorpay checkout skin, chat screen, report, tasks, profile, subscription, help.
- No changes to onboarding routing or business logic.

## Technical notes

- All edits are inside `src/routes/index.tsx`.
- Add three small local constants near `WA`: `PRIMARY_BTN`, `SECONDARY_BTN`, `EYEBROW` class strings. Use `style={{ background: WA.accent }}` alongside `PRIMARY_BTN` as today.
- Apply edits screen-by-screen; verify build after the batch and visually re-check Landing → Paywall in the preview.

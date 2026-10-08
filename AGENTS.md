<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Keep the credit report's presentation and drill-down state in a dedicated report component, passing existing chat and savings actions from the main screen; this isolates restyling from other journeys.
- Scope report typography and visual tokens to the report root; other screens must retain their existing appearance.
- Select report comparison styling through an optional demo-user presentation flag; this preserves baseline accounts and keeps all report data and actions shared.
- Gate direct report entry after demo OTP with a demo-user flag; this bypasses onboarding only for comparison accounts, not other journeys or real authentication.
- Track first gauge openings in session memory per demo account and drive needle and number from one shared animation timeline; this keeps them synchronized, avoids replay, and honours reduced-motion preferences.
- Use only available report fields in account details and trends; never invent payment calendars, bureau dates or historical scores to fill a layout.
- Normalize and cap recorded score pulls in a shared trend helper before chart rendering; this keeps the history limit testable and avoids fabricated chart points.
- Render bank identity through a shared report bank mark with optional logo URLs and neutral initials on missing or failed images; this keeps account layouts stable without inventing bank artwork.

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
- Use only available report fields in account details and trends; never invent payment calendars, bureau dates or historical scores to fill a layout.

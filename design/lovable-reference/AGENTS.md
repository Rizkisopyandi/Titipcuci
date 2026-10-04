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

- Admin app lives under `/admin/*` routes with shared state in `src/lib/admin/store.tsx` (in-memory prototype, seeded from `src/lib/admin/data.ts`); every status change goes through `update(id, patch, toStatus)` so timeline/activity stay consistent.
- Order workflow actions are rendered per status by `src/components/admin/Workflow.tsx`; add new operational steps there rather than in pages.
- Customer app lives under `/app/*`; it shares the same in-memory store (provider mounted in `__root.tsx`) so orders created by customers appear in `/admin` and admin status changes show to the customer. Customer-facing status wording lives in `src/components/customer/Shell.tsx`.

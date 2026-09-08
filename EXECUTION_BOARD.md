# Execution Board

## Milestone order

1. **M1 - Foundation & Identity**
   - Issue: [#1 Foundation, auth, and shared data layer](https://github.com/ifkmldk/bwa-invid/issues/1)
   - Goal: account creation, verification, sign-in, reset password, private shell, shared Prisma layer, starter seed.

2. **M2 - Invitation Core**
   - Issue: [#2 Invitation Workspace](https://github.com/ifkmldk/bwa-invid/issues/2)
   - Goal: template browsing, guided draft flow, autosave, resume, locked theme preview.

3. **M3 - Publish, Share, and Guest Wishes**
   - Issues: [#3 Publish & Public Runtime](https://github.com/ifkmldk/bwa-invid/issues/3), [#4 Guest Wishes & Engagement](https://github.com/ifkmldk/bwa-invid/issues/4)
   - Goal: public slug, share actions, locked render, wishes feed.

4. **M4 - Monetization**
   - Issue: [#5 Paid Plans & Midtrans Checkout](https://github.com/ifkmldk/bwa-invid/issues/5)
   - Goal: free trial, Midtrans checkout, plan enforcement, watermark rules.

5. **M5 - Admin Template Library**
   - Issue: [#6 Template Admin & Starter Library](https://github.com/ifkmldk/bwa-invid/issues/6)
   - Goal: admin template/category tools and locked `themeConfig`.

6. **M6 - Launch Hardening**
   - Issue: [#7 Launch Hardening & Quality Gates](https://github.com/ifkmldk/bwa-invid/issues/7)
   - Goal: E2E flow, payment sandbox checks, performance, accessibility, smoke gates.

## Execution board

| Stage | Issues | Notes |
|---|---|---|
| Now | #1 | Unblocks the entire product foundation. |
| Next | #2 | Starts immediately after #1. |
| Parallel lane after #3 | #4, #5, #6 | These can run together once #3 is done; #6 also needs #1. |
| Final gate | #7 | Starts after the core journey is stable. |

## Dependency path

`#1 -> #2 -> #3 -> (#4, #5, #6 in parallel) -> #7`

## Notes

- The main product value path is **signup -> draft -> publish -> share -> guest wishes -> upgrade**.
- Keep `themeConfig` locked at template level.
- Keep public copy human, local, and free of generic AI filler.

# 05: Subscription Billing & Limits

**What to build:**
A monetization flow where users can see their plan, upgrade through Midtrans Snap, and get invitation limits and watermark rules enforced automatically.

**Blocked by:**
01: Foundation & Auth Shell; 02: Invitation Draft Builder

**Status:** ready-for-agent

## Acceptance criteria
- [ ] New users start on a free trial plan with a clearly visible invitation limit.
- [ ] Users can upgrade to Basic, Pro, or Premium through a checkout flow powered by Midtrans Snap.
- [ ] Payment status updates are reflected back into the app through a server-side callback flow.
- [ ] Invitation publishing and watermark behavior change automatically based on the active plan.
- [ ] Users can see their active plan, current usage, and upgrade prompt from the dashboard.

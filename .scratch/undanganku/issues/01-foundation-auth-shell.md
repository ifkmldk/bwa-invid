# 01: Foundation & Auth Shell

**What to build:**
A working authenticated app foundation where a new user can sign up, verify email, sign in, reset password, and land in a private dashboard shell backed by the shared data layer.

**Blocked by:**
None (can start immediately)

**Status:** ready-for-agent

## Acceptance criteria
- [ ] New users can create an account with email and password, then verify their email before the account becomes active.
- [ ] Signed-in users can reach a private dashboard shell with basic navigation and role awareness for user vs admin.
- [ ] Users can request and complete password reset without support intervention.
- [ ] Core data models and auth flows persist through the shared database layer rather than in-memory stubs.
- [ ] The auth flow enforces basic abuse protection such as rate limiting on repeated attempts.

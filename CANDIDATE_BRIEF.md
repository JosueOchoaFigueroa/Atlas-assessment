# Atlas HXM — Software Engineer Take-Home Exercise (`pto-accrual`)

**Time budget:** 2–3 hours
**AI tools:** Permitted — we'll ask how you used them in the review session
**Submission:** Reply to this email with a short writeup (see below) + any modified files as a zip or GitHub link
**Confidentiality:** Please keep these materials to yourself — we rotate exercises and sharing them disadvantages future candidates.

---

## Context

You've inherited the `pto-accrual` module — the small piece of logic that tells an Atlas HXM employee how much paid time off they've earned and how much they have left. It ships with a test suite. Support has had a couple of fuzzy reports that "the PTO numbers look off for some people," but nothing's been pinned down.

It's a small, pure-logic module (no database, no server) with a written policy spec. Your job is to make it actually match the policy.

The repo contains:

- `src/accrual.js` — the accrual engine
- `src/accrual.test.js` — the test suite
- `README.md` — **the accrual policy this module is supposed to implement.** Read it first; it's your source of truth.

Run `npm install && npm test`.

---

## What We're Asking

### Part 1 — Find and fix the bugs (hands-on + written, ~1.5 hr)

The module has correctness bugs — the PTO numbers it produces don't all match the policy in the `README`. Find them, fix them, and make sure the module is correct.

A note worth your attention: **a passing test suite is not proof of correctness.** Evaluate the tests with the same skepticism you'd apply to the code.

Alongside your fixes, write up (any format — doc, PR description, comments):

- Each bug you found: what's wrong, how it deviates from the policy, and who it affects (does it over-pay or under-pay the employee?)
- What you changed and why
- Anything you chose *not* to change, and your reasoning

### Part 2 — Extend (hands-on, ~30–45 min)

Pick **one** and implement it with tests:

**Option A — Year-end carryover cap**
Atlas caps how much PTO rolls into the next year: any balance above **10 days** at year-end is forfeited. Add this to the engine and cover it with tests. Note any assumptions (e.g. what "year-end" means relative to the accrual dates).

**Option B — Accrual pause during unpaid leave**
Employees on unpaid leave don't accrue PTO for the months they're out. Given a set of months an employee was on unpaid leave, exclude them from accrual. Add this and cover it with tests.

---

## What to Submit

1. **Your bug writeup** (any format) + the fixed `src/` files (including any test corrections)
2. **The added code + tests** for Part 2
3. **A short note** (3–5 sentences) on how you approached it — what you looked at first, any time trade-offs, where you used AI and how

---

## Live Review Session (~35 min)

We'll schedule a follow-up to walk through your work together. Expect questions like:

- Walk us through how you found each bug
- How did you decide whether the tests or the code were right?
- We'll point at a few specific choices and ask for your read

The live session is where most of the signal lives for us. The take-home is the starting point for that conversation.

---

Questions? Reply to this email.

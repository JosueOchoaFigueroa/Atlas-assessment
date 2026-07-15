# Atlas HXM PTO Accrual Exercise — Bug Fixes & Extension Writeup

## Overview

I reviewed the PTO accrual engine by comparing the implementation and test suite against the policy described in `README.md`. The policy document was treated as the source of truth.

I identified three correctness issues in the existing implementation and found that some existing tests reflected the buggy behavior rather than the expected business rules. I updated both the implementation and tests to match the policy.

For the extension, I implemented **Option B: Accrual Pause During Unpaid Leave**, allowing specific months to be excluded from PTO accrual.

---

# Part 1 — Bugs Found and Fixes

## Bug 1 — Completed months calculated incorrectly

### Issue

The existing `monthsBetween()` function calculated the difference between calendar months:

```js
(e.getUTCFullYear() - s.getUTCFullYear()) * 12 +
(e.getUTCMonth() - s.getUTCMonth())
```

This does not account for the employee's hire-date anniversary.

The policy states:

> A month counts as completed only after the monthly anniversary of the hire date.

### Example

Employee hire date:

```
2026-01-20
```

Calculation date:

```
2026-03-01
```

The original implementation returned:

```
2 months
```

because January → March is two calendar months.

However, the employee only completed:

```
2026-02-20 = 1 completed month
```

The March anniversary has not occurred yet.

Correct result:

```
1 month
```

### Impact

Employees hired after the first day of a month were receiving PTO earlier than allowed.

This caused an **overpayment of PTO**.

### Fix

Updated `monthsBetween()` to subtract one month when the current date has not reached the hire-date anniversary.

```js
if (e.getUTCDate() < s.getUTCDate()) {
  months--;
}
```

---

# Bug 2 — Accrual rounded to whole days

## Issue

The existing implementation used:

```js
Math.round(months * monthlyRate(annualDays))
```

The policy explicitly states:

> Accrual is tracked in fractional days. Do not round to whole days part-way through.

### Example

Annual allowance:

```
15 days
```

Monthly accrual:

```
15 / 12 = 1.25 days
```

After three months:

```
3 × 1.25 = 3.75 days
```

The previous implementation rounded:

```
3.75 → 4
```

### Impact

Employees could receive more or less PTO than their actual earned amount.

This primarily caused **overpayment**.

### Fix

Removed rounding:

Before:

```js
return Math.round(months * monthlyRate(annualDays));
```

After:

```js
return months * monthlyRate(annualDays);
```

Fractional PTO values are now preserved.

---

# Bug 3 — PTO balance could become negative

## Issue

The existing implementation returned:

```js
accruedDays(...) - daysTaken
```

without enforcing the policy restriction.

The policy states:

> Balance can never go below zero.

### Example

Employee:

```
Accrued: 1.25 days
Taken: 5 days
```

Previous result:

```
-3.75 days
```

Correct result:

```
0 days
```

### Impact

Employees could incorrectly have negative PTO balances.

### Fix

The balance is now clamped:

```js
return Math.max(0, balance);
```

---

# Incorrect Tests Updated

The existing test suite contained expectations based on the buggy behavior.

## Mid-month hire test

Original:

```js
expect(
  monthsBetween('2026-01-20', '2026-03-01')
).toBe(2);
```

Updated:

```js
expect(
  monthsBetween('2026-01-20', '2026-03-01')
).toBe(1);
```

Reason:

The employee completed only the February 20 anniversary.

---

## Fractional accrual test

Original:

```js
expect(
  accruedDays(15, '2026-01-01', '2026-04-01')
).toBe(4);
```

Updated:

```js
expect(
  accruedDays(15, '2026-01-01', '2026-04-01')
).toBe(3.75);
```

Reason:

PTO accrual should not be rounded.

---

## Negative balance test

Original:

```js
expect(
  currentBalance(15, '2026-01-01', '2026-02-01', 5)
).toBe(-4);
```

Updated:

```js
expect(
  currentBalance(15, '2026-01-01', '2026-02-01', 5)
).toBe(0);
```

Reason:

PTO balances cannot be negative.

---

# Part 2 — Extension: Accrual Pause During Unpaid Leave

## Selected Option

Implemented:

**Option B — Accrual pause during unpaid leave**

Employees do not earn PTO for months where they were on unpaid leave.

---

# Implementation Approach

## Step 1 — Extend the accrual API

Added an optional parameter:

```js
unpaidLeaveMonths = []
```

Example:

```js
[
  "2026-03",
  "2026-04"
]
```

Each entry represents one month where PTO should not accrue.

---

## Step 2 — Calculate completed months

The existing completed month calculation remains unchanged:

```js
const completedMonths = monthsBetween(
  hireDate,
  asOf
);
```

This ensures unpaid leave logic uses the same policy rules.

---

## Step 3 — Remove unpaid months from eligible accrual months

The number of PTO-earning months becomes:

```js
eligibleMonths =
  completedMonths - unpaidMonths;
```

Example:

Completed months:

```
6
```

Unpaid leave months:

```
2
```

Eligible accrual months:

```
4
```

---

## Step 4 — Calculate PTO using eligible months

The accrual calculation remains fractional:

```js
eligibleMonths * monthlyRate(annualDays)
```

No rounding is applied.

---

# Added Test Coverage

## Single unpaid leave month

Validates that one month is excluded:

```js
accruedDays(
  15,
  '2026-01-01',
  '2026-05-01',
  ['2026-03']
)
```

Expected:

```
3.75 days
```

Calculation:

```
4 completed months
- 1 unpaid month
= 3 earning months

3 × 1.25 = 3.75
```

---

## Multiple unpaid leave months

Validates multiple skipped months:

```js
[
  "2026-03",
  "2026-05"
]
```

Expected accrual is reduced by both months.

---

## Full unpaid leave period

Validates that employees with all months unpaid receive:

```
0 PTO
```

---

## Extra unpaid leave months

Validates that unpaid leave entries beyond the completed accrual period do not create negative accrual.

---

# Assumptions

* Unpaid leave is provided as complete calendar months.
* Partial-month unpaid leave is outside the scope of this implementation.
* Duplicate unpaid leave months are not expected.
* Months outside the completed accrual period do not affect calculations.
* Fractional PTO is always preserved.

---

# Approach Summary

I started by reading the policy specification and validating each rule against the current implementation. I identified mismatches between the written policy, the source code, and some existing tests. I fixed the calculation logic first, then updated tests that encoded incorrect behavior. For the extension, I selected unpaid leave because it could be implemented cleanly while keeping the module pure and deterministic. I used AI as a review tool to validate edge cases, check assumptions, and improve the clarity of the documentation.

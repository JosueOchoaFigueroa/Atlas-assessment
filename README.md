# pto-accrual

The PTO (paid time off) accrual engine used by Atlas HXM to tell an employee how many vacation days they've earned and how many they have left.

## Run it

```bash
npm install
npm test
```

## The accrual policy (the spec)

This is the policy the engine is supposed to implement. Use it as your source of truth.

1. Employees accrue PTO **monthly**, at `annual_allowance / 12` days per **completed** month.
2. A month counts as **completed only after the monthly anniversary of the hire date**. Someone hired on the 20th has not completed a month until the 20th of the following month.
3. Accrual is tracked in **fractional days** — we pay out partial days, so do **not** round to whole days part-way through.
4. **Balance = accrued − taken**, and balance can **never go below zero** — an employee cannot take more PTO than they've accrued.

Atlas's standard `annual_allowance` is **15 days** (so the monthly rate is `1.25` days).

## Files

- `src/accrual.js` — the engine
- `src/accrual.test.js` — the test suite

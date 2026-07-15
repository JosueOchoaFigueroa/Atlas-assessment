const {
  monthsBetween,
  monthlyRate,
  accruedDays,
  currentBalance,
} = require('./accrual');

describe('pto-accrual', () => {
  test('monthly rate for the standard 15-day allowance', () => {
    expect(monthlyRate(15)).toBe(1.25);
  });

  test('counts whole months between two first-of-month dates', () => {
    expect(monthsBetween('2026-01-01', '2026-04-01')).toBe(3);
  });

  test('counts months for a mid-month hire', () => {
    // hired Jan 20, so Jan and Feb
    expect(monthsBetween('2026-01-20', '2026-03-01')).toBe(2);
  });

  test('accrues a clean number of days over four months', () => {
    expect(accruedDays(15, '2026-01-01', '2026-05-01')).toBe(5);
  });

  test('accrues over three months', () => {
    // 3 months of accrual
    expect(accruedDays(15, '2026-01-01', '2026-04-01')).toBe(4);
  });

  test('balance is accrued minus days taken', () => {
    expect(currentBalance(15, '2026-01-01', '2026-05-01', 2)).toBe(3);
  });

  test('balance after taking more than a short-tenured employee has accrued', () => {
    // took 5 days one month in
    expect(currentBalance(15, '2026-01-01', '2026-02-01', 5)).toBe(-4);
  });
});

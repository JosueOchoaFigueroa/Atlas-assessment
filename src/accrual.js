const DEFAULT_ANNUAL_DAYS = 15;

// Parse a 'YYYY-MM-DD' date string.
function parseDate(s) {
  return new Date(s);
}

/**
 * Number of completed whole months between start and end.
 *
 * Policy:
 * - A month is only completed after reaching the monthly anniversary
 *   of the hire date.
 *
 * Examples:
 * - Jan 1  -> Apr 1  = 3 completed months
 * - Jan 20 -> Mar 1  = 1 completed month
 * - Jan 20 -> Mar 20 = 2 completed months
 */
function monthsBetween(start, end) {
  const s = parseDate(start);
  const e = parseDate(end);

  let months =
    (e.getUTCFullYear() - s.getUTCFullYear()) * 12 +
    (e.getUTCMonth() - s.getUTCMonth());

  // If we haven't yet reached this month's hire-date anniversary,
  // the current month is not completed.
  if (e.getUTCDate() < s.getUTCDate()) {
    months--;
  }

  // Never return negative months.
  return Math.max(0, months);
}

// Monthly accrual rate, in days.
function monthlyRate(annualDays) {
  return annualDays / 12;
}

/**
 * PTO accrued.
 *
 * unpaidLeaveMonths:
 * Array of completed accrual months that should not accrue PTO.
 *
 * Example:
 * ["2026-02", "2026-03"]
 */
function accruedDays(
  annualDays,
  hireDate,
  asOf,
  unpaidLeaveMonths = []
) {
  const completedMonths = monthsBetween(hireDate, asOf);

  // Never subtract more months than actually completed.
  const unpaidMonths = Math.min(
    completedMonths,
    unpaidLeaveMonths.length
  );

  const eligibleMonths = completedMonths - unpaidMonths;

  return eligibleMonths * monthlyRate(annualDays);
}

/**
 * Current PTO balance.
 */
function currentBalance(
  annualDays,
  hireDate,
  asOf,
  daysTaken,
  unpaidLeaveMonths = []
) {
  const balance =
    accruedDays(
      annualDays,
      hireDate,
      asOf,
      unpaidLeaveMonths
    ) - daysTaken;

  return Math.max(0, balance);
}

module.exports = {
  DEFAULT_ANNUAL_DAYS,
  parseDate,
  monthsBetween,
  monthlyRate,
  accruedDays,
  currentBalance,
};

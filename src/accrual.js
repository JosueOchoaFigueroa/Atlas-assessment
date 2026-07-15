const DEFAULT_ANNUAL_DAYS = 15;

// Parse a 'YYYY-MM-DD' date string.
function parseDate(s) {
  return new Date(s);
}

// Number of completed whole months from start to end.
function monthsBetween(start, end) {
  const s = parseDate(start);
  const e = parseDate(end);
  return (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth());
}

// Monthly accrual rate, in days.
function monthlyRate(annualDays) {
  return annualDays / 12;
}

// PTO days accrued between the hire date and asOf.
function accruedDays(annualDays, hireDate, asOf) {
  const months = monthsBetween(hireDate, asOf);
  return Math.round(months * monthlyRate(annualDays));
}

// PTO days available: what's been accrued minus what's been taken.
function currentBalance(annualDays, hireDate, asOf, daysTaken) {
  return accruedDays(annualDays, hireDate, asOf) - daysTaken;
}

module.exports = {
  DEFAULT_ANNUAL_DAYS,
  parseDate,
  monthsBetween,
  monthlyRate,
  accruedDays,
  currentBalance,
};

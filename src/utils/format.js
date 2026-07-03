const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CURRENCY_SYMBOL = '₹';

// "2026-08-10" -> "10 Aug 2026"
export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

// "2026-08-10" -> "Mon, 10 Aug"
export function formatWeekdayDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const weekday = WEEKDAYS_SHORT[new Date(y, m - 1, d).getDay()];
  return `${weekday}, ${d} ${MONTHS_SHORT[m - 1]}`;
}

export function formatMoney(amount) {
  const n = Number(amount) || 0;
  return `${CURRENCY_SYMBOL}${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

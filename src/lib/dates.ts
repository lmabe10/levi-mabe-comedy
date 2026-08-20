/** Parse YYYY-MM-DD as a local calendar date (avoids UTC day shifts). */
export function parseLocalDate(value: string): Date | null {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function getDayOfWeek(isoDate: string, style: 'short' | 'long' = 'short'): string {
  const date = parseLocalDate(isoDate);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: style,
  }).format(date);
}

export function getDateDay(isoDate: string): string {
  const date = parseLocalDate(isoDate);
  if (!date) return '';
  return String(date.getDate()).padStart(2, '0');
}

export function getDateMonth(isoDate: string): string {
  const date = parseLocalDate(isoDate);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
  })
    .format(date)
    .toUpperCase();
}

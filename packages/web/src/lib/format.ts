const itDate = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatDate(iso: string): string {
  return itDate.format(new Date(iso));
}

export function formatDateRange(startIso: string, endIso: string): string {
  const start = formatDate(startIso);
  const end = formatDate(endIso);
  if (start === end) return start;
  return `${start} → ${end}`;
}

export function isTripActive(
  startIso: string,
  endIso: string,
  now: Date = new Date(),
): boolean {
  const start = new Date(startIso);
  const end = new Date(endIso);
  // Compare on day-level granularity (ignore time-of-day)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return today >= startDay && today <= endDay;
}

// Convert a yyyy-MM-dd input value to ISO string at start-of-day UTC
export function dateInputToIso(value: string): string {
  if (!value) return '';
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

// Convert an ISO string back to yyyy-MM-dd for an <input type="date">
export function isoToDateInput(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

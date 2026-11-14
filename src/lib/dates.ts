import { toISODate } from './format';

export function today(): string {
  return toISODate(new Date());
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

const dayFmt = new Intl.DateTimeFormat('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });

/** "Vandaag", "Gisteren", "Morgen" of bijvoorbeeld "za 8 nov". */
export function dayLabel(iso: string, now: string = today()): string {
  if (iso === now) return 'Vandaag';
  if (iso === addDays(now, -1)) return 'Gisteren';
  if (iso === addDays(now, 1)) return 'Morgen';
  return dayFmt.format(fromISODate(iso)).replace(/\./g, '');
}

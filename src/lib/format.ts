// Nederlandse getalnotatie (V6): 1.240 kcal, 1,5 L, macro's op hele grammen.

const int = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 });
const oneDec = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 });

export function formatInt(n: number): string {
  return int.format(Math.round(n));
}

export function formatKcal(n: number): string {
  return `${formatInt(n)} kcal`;
}

export function formatGram(n: number): string {
  return `${formatInt(n)} g`;
}

/** Onder 1 L in ml, daarboven in liters met hooguit één decimaal. */
export function formatWater(ml: number): string {
  if (Math.abs(ml) < 1000) return `${formatInt(ml)} ml`;
  return `${oneDec.format(Math.round(ml / 100) / 10)} L`;
}

/** Leest een door de gebruiker getypt getal, met komma of punt als decimaalteken. */
export function parseNumber(input: string): number | undefined {
  const s = input.trim().replace(/\s/g, '');
  if (!s) return undefined;
  // "1.240" (duizendtal) vs "1.5" (decimaal): een punt gevolgd door precies 3 cijfers
  // zonder komma behandelen we als duizendtalscheiding.
  const normalized = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)
    ? s.replace(/\./g, '').replace(',', '.')
    : s.replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

/** Lokale datum als 'YYYY-MM-DD'. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

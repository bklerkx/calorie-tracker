import type { Nutrients } from './types';

export const ZERO: Nutrients = { kcal: 0, eiwit: 0, kh: 0, vet: 0, vezels: 0 };

/** Voedingswaarden voor een hoeveelheid, uitgaande van waarden per 100 g/ml. */
export function scale(per100: Nutrients, gram: number): Nutrients {
  const f = gram / 100;
  const out: Nutrients = {
    kcal: per100.kcal * f,
    eiwit: per100.eiwit * f,
    kh: per100.kh * f,
    vet: per100.vet * f,
  };
  if (per100.vezels !== undefined) out.vezels = per100.vezels * f;
  return out;
}

/** Terugrekenen van een snapshot naar waarden per 100 (om een logregel te bewerken). */
export function per100FromSnapshot(waarden: Nutrients, gram: number): Nutrients {
  return gram > 0 ? scale(waarden, (100 * 100) / gram) : { ...ZERO };
}

export function sum(list: Nutrients[]): Nutrients {
  const t = { ...ZERO };
  for (const n of list) {
    t.kcal += n.kcal;
    t.eiwit += n.eiwit;
    t.kh += n.kh;
    t.vet += n.vet;
    t.vezels = (t.vezels ?? 0) + (n.vezels ?? 0);
  }
  return t;
}

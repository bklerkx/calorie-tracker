// Open Food Facts (F3). Alleen de barcode gaat naar buiten (N4).
import type { Nutrients, Portion, Product } from './types';

const FIELDS = [
  'product_name',
  'product_name_nl',
  'generic_name_nl',
  'brands',
  'nutriments',
  'nutrition_data_per',
  'serving_size',
  'serving_quantity',
  'serving_quantity_unit',
  'product_quantity_unit',
].join(',');

export type OffResult =
  | { status: 'found'; product: Product; complete: boolean }
  | { status: 'not-found' }
  | { status: 'offline' }
  | { status: 'rate-limited' }
  | { status: 'error' };

interface OffProduct {
  product_name?: string;
  product_name_nl?: string;
  generic_name_nl?: string;
  brands?: string;
  nutriments?: Record<string, number | string | undefined>;
  nutrition_data_per?: string;
  serving_size?: string;
  serving_quantity?: number | string;
  serving_quantity_unit?: string;
  product_quantity_unit?: string;
}

function num(v: unknown): number | undefined {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Zet een OFF-product om naar ons model. Ontbrekende macro's worden NaN zodat het formulier ze leeg toont. */
export function mapOffProduct(barcode: string, p: OffProduct): { product: Product; complete: boolean } {
  const n = p.nutriments ?? {};
  let kcal = num(n['energy-kcal_100g']);
  if (kcal === undefined) {
    const kj = num(n['energy-kj_100g']) ?? num(n['energy_100g']);
    if (kj !== undefined) kcal = kj / 4.184;
  }
  const eiwit = num(n['proteins_100g']);
  const kh = num(n['carbohydrates_100g']);
  const vet = num(n['fat_100g']);
  const vezels = num(n['fiber_100g']);

  const ml =
    p.nutrition_data_per === '100ml' ||
    p.product_quantity_unit?.toLowerCase() === 'ml' ||
    p.serving_quantity_unit?.toLowerCase() === 'ml';

  const per100: Nutrients = {
    kcal: kcal !== undefined ? Math.round(kcal) : NaN,
    eiwit: eiwit !== undefined ? round1(eiwit) : NaN,
    kh: kh !== undefined ? round1(kh) : NaN,
    vet: vet !== undefined ? round1(vet) : NaN,
  };
  if (vezels !== undefined) per100.vezels = round1(vezels);

  const porties: Portion[] = [];
  const serving = num(p.serving_quantity);
  if (serving && serving > 0) porties.push({ naam: '1 portie', gram: round1(serving) });

  const naam = (p.product_name_nl || p.product_name || p.generic_name_nl || '').trim();
  const merk = p.brands?.split(',')[0]?.trim() || undefined;

  const product: Product = {
    barcode,
    naam,
    merk,
    eenheid: ml ? 'ml' : 'g',
    per100,
    porties,
    bron: 'off',
    favoriet: 0,
  };
  const complete =
    !!naam && [per100.kcal, per100.eiwit, per100.kh, per100.vet].every((v) => Number.isFinite(v));
  return { product, complete };
}

export async function fetchOffProduct(barcode: string, fetchFn: typeof fetch = fetch): Promise<OffResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { status: 'offline' };
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}?fields=${FIELDS}`;
  let res: Response;
  try {
    res = await fetchFn(url, { headers: { Accept: 'application/json' } });
  } catch {
    return { status: 'offline' };
  }
  if (res.status === 429) return { status: 'rate-limited' };
  if (res.status === 404) return { status: 'not-found' };
  if (!res.ok) return { status: 'error' };
  try {
    const json = (await res.json()) as { status?: number; product?: OffProduct };
    if (json.status !== 1 || !json.product) return { status: 'not-found' };
    return { status: 'found', ...mapOffProduct(barcode, json.product) };
  } catch {
    return { status: 'error' };
  }
}

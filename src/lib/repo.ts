// Alle schrijfacties op de database. Objecten uit Svelte-state zijn proxies; die maken we eerst "plat".
import { db } from './db';
import { scale } from './nutrition';
import type { LogEntry, MealType, Nutrients, Product } from './types';

function plain<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/** Rond af zodat er geen 13,999999-waarden in de database komen. */
function tidy(n: Nutrients): Nutrients {
  const r = (x: number) => Math.round(x * 100) / 100;
  const out: Nutrients = { kcal: r(n.kcal), eiwit: r(n.eiwit), kh: r(n.kh), vet: r(n.vet) };
  if (n.vezels !== undefined && Number.isFinite(n.vezels)) out.vezels = r(n.vezels);
  return out;
}

export async function findByBarcode(barcode: string): Promise<Product | undefined> {
  return db.products.where('barcode').equals(barcode).first();
}

export async function saveProduct(product: Product): Promise<Product> {
  const p = plain(product);
  if (!p.barcode) delete p.barcode;
  if (!p.merk) delete p.merk;
  p.per100 = tidy(p.per100);
  p.porties = (p.porties ?? []).filter((x) => x.naam.trim() && x.gram > 0);
  const id = await db.products.put(p);
  return { ...p, id };
}

export async function deleteProduct(id: number): Promise<Product | undefined> {
  const p = await db.products.get(id);
  if (p) await db.products.delete(id);
  return p;
}

export async function restoreProduct(p: Product): Promise<void> {
  await db.products.put(plain(p));
}

export interface ProductLogInput {
  product: Product;
  datum: string;
  maaltijd: MealType;
  gram: number;
  portie?: { naam: string; aantal: number };
}

/** Logt een product met snapshot (D3) en onthoudt de portie (F11). */
export async function logProduct(input: ProductLogInput): Promise<number> {
  const { product, datum, maaltijd, gram, portie } = plain(input);
  const entry: LogEntry = {
    datum,
    maaltijd,
    type: 'product',
    refId: product.id,
    omschrijving: product.naam,
    gram,
    eenheid: product.eenheid,
    portie,
    waarden: tidy(scale(product.per100, gram)),
    aangemaakt: Date.now(),
  };
  return db.transaction('rw', db.logs, db.products, async () => {
    const id = (await db.logs.add(entry)) as number;
    if (product.id !== undefined) {
      await db.products.update(product.id, {
        laatstGebruikt: Date.now(),
        laatstePortie: portie ? { gram, portie: portie.naam, aantal: portie.aantal } : { gram },
      });
    }
    return id;
  });
}

export interface QuickLogInput {
  datum: string;
  maaltijd: MealType;
  omschrijving?: string;
  waarden: Nutrients;
}

export async function logQuick(input: QuickLogInput): Promise<number> {
  const { datum, maaltijd, omschrijving, waarden } = plain(input);
  return (await db.logs.add({
    datum,
    maaltijd,
    type: 'snel',
    omschrijving: omschrijving?.trim() || undefined,
    waarden: tidy(waarden),
    aangemaakt: Date.now(),
  })) as number;
}

export async function updateLog(id: number, changes: Partial<LogEntry>): Promise<void> {
  const c = plain(changes);
  if (c.waarden) c.waarden = tidy(c.waarden);
  await db.logs.update(id, c);
}

export async function deleteLog(id: number): Promise<LogEntry | undefined> {
  const e = await db.logs.get(id);
  if (e) await db.logs.delete(id);
  return e;
}

export async function restoreLog(e: LogEntry): Promise<void> {
  await db.logs.put(plain(e));
}

/** Kopie van een logregel naar een andere dag en/of maaltijd (F14). */
export async function copyLog(e: LogEntry, datum: string, maaltijd: MealType): Promise<number> {
  const copy = plain(e);
  delete copy.id;
  return (await db.logs.add({ ...copy, datum, maaltijd, aangemaakt: Date.now() })) as number;
}

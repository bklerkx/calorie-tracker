// Barcode opzoeken: eerst lokaal (F2), dan Open Food Facts (F3), anders handmatig (F4).
import { fetchOffProduct } from './off';
import { findByBarcode, saveProduct } from './repo';
import type { Product } from './types';

export type LookupResult =
  | { kind: 'product'; product: Product }
  | { kind: 'form'; draft: Partial<Product>; reason: 'not-found' | 'incomplete' | 'offline' | 'rate-limited' | 'error' };

export async function lookupBarcode(barcode: string): Promise<LookupResult> {
  const local = await findByBarcode(barcode);
  if (local) return { kind: 'product', product: local };

  const res = await fetchOffProduct(barcode);
  if (res.status === 'found') {
    if (res.complete) return { kind: 'product', product: await saveProduct(res.product) };
    return { kind: 'form', draft: res.product, reason: 'incomplete' };
  }
  return { kind: 'form', draft: { barcode }, reason: res.status };
}

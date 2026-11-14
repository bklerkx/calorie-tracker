import { describe, expect, it } from 'vitest';
import { fetchOffProduct, mapOffProduct } from './off';

describe('Open Food Facts', () => {
  it('neemt naam, merk, waarden en portie over', () => {
    const { product, complete } = mapOffProduct('8710400000000', {
      product_name: 'Volkoren brood',
      product_name_nl: 'Volkorenbrood',
      brands: 'Bakker, Merk B',
      nutriments: {
        'energy-kcal_100g': 241.4,
        proteins_100g: 9.84,
        carbohydrates_100g: 39,
        fat_100g: 3.2,
        fiber_100g: 6.5,
      },
      serving_quantity: '35',
    });
    expect(complete).toBe(true);
    expect(product).toMatchObject({
      barcode: '8710400000000',
      naam: 'Volkorenbrood',
      merk: 'Bakker',
      eenheid: 'g',
      per100: { kcal: 241, eiwit: 9.8, kh: 39, vet: 3.2, vezels: 6.5 },
      porties: [{ naam: '1 portie', gram: 35 }],
      bron: 'off',
    });
  });

  it('rekent kJ om en herkent ml', () => {
    const { product } = mapOffProduct('1', {
      product_name: 'Melk',
      nutrition_data_per: '100ml',
      nutriments: { 'energy-kj_100g': 200, proteins_100g: 3.4, carbohydrates_100g: 4.7, fat_100g: 1.5 },
    });
    expect(product.eenheid).toBe('ml');
    expect(product.per100.kcal).toBe(48);
    expect(product.per100.vezels).toBeUndefined();
  });

  it('markeert ontbrekende macro’s als onvolledig', () => {
    const { complete, product } = mapOffProduct('1', { product_name: 'X', nutriments: { 'energy-kcal_100g': 100 } });
    expect(complete).toBe(false);
    expect(Number.isNaN(product.per100.eiwit)).toBe(true);
  });

  it('vertaalt HTTP-antwoorden', async () => {
    const mk = (status: number, body: unknown = {}) =>
      (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
    expect((await fetchOffProduct('1', mk(404))).status).toBe('not-found');
    expect((await fetchOffProduct('1', mk(429))).status).toBe('rate-limited');
    expect((await fetchOffProduct('1', mk(200, { status: 0 }))).status).toBe('not-found');
    const failing = (async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    expect((await fetchOffProduct('1', failing)).status).toBe('offline');
  });
});

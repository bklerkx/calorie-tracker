import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { copyLog, deleteLog, findByBarcode, logProduct, logQuick, restoreLog, saveProduct } from './repo';

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()));
});

const brood = {
  barcode: '123',
  naam: 'Brood',
  eenheid: 'g' as const,
  per100: { kcal: 250, eiwit: 10, kh: 40, vet: 3 },
  porties: [{ naam: '1 boterham', gram: 35 }],
  bron: 'handmatig' as const,
  favoriet: 0 as const,
};

describe('repo', () => {
  it('logt een product met snapshot en onthoudt de portie', async () => {
    const p = await saveProduct(brood);
    expect((await findByBarcode('123'))?.id).toBe(p.id);

    const id = await logProduct({
      product: p,
      datum: '2026-11-14',
      maaltijd: 'ontbijt',
      gram: 70,
      portie: { naam: '1 boterham', aantal: 2 },
    });
    const entry = await db.logs.get(id);
    expect(entry?.waarden.kcal).toBe(175);
    expect(entry?.omschrijving).toBe('Brood');

    const updated = await db.products.get(p.id!);
    expect(updated?.laatstePortie).toEqual({ gram: 70, portie: '1 boterham', aantal: 2 });
    expect(updated?.laatstGebruikt).toBeGreaterThan(0);

    // Product achteraf wijzigen verandert de geschiedenis niet (D3)
    await saveProduct({ ...updated!, per100: { ...updated!.per100, kcal: 999 } });
    expect((await db.logs.get(id))?.waarden.kcal).toBe(175);
  });

  it('verwijdert, zet terug en kopieert', async () => {
    const id = await logQuick({
      datum: '2026-11-14',
      maaltijd: 'diner',
      omschrijving: 'Restaurant',
      waarden: { kcal: 800, eiwit: 0, kh: 0, vet: 0 },
    });
    const removed = await deleteLog(id);
    expect(await db.logs.count()).toBe(0);
    await restoreLog(removed!);
    expect((await db.logs.get(id))?.omschrijving).toBe('Restaurant');

    await copyLog(removed!, '2026-11-15', 'lunch');
    const copies = await db.logs.where('datum').equals('2026-11-15').toArray();
    expect(copies).toHaveLength(1);
    expect(copies[0].maaltijd).toBe('lunch');
    expect(copies[0].id).not.toBe(id);
  });

  it('slaat een product zonder barcode op', async () => {
    await saveProduct({ ...brood, barcode: '' });
    await saveProduct({ ...brood, barcode: undefined, naam: 'Appel' });
    expect(await db.products.count()).toBe(2);
  });
});

import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { CalorieDB, getSettings } from './db';

describe('database', () => {
  it('slaat producten en logregels op', async () => {
    const db = new CalorieDB('test-db');
    const id = await db.products.add({
      naam: 'Yoghurt',
      eenheid: 'g',
      per100: { kcal: 60, eiwit: 4, kh: 5, vet: 2 },
      porties: [{ naam: '1 schaaltje', gram: 150 }],
      bron: 'handmatig',
      favoriet: 0,
    });
    await db.logs.add({
      datum: '2026-11-14',
      maaltijd: 'ontbijt',
      type: 'product',
      refId: id,
      gram: 150,
      waarden: { kcal: 90, eiwit: 6, kh: 7.5, vet: 3 },
      aangemaakt: Date.now(),
    });
    const logs = await db.logs.where({ datum: '2026-11-14', maaltijd: 'ontbijt' }).toArray();
    expect(logs).toHaveLength(1);
    expect(logs[0].waarden.kcal).toBe(90);
    expect((await getSettings(db)).doelen).toEqual({});
    db.close();
  });
});

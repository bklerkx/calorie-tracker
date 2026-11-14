import { describe, expect, it } from 'vitest';
import { per100FromSnapshot, scale, sum } from './nutrition';

describe('nutrition', () => {
  const per100 = { kcal: 200, eiwit: 10, kh: 20, vet: 5, vezels: 4 };

  it('schaalt naar de hoeveelheid', () => {
    expect(scale(per100, 35)).toEqual({ kcal: 70, eiwit: 3.5, kh: 7, vet: 1.75, vezels: 1.4 });
  });

  it('laat onbekende vezels leeg', () => {
    expect(scale({ kcal: 100, eiwit: 1, kh: 1, vet: 1 }, 50).vezels).toBeUndefined();
  });

  it('rekent een snapshot terug naar per 100', () => {
    const snap = scale(per100, 150);
    const back = per100FromSnapshot(snap, 150);
    expect(back.kcal).toBeCloseTo(200);
    expect(back.vezels).toBeCloseTo(4);
  });

  it('telt op', () => {
    expect(sum([scale(per100, 100), { kcal: 50, eiwit: 0, kh: 0, vet: 0 }])).toEqual({
      kcal: 250,
      eiwit: 10,
      kh: 20,
      vet: 5,
      vezels: 4,
    });
  });
});

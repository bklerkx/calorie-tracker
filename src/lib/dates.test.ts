import { describe, expect, it } from 'vitest';
import { addDays, dayLabel } from './dates';

describe('dates', () => {
  it('telt dagen op over maandgrenzen heen', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('geeft een korte daglabel', () => {
    const now = '2026-11-14';
    expect(dayLabel('2026-11-14', now)).toBe('Vandaag');
    expect(dayLabel('2026-11-13', now)).toBe('Gisteren');
    expect(dayLabel('2026-11-15', now)).toBe('Morgen');
    expect(dayLabel('2026-11-08', now)).toBe('zo 8 nov');
  });
});

import { describe, expect, it } from 'vitest';
import { mealForTime } from './meals';

const at = (h: number, m = 0) => new Date(2026, 10, 14, h, m);

describe('mealForTime', () => {
  it('kiest de maaltijd op basis van het tijdstip', () => {
    expect(mealForTime(at(7))).toBe('ontbijt');
    expect(mealForTime(at(12, 30))).toBe('lunch');
    expect(mealForTime(at(18))).toBe('diner');
    expect(mealForTime(at(15))).toBe('tussendoor');
    expect(mealForTime(at(23))).toBe('tussendoor');
  });
});

import { describe, expect, it } from 'vitest';
import { formatInt, formatKcal, formatWater, parseNumber, toISODate } from './format';

describe('format', () => {
  it('rondt kcal af en gebruikt een punt voor duizendtallen', () => {
    expect(formatKcal(1240.4)).toBe('1.240 kcal');
    expect(formatInt(999.6)).toBe('1.000');
  });

  it('toont water in ml of liters met komma', () => {
    expect(formatWater(250)).toBe('250 ml');
    expect(formatWater(1500)).toBe('1,5 L');
    expect(formatWater(2000)).toBe('2 L');
  });

  it('leest getallen met komma of punt', () => {
    expect(parseNumber('1,5')).toBe(1.5);
    expect(parseNumber('1.5')).toBe(1.5);
    expect(parseNumber('1.240')).toBe(1240);
    expect(parseNumber('1.240,5')).toBe(1240.5);
    expect(parseNumber('')).toBeUndefined();
    expect(parseNumber('abc')).toBeUndefined();
  });

  it('geeft de lokale datum', () => {
    expect(toISODate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});

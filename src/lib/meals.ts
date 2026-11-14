import type { MealType } from './types';

export const MEALS: { id: MealType; label: string }[] = [
  { id: 'ontbijt', label: 'Ontbijt' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'diner', label: 'Diner' },
  { id: 'tussendoor', label: 'Tussendoor' },
];

/** Standaardmaaltijd op basis van het tijdstip (F12). */
export function mealForTime(d: Date): MealType {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 5 && h < 10.5) return 'ontbijt';
  if (h >= 11.5 && h < 14.5) return 'lunch';
  if (h >= 17 && h < 21) return 'diner';
  return 'tussendoor';
}

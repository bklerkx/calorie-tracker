import Dexie, { type EntityTable } from 'dexie';
import type { LogEntry, Product, Recipe, SavedMeal, Settings, WaterEntry } from './types';

export class CalorieDB extends Dexie {
  products!: EntityTable<Product, 'id'>;
  recipes!: EntityTable<Recipe, 'id'>;
  savedMeals!: EntityTable<SavedMeal, 'id'>;
  logs!: EntityTable<LogEntry, 'id'>;
  water!: EntityTable<WaterEntry, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor(name = 'calorie-tracker') {
    super(name);
    this.version(1).stores({
      products: '++id, &barcode, naam, favoriet, laatstGebruikt',
      recipes: '++id, naam, laatstGebruikt',
      savedMeals: '++id, naam',
      logs: '++id, datum, [datum+maaltijd], refId',
      water: '++id, datum',
      settings: 'id',
    });
  }
}

export const db = new CalorieDB();

export async function getSettings(database: CalorieDB = db): Promise<Settings> {
  return (await database.settings.get('app')) ?? { id: 'app', doelen: {} };
}

/** Vraag de browser de opslag niet automatisch te wissen (N5). */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

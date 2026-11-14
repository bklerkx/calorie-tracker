// Datamodel volgens REQUIREMENTS §5. Alle voedingswaarden zijn per 100 g/ml.

export type Unit = 'g' | 'ml';
export type MealType = 'ontbijt' | 'lunch' | 'diner' | 'tussendoor';
export type ProductSource = 'off' | 'handmatig';

export interface Nutrients {
  kcal: number;
  eiwit: number;
  kh: number;
  vet: number;
  /** Mag ontbreken als het onbekend is. */
  vezels?: number;
}

export interface Portion {
  naam: string;
  gram: number;
}

export interface Product {
  id?: number;
  barcode?: string;
  naam: string;
  merk?: string;
  eenheid: Unit;
  per100: Nutrients;
  porties: Portion[];
  bron: ProductSource;
  /** 0/1 zodat IndexedDB erop kan indexeren. */
  favoriet: 0 | 1;
  /** Tijdstip (ms) van laatste gebruik, voor "Recent". */
  laatstGebruikt?: number;
  /** Laatst gebruikte hoeveelheid; portie = naam van een portie, anders gram/ml. */
  laatstePortie?: { gram: number; portie?: string; aantal?: number };
}

export interface Ingredient {
  productId: number;
  gram: number;
}

export interface Recipe {
  id?: number;
  naam: string;
  ingredienten: Ingredient[];
  totaalGewicht: number;
  aantalPorties: number;
  per100: Nutrients;
  laatstGebruikt?: number;
}

export interface SavedMeal {
  id?: number;
  naam: string;
  onderdelen: Ingredient[];
}

export type LogType = 'product' | 'recept' | 'snel';

export interface LogEntry {
  id?: number;
  /** Lokale datum als 'YYYY-MM-DD'. */
  datum: string;
  maaltijd: MealType;
  type: LogType;
  refId?: number;
  /** Naam op het moment van loggen (blijft staan als het product later wijzigt). */
  omschrijving?: string;
  gram?: number;
  eenheid?: Unit;
  /** Gekozen portie, bijvoorbeeld 2 × "1 plak". Leeg = hoeveelheid in gram/ml. */
  portie?: { naam: string; aantal: number };
  /** Snapshot van de berekende waarden voor deze invoer (D3). */
  waarden: Nutrients;
  aangemaakt: number;
}

export interface WaterEntry {
  id?: number;
  datum: string;
  tijd: number;
  ml: number;
}

export interface Goals {
  kcal?: number;
  eiwit?: number;
  kh?: number;
  vet?: number;
  vezels?: number;
  water?: number;
}

export interface Settings {
  id: 'app';
  doelen: Goals;
  laatsteBackup?: number;
}

// Gedeelde UI-state: gekozen dag, maaltijd-context, open sheets en de toast.
import { today } from './dates';
import type { LogEntry, MealType, Product } from './types';

export type SheetSpec =
  /** Portie kiezen en loggen, of een bestaande productregel bewerken. */
  | { kind: 'portion'; product: Product; entry?: LogEntry }
  /** Snel kcal toevoegen of een snelle regel bewerken. */
  | { kind: 'quick'; entry?: LogEntry }
  /** Product nieuw/aanvullen/bewerken. Na opslaan van een nieuw product volgt het portiescherm. */
  | { kind: 'product'; draft: Partial<Product>; logAfterSave: boolean }
  | { kind: 'search' }
  | { kind: 'add'; meal: MealType };

export interface OpenSheet {
  id: number;
  spec: SheetSpec;
}

let nextId = 1;
let sheetList = $state.raw<OpenSheet[]>([]);

export const ui = $state({
  /** Dag die op Vandaag getoond wordt en waarop nieuwe invoer komt (F15). */
  date: today(),
  /** Maaltijd gekozen via de "+" van een maaltijdkaart; anders op tijdstip (F12). */
  meal: null as MealType | null,
});

export const sheets = {
  get list() {
    return sheetList;
  },
  get open() {
    return sheetList.length > 0;
  },
};

export function openSheet(spec: SheetSpec): number {
  const id = nextId++;
  sheetList = [...sheetList, { id, spec }];
  return id;
}

export function closeSheet(id: number) {
  sheetList = sheetList.filter((s) => s.id !== id);
}

/** Vervang een sheet door een andere (bijv. productformulier → portiescherm). */
export function replaceSheet(id: number, spec: SheetSpec) {
  sheetList = sheetList.map((s) => (s.id === id ? { id: nextId++, spec } : s));
}

export function closeAllSheets() {
  sheetList = [];
}

/** Na het loggen: alle sheets dicht en de maaltijd-context vergeten. */
export function finishAdd() {
  closeAllSheets();
  ui.meal = null;
}

// Toast (V7, F14a)
export interface ToastSpec {
  text: string;
  action?: { label: string; run: () => void | Promise<void> };
}

let toastState = $state.raw<(ToastSpec & { key: number }) | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const toast = {
  get current() {
    return toastState;
  },
};

export function showToast(spec: ToastSpec, ms = spec.action ? 5000 : 2000) {
  clearTimeout(toastTimer);
  toastState = { ...spec, key: Date.now() };
  toastTimer = setTimeout(() => (toastState = null), ms);
}

export function hideToast() {
  clearTimeout(toastTimer);
  toastState = null;
}

/** Toon "Verwijderd" met 5 seconden "Ongedaan maken" (F14a). */
export function undoToast(text: string, undo: () => void | Promise<void>) {
  showToast({ text, action: { label: 'Ongedaan maken', run: undo } });
}

// Na lang op de achtergrond (bijv. de volgende ochtend) terug naar vandaag.
let hiddenAt = 0;
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt > 30 * 60 * 1000) ui.date = today();
  });
}

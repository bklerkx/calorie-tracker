import { liveQuery } from 'dexie';

/**
 * Reactieve Dexie-query voor Svelte 5. `setup` wordt in een effect uitgevoerd: lees daar de
 * reactieve waarden waarvan de query afhangt en geef de eigenlijke query terug.
 * Het resultaat is "raw" (geen proxy), zodat het direct terug naar IndexedDB kan.
 */
export function live<T>(setup: () => () => T | Promise<T>, initial: T) {
  let value = $state.raw(initial);
  let loaded = $state(false);
  $effect(() => {
    const query = setup();
    const sub = liveQuery(query).subscribe({
      next: (v) => {
        value = v;
        loaded = true;
      },
      error: (e) => console.error(e),
    });
    return () => sub.unsubscribe();
  });
  return {
    get current() {
      return value;
    },
    get loaded() {
      return loaded;
    },
  };
}

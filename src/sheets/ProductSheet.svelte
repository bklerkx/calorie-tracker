<script lang="ts">
  // Product nieuw invoeren, aanvullen na een scan of bewerken (F4, F6, F7, F9).
  import { untrack } from 'svelte';
  import Sheet from '../components/Sheet.svelte';
  import { parseNumber } from '../lib/format';
  import { deleteProduct, restoreProduct, saveProduct } from '../lib/repo';
  import { closeAllSheets, closeSheet, replaceSheet, showToast, undoToast } from '../lib/ui.svelte';
  import type { Nutrients, Product, Unit } from '../lib/types';

  let {
    id,
    draft: draftProp,
    logAfterSave,
    onclose,
  }: { id: number; draft: Partial<Product>; logAfterSave: boolean; onclose: () => void } = $props();
  // Startwaarden van het formulier; de prop verandert niet tijdens de levensduur.
  const draft = untrack(() => draftProp);

  const txt = (n?: number) =>
    n === undefined || !Number.isFinite(n) ? '' : String(n).replace('.', ',');

  const isEdit = draft.id !== undefined;
  const incomplete = !isEdit && draft.bron === 'off';

  let naam = $state(draft.naam ?? '');
  let merk = $state(draft.merk ?? '');
  let barcode = $state(draft.barcode ?? '');
  let eenheid = $state<Unit>(draft.eenheid ?? 'g');
  let kcal = $state(txt(draft.per100?.kcal));
  let eiwit = $state(txt(draft.per100?.eiwit));
  let kh = $state(txt(draft.per100?.kh));
  let vet = $state(txt(draft.per100?.vet));
  let vezels = $state(txt(draft.per100?.vezels));
  let porties = $state((draft.porties ?? []).map((p) => ({ naam: p.naam, gram: txt(p.gram) })));
  let saving = $state(false);

  const kcalNum = $derived(parseNumber(kcal));
  const valid = $derived(naam.trim().length > 0 && kcalNum !== undefined && kcalNum >= 0);

  function addPortion() {
    porties.push({ naam: '', gram: '' });
  }

  async function save() {
    if (!valid || saving) return;
    saving = true;
    const per100: Nutrients = {
      kcal: kcalNum ?? 0,
      eiwit: parseNumber(eiwit) ?? 0,
      kh: parseNumber(kh) ?? 0,
      vet: parseNumber(vet) ?? 0,
    };
    const vz = parseNumber(vezels);
    if (vz !== undefined) per100.vezels = vz;

    const product: Product = {
      ...(draft as Product),
      naam: naam.trim(),
      merk: merk.trim() || undefined,
      barcode: barcode.trim() || undefined,
      eenheid,
      per100,
      porties: porties
        .map((p) => ({ naam: p.naam.trim(), gram: parseNumber(p.gram) ?? 0 }))
        .filter((p) => p.naam && p.gram > 0),
      bron: draft.bron ?? 'handmatig',
      favoriet: draft.favoriet ?? 0,
    };
    try {
      const saved = await saveProduct(product);
      if (logAfterSave) replaceSheet(id, { kind: 'portion', product: saved });
      else closeSheet(id);
    } catch (e) {
      saving = false;
      if ((e as Error)?.name === 'ConstraintError') showToast({ text: 'Barcode bestaat al' });
      else throw e;
    }
  }

  async function remove() {
    if (draft.id === undefined) return;
    const removed = await deleteProduct(draft.id);
    closeAllSheets();
    if (removed) undoToast('Product verwijderd', () => restoreProduct(removed));
  }
</script>

<Sheet title={isEdit ? 'Product' : incomplete ? 'Aanvullen' : 'Nieuw product'} {onclose}>
  <div class="form">
    <label><span>Naam</span><input type="text" bind:value={naam} placeholder="Verplicht" /></label>
    <label><span>Merk</span><input type="text" bind:value={merk} placeholder="Optioneel" /></label>
    <label>
      <span>Barcode</span>
      <input type="text" inputmode="numeric" bind:value={barcode} placeholder="Optioneel" />
    </label>
    <div class="row">
      <span class="lbl">Eenheid</span>
      <div class="seg unit" role="radiogroup" aria-label="Eenheid">
        <button role="radio" aria-checked={eenheid === 'g'} class:active={eenheid === 'g'} onclick={() => (eenheid = 'g')}>g</button>
        <button role="radio" aria-checked={eenheid === 'ml'} class:active={eenheid === 'ml'} onclick={() => (eenheid = 'ml')}>ml</button>
      </div>
    </div>
  </div>

  <section>
    <h3 class="section-title">Per 100 {eenheid}</h3>
    <div class="form">
      <label class:missing={incomplete && !kcal}>
        <span>Kcal</span><input type="text" inputmode="decimal" bind:value={kcal} placeholder="Verplicht" />
      </label>
      <label class:missing={incomplete && !eiwit}>
        <span>Eiwit</span><input type="text" inputmode="decimal" bind:value={eiwit} placeholder="0" /><span class="suffix">g</span>
      </label>
      <label class:missing={incomplete && !kh}>
        <span>Koolhydraten</span><input type="text" inputmode="decimal" bind:value={kh} placeholder="0" /><span class="suffix">g</span>
      </label>
      <label class:missing={incomplete && !vet}>
        <span>Vet</span><input type="text" inputmode="decimal" bind:value={vet} placeholder="0" /><span class="suffix">g</span>
      </label>
      <label>
        <span>Vezels</span><input type="text" inputmode="decimal" bind:value={vezels} placeholder="–" /><span class="suffix">g</span>
      </label>
    </div>
  </section>

  <section>
    <h3 class="section-title">Porties</h3>
    <div class="form">
      {#each porties as p, i (i)}
        <div class="row portion">
          <input class="pname" type="text" bind:value={p.naam} placeholder="1 plak" aria-label="Portienaam" />
          <input class="pgram" type="text" inputmode="decimal" bind:value={p.gram} placeholder="0" aria-label="Gewicht" />
          <span class="suffix">{eenheid}</span>
          <button class="remove" aria-label="Portie verwijderen" onclick={() => porties.splice(i, 1)}>−</button>
        </div>
      {/each}
      <button class="row add" onclick={addPortion}>+ Portie</button>
    </div>
  </section>

  {#if isEdit}
    <button class="btn-secondary danger" onclick={remove}>Verwijderen</button>
  {/if}

  {#snippet footer()}
    <button class="btn-primary" disabled={!valid || saving} onclick={save}>
      {logAfterSave ? 'Volgende' : 'Opslaan'}
    </button>
  {/snippet}
</Sheet>

<style>
  .lbl {
    flex: 1;
  }

  .unit {
    width: 120px;
  }

  .missing span:first-child {
    color: var(--danger);
  }

  .portion {
    gap: 8px;
  }

  .portion .pname {
    text-align: left;
  }

  .portion .pgram {
    flex: none;
    width: 56px;
  }

  .remove {
    flex: none;
    width: 44px;
    height: 44px;
    margin-right: -12px;
    color: var(--danger);
    font-size: 24px;
  }

  .add {
    width: calc(100% - var(--gutter));
    color: var(--accent);
  }

  section {
    display: flex;
    flex-direction: column;
  }
</style>

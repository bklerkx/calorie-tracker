<script lang="ts">
  // Snel kcal toevoegen zonder product (F7a), of zo'n regel bewerken.
  import { untrack } from 'svelte';
  import Sheet from '../components/Sheet.svelte';
  import MealPicker from '../components/MealPicker.svelte';
  import CopyPanel from '../components/CopyPanel.svelte';
  import { parseNumber } from '../lib/format';
  import { dayLabel } from '../lib/dates';
  import { MEALS, mealForTime } from '../lib/meals';
  import { copyLog, deleteLog, logQuick, restoreLog, updateLog } from '../lib/repo';
  import { closeSheet, finishAdd, showToast, ui, undoToast } from '../lib/ui.svelte';
  import type { LogEntry, Nutrients } from '../lib/types';

  let { id, entry: entryProp, onclose }: { id: number; entry?: LogEntry; onclose: () => void } = $props();
  // Een sheet hoort bij één regel; de prop verandert niet tijdens de levensduur.
  const entry = untrack(() => entryProp);

  const txt = (n?: number) => (n === undefined || !n ? '' : String(Math.round(n * 10) / 10).replace('.', ','));
  let kcal = $state(txt(entry?.waarden.kcal));
  let omschrijving = $state(entry?.omschrijving ?? '');
  let eiwit = $state(txt(entry?.waarden.eiwit));
  let kh = $state(txt(entry?.waarden.kh));
  let vet = $state(txt(entry?.waarden.vet));
  let vezels = $state(txt(entry?.waarden.vezels));
  let meal = $state(entry?.maaltijd ?? ui.meal ?? mealForTime(new Date()));
  let showCopy = $state(false);
  const date = entry?.datum ?? ui.date;

  const kcalNum = $derived(parseNumber(kcal));
  const valid = $derived(kcalNum !== undefined && kcalNum > 0);

  function values(): Nutrients {
    const v: Nutrients = {
      kcal: kcalNum ?? 0,
      eiwit: parseNumber(eiwit) ?? 0,
      kh: parseNumber(kh) ?? 0,
      vet: parseNumber(vet) ?? 0,
    };
    const vz = parseNumber(vezels);
    if (vz !== undefined) v.vezels = vz;
    return v;
  }

  const mealLabel = (m: string) => MEALS.find((x) => x.id === m)?.label ?? '';

  async function add() {
    if (!valid) return;
    await logQuick({ datum: date, maaltijd: meal, omschrijving, waarden: values() });
    finishAdd();
    showToast({ text: `Toegevoegd · ${mealLabel(meal)}` });
  }

  async function save() {
    if (!entry?.id || !valid) return;
    await updateLog(entry.id, { maaltijd: meal, omschrijving: omschrijving.trim() || undefined, waarden: values() });
    closeSheet(id);
  }

  async function remove() {
    if (!entry?.id) return;
    const removed = await deleteLog(entry.id);
    closeSheet(id);
    if (removed) undoToast('Verwijderd', () => restoreLog(removed));
  }

  async function copy(d: string, m: typeof meal) {
    if (!entry || !valid) return;
    await copyLog({ ...entry, omschrijving: omschrijving.trim() || undefined, waarden: values() }, d, m);
    closeSheet(id);
    showToast({ text: `Gekopieerd · ${dayLabel(d)}` });
  }
</script>

<Sheet title="Snel kcal" {onclose}>
  {#if dayLabel(date) !== 'Vandaag'}<p class="day">{dayLabel(date)}</p>{/if}

  <div class="card big">
    <input
      class="num"
      type="text"
      inputmode="decimal"
      placeholder="0"
      bind:value={kcal}
      aria-label="Kcal"
    />
    <span>kcal</span>
  </div>

  <div class="form">
    <label><span>Omschrijving</span><input type="text" bind:value={omschrijving} placeholder="Optioneel" /></label>
    <label><span>Eiwit</span><input type="text" inputmode="decimal" bind:value={eiwit} placeholder="–" /><span class="suffix">g</span></label>
    <label><span>Koolhydraten</span><input type="text" inputmode="decimal" bind:value={kh} placeholder="–" /><span class="suffix">g</span></label>
    <label><span>Vet</span><input type="text" inputmode="decimal" bind:value={vet} placeholder="–" /><span class="suffix">g</span></label>
    <label><span>Vezels</span><input type="text" inputmode="decimal" bind:value={vezels} placeholder="–" /><span class="suffix">g</span></label>
  </div>

  <MealPicker bind:value={meal} />

  {#if entry && showCopy}
    <CopyPanel date={entry.datum} {meal} oncopy={copy} />
  {/if}

  {#snippet footer()}
    {#if entry}
      <button class="btn-primary" disabled={!valid} onclick={save}>Opslaan</button>
      <div class="btn-row">
        <button class="btn-secondary" onclick={() => (showCopy = !showCopy)}>Kopiëren</button>
        <button class="btn-secondary danger" onclick={remove}>Verwijderen</button>
      </div>
    {:else}
      <button class="btn-primary" disabled={!valid} onclick={add}>Toevoegen</button>
    {/if}
  {/snippet}
</Sheet>

<style>
  .day {
    margin: -12px 0 0;
    text-align: center;
    font-size: 13px;
    color: var(--text-2);
  }

  .big {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 6px;
    padding: 8px var(--gutter);
    color: var(--text-2);
  }

  .big input {
    width: 5ch;
    height: 60px;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--text);
    font-size: 44px;
    font-weight: 700;
    text-align: right;
  }
</style>

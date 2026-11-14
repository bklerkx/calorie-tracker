<script lang="ts">
  // Portie kiezen (F8–F11) met live berekening, en een bestaande productregel bewerken (F14).
  import { untrack } from 'svelte';
  import Sheet from '../components/Sheet.svelte';
  import MealPicker from '../components/MealPicker.svelte';
  import Macros from '../components/Macros.svelte';
  import CopyPanel from '../components/CopyPanel.svelte';
  import Icon from '../components/Icon.svelte';
  import { db } from '../lib/db';
  import { live } from '../lib/live.svelte';
  import { formatInt, parseNumber } from '../lib/format';
  import { dayLabel } from '../lib/dates';
  import { MEALS, mealForTime } from '../lib/meals';
  import { per100FromSnapshot, scale } from '../lib/nutrition';
  import { copyLog, deleteLog, logProduct, restoreLog, updateLog } from '../lib/repo';
  import { closeSheet, finishAdd, openSheet, showToast, ui, undoToast } from '../lib/ui.svelte';
  import type { LogEntry, Product } from '../lib/types';

  let {
    id,
    product: initialProp,
    entry: entryProp,
    onclose,
  }: { id: number; product: Product; entry?: LogEntry; onclose: () => void } = $props();
  // Een sheet hoort bij één product/regel; de props veranderen niet tijdens de levensduur.
  const entry = untrack(() => entryProp);
  const initial = untrack(() => initialProp);

  // Volg het product in de database, zodat een bewerking (✎) direct zichtbaar is.
  const stored = live(
    () => {
      const pid = initial.id;
      return () => (pid !== undefined ? db.products.get(pid) : undefined);
    },
    undefined as Product | undefined,
  );
  const product = $derived(stored.current ?? initial);
  const unit = $derived(entry?.eenheid ?? product.eenheid);
  const portions = $derived(product.porties ?? []);

  // Bij bewerken rekenen we vanuit de snapshot, zodat productwijzigingen de regel niet raken (D3).
  const per100 = $derived(
    entry && entry.gram ? per100FromSnapshot(entry.waarden, entry.gram) : product.per100,
  );

  // Startwaarden: bestaande regel → laatste portie → eerste portie → 100 g (F11)
  function initialChoice(): { portion: string | null; amount: number } {
    const src = entry
      ? entry.portie
        ? { portie: entry.portie.naam, aantal: entry.portie.aantal, gram: entry.gram ?? 100 }
        : { gram: entry.gram ?? 100 }
      : initial.laatstePortie;
    if (src?.portie && initial.porties.some((p) => p.naam === src.portie)) {
      return { portion: src.portie, amount: src.aantal ?? 1 };
    }
    if (src) return { portion: null, amount: src.gram };
    if (initial.porties.length) return { portion: initial.porties[0].naam, amount: 1 };
    return { portion: null, amount: 100 };
  }

  const start = initialChoice();
  let portionName = $state<string | null>(start.portion);
  let amountText = $state(String(start.amount).replace('.', ','));
  let meal = $state(entry?.maaltijd ?? ui.meal ?? mealForTime(new Date()));
  let showCopy = $state(false);
  const date = entry?.datum ?? ui.date;

  const portion = $derived(portions.find((p) => p.naam === portionName) ?? null);
  const amount = $derived(parseNumber(amountText) ?? 0);
  const gram = $derived(portion ? amount * portion.gram : amount);
  const values = $derived(scale(per100, gram));
  const valid = $derived(gram > 0 && Number.isFinite(gram));

  const quick = $derived(portion ? [0.5, 1, 1.5, 2, 3] : [50, 100, 150, 200, 250]);

  function choose(name: string | null) {
    if (name === portionName) return;
    portionName = name;
    amountText = name ? '1' : String(Math.round(gram || 100));
  }

  const fmtAmount = (n: number) => String(n).replace('.', ',');
  const mealLabel = (m: string) => MEALS.find((x) => x.id === m)?.label ?? '';

  async function add() {
    if (!valid) return;
    await logProduct({
      product,
      datum: date,
      maaltijd: meal,
      gram,
      portie: portion ? { naam: portion.naam, aantal: amount } : undefined,
    });
    finishAdd();
    showToast({ text: `Toegevoegd · ${mealLabel(meal)}` });
  }

  async function save() {
    if (!entry?.id || !valid) return;
    await updateLog(entry.id, {
      maaltijd: meal,
      gram,
      portie: portion ? { naam: portion.naam, aantal: amount } : undefined,
      waarden: values,
    });
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
    await copyLog(
      { ...entry, gram, portie: portion ? { naam: portion.naam, aantal: amount } : undefined, waarden: values },
      d,
      m,
    );
    closeSheet(id);
    showToast({ text: `Gekopieerd · ${dayLabel(d)}` });
  }

  function edit() {
    openSheet({ kind: 'product', draft: product, logAfterSave: false });
  }
</script>

<Sheet title={entry?.omschrijving ?? product.naam} {onclose}>
  <div class="head">
    <span class="brand">{[product.merk, dayLabel(date) !== 'Vandaag' ? dayLabel(date) : ''].filter(Boolean).join(' · ')}</span>
    {#if product.id !== undefined}
      <button class="edit link-btn" aria-label="Product bewerken" onclick={edit}><Icon name="edit" size={20} /></button>
    {/if}
  </div>

  <div class="card result">
    <div class="kcal"><span class="num">{formatInt(values.kcal)}</span> kcal</div>
    <Macros {values} />
  </div>

  <div class="amount card">
    <input
      class="num"
      type="text"
      inputmode="decimal"
      bind:value={amountText}
      aria-label="Hoeveelheid"
      onfocus={(e) => e.currentTarget.select()}
    />
    <span class="unit">{portion ? `× ${portion.naam}` : unit}</span>
    {#if portion}<span class="grams num">{formatInt(gram)} {unit}</span>{/if}
  </div>

  {#if portions.length}
    <div class="chips" role="radiogroup" aria-label="Eenheid">
      <button class="chip" class:active={!portion} role="radio" aria-checked={!portion} onclick={() => choose(null)}>
        {unit}
      </button>
      {#each portions as p (p.naam)}
        <button
          class="chip"
          class:active={portionName === p.naam}
          role="radio"
          aria-checked={portionName === p.naam}
          onclick={() => choose(p.naam)}
        >
          {p.naam} <span class="dim">{formatInt(p.gram)} {unit}</span>
        </button>
      {/each}
    </div>
  {/if}

  <div class="chips">
    {#each quick as q (q)}
      <button class="chip" class:active={amount === q} onclick={() => (amountText = fmtAmount(q))}>
        {q === 0.5 ? '½' : q === 1.5 ? '1½' : fmtAmount(q)}
      </button>
    {/each}
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
  .head {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 20px;
    margin-top: -14px;
    position: relative;
  }

  .brand {
    font-size: 13px;
    color: var(--text-2);
  }

  .edit {
    position: absolute;
    right: -8px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .result {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 8px 12px;
  }

  .kcal {
    text-align: center;
    color: var(--text-2);
  }

  .kcal .num {
    font-size: 40px;
    font-weight: 700;
    color: var(--text);
  }

  .amount {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 6px var(--gutter);
  }

  .amount input {
    width: 4.5ch;
    min-width: 0;
    flex: none;
    height: 52px;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--text);
    font-size: 34px;
    font-weight: 600;
  }

  .unit {
    flex: 1;
    font-size: 17px;
    color: var(--text-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .grams {
    color: var(--text-2);
    font-size: 15px;
  }

  .dim {
    opacity: 0.6;
    font-size: 13px;
  }
</style>

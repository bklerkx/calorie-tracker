<script lang="ts">
  import Screen from '../components/Screen.svelte';
  import Icon from '../components/Icon.svelte';
  import Macros from '../components/Macros.svelte';
  import SwipeRow from '../components/SwipeRow.svelte';
  import { db } from '../lib/db';
  import { live } from '../lib/live.svelte';
  import { addDays, dayLabel, today } from '../lib/dates';
  import { MEALS } from '../lib/meals';
  import { formatInt } from '../lib/format';
  import { sum } from '../lib/nutrition';
  import { deleteLog, restoreLog } from '../lib/repo';
  import { navigate } from '../lib/router.svelte';
  import { openSheet, ui, undoToast } from '../lib/ui.svelte';
  import type { LogEntry, Product } from '../lib/types';

  const logs = live(() => {
    const d = ui.date;
    return () => db.logs.where('datum').equals(d).sortBy('aangemaakt');
  }, [] as LogEntry[]);

  const total = $derived(sum(logs.current.map((l) => l.waarden)));
  const byMeal = $derived(
    MEALS.map((m) => {
      const entries = logs.current.filter((l) => l.maaltijd === m.id);
      return { ...m, entries, kcal: sum(entries.map((e) => e.waarden)).kcal };
    }),
  );

  function amountLabel(e: LogEntry): string {
    if (e.type === 'snel') return 'Snel';
    const unit = e.eenheid ?? 'g';
    if (e.portie) {
      const n = String(e.portie.aantal).replace('.', ',');
      return `${n} × ${e.portie.naam} · ${formatInt(e.gram ?? 0)} ${unit}`;
    }
    return `${formatInt(e.gram ?? 0)} ${unit}`;
  }

  async function edit(e: LogEntry) {
    if (e.type === 'snel') {
      openSheet({ kind: 'quick', entry: e });
      return;
    }
    // Product kan intussen gewijzigd of verwijderd zijn; de regel zelf blijft leidend (D3).
    const p = e.refId !== undefined ? await db.products.get(e.refId) : undefined;
    const product: Product = p ?? {
      naam: e.omschrijving ?? '',
      eenheid: e.eenheid ?? 'g',
      per100: e.waarden,
      porties: [],
      bron: 'handmatig',
      favoriet: 0,
    };
    openSheet({ kind: 'portion', product, entry: e });
  }

  async function remove(e: LogEntry) {
    if (e.id === undefined) return;
    const removed = await deleteLog(e.id);
    if (removed) undoToast('Verwijderd', () => restoreLog(removed));
  }

  const isToday = $derived(ui.date === today());
</script>

<Screen title={dayLabel(ui.date)}>
  {#snippet actions()}
    {#if !isToday}
      <button class="link-btn today" onclick={() => (ui.date = today())}>Vandaag</button>
    {/if}
    <button class="nav" aria-label="Vorige dag" onclick={() => (ui.date = addDays(ui.date, -1))}>‹</button>
    <button class="nav" aria-label="Volgende dag" onclick={() => (ui.date = addDays(ui.date, 1))}>›</button>
  {/snippet}

  <section class="card total">
    <div class="kcal"><span class="big num">{formatInt(total.kcal)}</span> kcal</div>
    <Macros values={total} />
  </section>

  {#if logs.loaded && logs.current.length === 0}
    <div class="empty-day">
      Nog niets gegeten · <button class="link-btn" onclick={() => navigate('scan')}>Scan</button>
    </div>
  {/if}

  {#each byMeal as meal (meal.id)}
    <section class="card meal">
      <header>
        <h2>{meal.label}</h2>
        {#if meal.entries.length}<span class="meal-kcal num">{formatInt(meal.kcal)}</span>{/if}
        <button class="add" aria-label="{meal.label} toevoegen" onclick={() => openSheet({ kind: 'add', meal: meal.id })}>
          <Icon name="plus" size={20} />
        </button>
      </header>
      {#each meal.entries as e (e.id)}
        <SwipeRow ondelete={() => remove(e)} ontap={() => edit(e)}>
          <div class="entry">
            <span class="main">
              <span class="name">{e.omschrijving ?? 'Snel'}</span>
              <span class="sub">{amountLabel(e)}</span>
            </span>
            <span class="end num">{formatInt(e.waarden.kcal)}</span>
          </div>
        </SwipeRow>
      {/each}
    </section>
  {/each}
</Screen>

<style>
  .nav {
    width: 44px;
    height: 44px;
    color: var(--accent);
    font-size: 30px;
    line-height: 1;
  }

  .today {
    font-size: 15px;
  }

  .total {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 20px 8px 16px;
  }

  .kcal {
    text-align: center;
    color: var(--text-2);
  }

  .big {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--text);
  }

  .empty-day {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-2);
    margin: -8px 0;
  }

  .meal header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: var(--gutter);
    min-height: 52px;
  }

  h2 {
    flex: 1;
    margin: 0;
    font-size: 17px;
    font-weight: 600;
  }

  .meal-kcal {
    color: var(--text-2);
    font-weight: 500;
  }

  .add {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    margin-left: -8px;
    color: var(--text-3);
  }

  .meal-kcal + .add {
    color: var(--accent);
  }

  .entry {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 8px var(--gutter);
    border-top: 0.5px solid var(--separator);
    margin-left: var(--gutter);
    padding-left: 0;
  }

  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sub {
    font-size: 13px;
    color: var(--text-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .end {
    flex: none;
  }
</style>

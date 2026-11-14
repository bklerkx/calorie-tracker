<script lang="ts">
  // Kopiëren naar een andere dag of maaltijd (F14).
  import MealPicker from './MealPicker.svelte';
  import { addDays, dayLabel } from '../lib/dates';
  import type { MealType } from '../lib/types';
  import { untrack } from 'svelte';

  let { date, meal, oncopy }: { date: string; meal: MealType; oncopy: (date: string, meal: MealType) => void } =
    $props();

  // Startwaarden; daarna kiest de gebruiker zelf.
  let d = $state(untrack(() => date));
  let m = $state(untrack(() => meal));
</script>

<div class="panel">
  <div class="day">
    <button class="link-btn" aria-label="Vorige dag" onclick={() => (d = addDays(d, -1))}>‹</button>
    <label class="date">
      <span>{dayLabel(d)}</span>
      <input type="date" bind:value={d} aria-label="Datum" />
    </label>
    <button class="link-btn" aria-label="Volgende dag" onclick={() => (d = addDays(d, 1))}>›</button>
  </div>
  <MealPicker bind:value={m} />
  <button class="btn-secondary" disabled={!d} onclick={() => oncopy(d, m)}>Kopieer</button>
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: var(--radius);
    background: var(--card);
  }

  .day {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .day .link-btn {
    font-size: 26px;
  }

  .date {
    position: relative;
    font-weight: 600;
  }

  .date input {
    position: absolute;
    inset: 0;
    opacity: 0;
  }

  .btn-secondary {
    background: var(--fill);
  }
</style>

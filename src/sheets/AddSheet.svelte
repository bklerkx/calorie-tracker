<script lang="ts">
  // "+" bij een maaltijd: kies hoe je iets toevoegt.
  import Sheet from '../components/Sheet.svelte';
  import Icon from '../components/Icon.svelte';
  import { MEALS } from '../lib/meals';
  import { navigate } from '../lib/router.svelte';
  import { closeSheet, replaceSheet, ui } from '../lib/ui.svelte';
  import type { MealType } from '../lib/types';

  let { id, meal, onclose }: { id: number; meal: MealType; onclose: () => void } = $props();
  const label = MEALS.find((m) => m.id === meal)?.label;

  function scan() {
    ui.meal = meal;
    closeSheet(id);
    navigate('scan');
  }
</script>

<Sheet title={label} {onclose}>
  <div class="grid">
    <button class="card opt" onclick={scan}><Icon name="scan" />Scan</button>
    <button class="card opt" onclick={() => replaceSheet(id, { kind: 'search' })}><Icon name="search" />Zoeken</button>
    <button class="card opt" onclick={() => replaceSheet(id, { kind: 'quick' })}><Icon name="plus" />Snel kcal</button>
  </div>
</Sheet>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding-bottom: calc(var(--safe-bottom) + 8px);
  }

  .opt {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 88px;
    color: var(--accent);
    font-size: 15px;
    font-weight: 500;
  }
</style>

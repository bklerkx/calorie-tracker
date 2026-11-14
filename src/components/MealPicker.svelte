<script lang="ts">
  import { MEALS } from '../lib/meals';
  import type { MealType } from '../lib/types';

  let { value = $bindable() }: { value: MealType } = $props();
</script>

<div class="seg" role="radiogroup" aria-label="Maaltijd">
  {#each MEALS as m (m.id)}
    <button role="radio" aria-checked={value === m.id} class:active={value === m.id} onclick={() => (value = m.id)}>
      {m.label}
    </button>
  {/each}
</div>

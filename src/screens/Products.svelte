<script lang="ts">
  import Screen from '../components/Screen.svelte';
  import Icon from '../components/Icon.svelte';
  import ProductList from '../components/ProductList.svelte';
  import { openSheet } from '../lib/ui.svelte';

  const segments = ['Recent', 'Favorieten', 'Maaltijden', 'Recepten', 'Alle'] as const;
  type Segment = (typeof segments)[number];
  // Recent/Favorieten/Maaltijden volgen in fase 4, Recepten in fase 5.
  const later: Partial<Record<Segment, string>> = {
    Recent: 'Volgt in fase 4',
    Favorieten: 'Volgt in fase 4',
    Maaltijden: 'Volgt in fase 4',
    Recepten: 'Volgt in fase 5',
  };
  let active = $state<Segment>('Alle');
  let query = $state('');
</script>

<Screen title="Producten">
  {#snippet actions()}
    <button
      class="new"
      aria-label="Nieuw product"
      onclick={() => openSheet({ kind: 'product', draft: {}, logAfterSave: false })}
    >
      <Icon name="plus" size={24} />
    </button>
  {/snippet}

  <div class="seg" role="tablist">
    {#each segments as s (s)}
      <button role="tab" aria-selected={active === s} class:active={active === s} onclick={() => (active = s)}>
        {s}
      </button>
    {/each}
  </div>

  {#if later[active]}
    <section class="card"><div class="empty">{later[active]}</div></section>
  {:else}
    <ProductList bind:query />
  {/if}
</Screen>

<style>
  .new {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: var(--accent);
  }

  .seg {
    grid-auto-columns: minmax(0, auto);
    margin-top: -4px;
  }
</style>

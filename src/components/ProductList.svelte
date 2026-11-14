<script lang="ts">
  // Zoeken in de eigen productdatabase (F5). Tikken opent het portiescherm.
  import Icon from './Icon.svelte';
  import { db } from '../lib/db';
  import { live } from '../lib/live.svelte';
  import { formatInt } from '../lib/format';
  import { openSheet } from '../lib/ui.svelte';
  import type { Product } from '../lib/types';

  let { query = $bindable('') }: { query?: string } = $props();

  const products = live(() => () => db.products.orderBy('naam').toArray(), [] as Product[]);

  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');

  const results = $derived.by(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    if (!words.length) return products.current;
    return products.current.filter((p) => {
      const hay = norm(`${p.naam} ${p.merk ?? ''} ${p.barcode ?? ''}`);
      return words.every((w) => hay.includes(w));
    });
  });
</script>

<div class="search">
  <Icon name="search" size={18} />
  <input type="search" placeholder="Zoeken" bind:value={query} enterkeyhint="search" autocomplete="off" />
</div>

{#if products.loaded}
  {#if results.length}
    <div class="card list">
      {#each results as p (p.id)}
        <button class="list-row" onclick={() => openSheet({ kind: 'portion', product: p })}>
          <span class="main">
            <span class="name">{p.naam}</span>
            {#if p.merk}<span class="sub">{p.merk}</span>{/if}
          </span>
          <span class="end num">{formatInt(p.per100.kcal)} <small>/100 {p.eenheid}</small></span>
        </button>
      {/each}
    </div>
  {:else}
    <div class="card empty">
      {query ? 'Niets gevonden' : 'Nog geen producten'} ·
      <button
        class="link-btn"
        onclick={() => openSheet({ kind: 'product', draft: { naam: query.trim() }, logAfterSave: true })}
      >
        Nieuw
      </button>
    </div>
  {/if}
{/if}

<style>
  .search {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 10px;
    border-radius: 10px;
    background: var(--fill);
    color: var(--text-2);
  }

  .search input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--text);
  }

  small {
    font-size: 12px;
  }
</style>

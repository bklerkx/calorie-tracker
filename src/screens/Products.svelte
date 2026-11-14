<script lang="ts">
  import Screen from '../components/Screen.svelte';
  import Icon from '../components/Icon.svelte';
  import { navigate } from '../lib/router.svelte';

  const segments = ['Recent', 'Favorieten', 'Maaltijden', 'Recepten', 'Alle'] as const;
  let active = $state<(typeof segments)[number]>('Recent');
  let query = $state('');
</script>

<Screen title="Producten">
  <div class="search">
    <Icon name="search" size={18} />
    <input type="search" placeholder="Zoeken" bind:value={query} enterkeyhint="search" />
  </div>

  <div class="segmented" role="tablist">
    {#each segments as s (s)}
      <button role="tab" aria-selected={active === s} class:active={active === s} onclick={() => (active = s)}>
        {s}
      </button>
    {/each}
  </div>

  <section class="card">
    <div class="empty">
      Nog geen producten · <button class="link-btn" onclick={() => navigate('scan')}>Scan</button>
    </div>
  </section>
</Screen>

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

  .segmented {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, auto));
    gap: 2px;
    padding: 2px;
    margin-top: -8px;
    border-radius: 9px;
    background: var(--fill);
  }

  .segmented button {
    min-height: 36px;
    padding: 0 4px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }

  .segmented button.active {
    background: var(--card);
    font-weight: 600;
  }
</style>

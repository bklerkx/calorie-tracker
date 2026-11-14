<script lang="ts">
  import Icon from './Icon.svelte';
  import { navigate, route, type Tab } from '../lib/router.svelte';

  const items: { tab: Tab; label: string }[] = [
    { tab: 'vandaag', label: 'Vandaag' },
    { tab: 'week', label: 'Week' },
    { tab: 'scan', label: 'Scan' },
    { tab: 'producten', label: 'Producten' },
    { tab: 'instellingen', label: 'Instellingen' },
  ];
</script>

<nav class="tabbar" aria-label="Hoofdmenu">
  {#each items as item (item.tab)}
    {#if item.tab === 'scan'}
      <button
        class="scan"
        class:active={route.tab === 'scan'}
        aria-label={item.label}
        aria-current={route.tab === 'scan' ? 'page' : undefined}
        onclick={() => navigate('scan')}
      >
        <span class="scan-circle"><Icon name="scan" size={28} /></span>
      </button>
    {:else}
      <button
        class="tab"
        class:active={route.tab === item.tab}
        aria-current={route.tab === item.tab ? 'page' : undefined}
        onclick={() => navigate(item.tab)}
      >
        <Icon name={item.tab} />
        <span class="label">{item.label}</span>
      </button>
    {/if}
  {/each}
</nav>

<style>
  .tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: stretch;
    height: calc(var(--tabbar-h) + var(--safe-bottom));
    padding-bottom: var(--safe-bottom);
    background: var(--tabbar);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
    border-top: 0.5px solid var(--separator);
  }

  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-height: 44px;
    color: var(--text-2);
  }

  .tab.active {
    color: var(--accent);
  }

  .label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1px;
  }

  .scan {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scan-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    margin-top: -18px;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    border: 4px solid var(--bg);
    transition: transform 0.1s ease;
  }

  .scan:active .scan-circle {
    transform: scale(0.94);
  }
</style>

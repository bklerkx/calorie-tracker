<script lang="ts">
  import TabBar from './components/TabBar.svelte';
  import Toast from './components/Toast.svelte';
  import Today from './screens/Today.svelte';
  import Week from './screens/Week.svelte';
  import Scan from './screens/Scan.svelte';
  import Products from './screens/Products.svelte';
  import Settings from './screens/Settings.svelte';
  import PortionSheet from './sheets/PortionSheet.svelte';
  import QuickSheet from './sheets/QuickSheet.svelte';
  import ProductSheet from './sheets/ProductSheet.svelte';
  import SearchSheet from './sheets/SearchSheet.svelte';
  import AddSheet from './sheets/AddSheet.svelte';
  import { route } from './lib/router.svelte';
  import { closeSheet, sheets } from './lib/ui.svelte';
</script>

{#if route.tab === 'vandaag'}
  <Today />
{:else if route.tab === 'week'}
  <Week />
{:else if route.tab === 'scan'}
  <Scan />
{:else if route.tab === 'producten'}
  <Products />
{:else}
  <Settings />
{/if}

<TabBar />

{#each sheets.list as s (s.id)}
  {@const close = () => closeSheet(s.id)}
  {#if s.spec.kind === 'portion'}
    <PortionSheet id={s.id} product={s.spec.product} entry={s.spec.entry} onclose={close} />
  {:else if s.spec.kind === 'quick'}
    <QuickSheet id={s.id} entry={s.spec.entry} onclose={close} />
  {:else if s.spec.kind === 'product'}
    <ProductSheet id={s.id} draft={s.spec.draft} logAfterSave={s.spec.logAfterSave} onclose={close} />
  {:else if s.spec.kind === 'search'}
    <SearchSheet onclose={close} />
  {:else if s.spec.kind === 'add'}
    <AddSheet id={s.id} meal={s.spec.meal} onclose={close} />
  {/if}
{/each}

<Toast />

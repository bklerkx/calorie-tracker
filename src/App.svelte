<script lang="ts">
  import TabBar from './components/TabBar.svelte';
  import Today from './screens/Today.svelte';
  import Week from './screens/Week.svelte';
  import Scan from './screens/Scan.svelte';
  import Products from './screens/Products.svelte';
  import Settings from './screens/Settings.svelte';
  import { route } from './lib/router.svelte';
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

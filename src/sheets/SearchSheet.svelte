<script lang="ts">
  import Sheet from '../components/Sheet.svelte';
  import ProductList from '../components/ProductList.svelte';
  import { openSheet } from '../lib/ui.svelte';

  let { onclose }: { onclose: () => void } = $props();
  let query = $state('');
</script>

<Sheet title="Zoeken" {onclose}>
  <ProductList bind:query />
  {#snippet footer()}
    <button
      class="btn-secondary"
      onclick={() => openSheet({ kind: 'product', draft: { naam: query.trim() }, logAfterSave: true })}
    >
      Nieuw product
    </button>
  {/snippet}
</Sheet>

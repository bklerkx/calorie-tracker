<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, actions, children }: { title: string; actions?: Snippet; children: Snippet } = $props();
</script>

<main class="screen">
  <header>
    <h1>{title}</h1>
    {#if actions}<div class="actions">{@render actions()}</div>{/if}
  </header>
  <div class="content">
    {@render children()}
  </div>
</main>

<style>
  .screen {
    min-height: 100dvh;
    padding: calc(var(--safe-top) + 8px) var(--gutter)
      calc(var(--tabbar-h) + var(--safe-bottom) + 24px);
  }

  header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
    min-height: 52px;
    margin-bottom: 8px;
  }

  h1 {
    margin: 0;
    font-size: 34px;
    font-weight: 700;
    letter-spacing: 0.37px;
  }

  .actions {
    display: flex;
    gap: 4px;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
</style>

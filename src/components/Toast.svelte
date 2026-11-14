<script lang="ts">
  import { fly } from 'svelte/transition';
  import { hideToast, sheets, toast } from '../lib/ui.svelte';

  async function act() {
    const t = toast.current;
    hideToast();
    await t?.action?.run();
  }
</script>

{#if toast.current}
  {#key toast.current.key}
    <div class="toast" class:raised={!sheets.open}
      class:top={sheets.open} role="status" transition:fly={{ y: 20, duration: 180 }}>
      <span>{toast.current.text}</span>
      {#if toast.current.action}
        <button onclick={act}>{toast.current.action.label}</button>
      {/if}
    </div>
  {/key}
{/if}

<style>
  .toast {
    position: fixed;
    left: var(--gutter);
    right: var(--gutter);
    bottom: calc(var(--safe-bottom) + 16px);
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 48px;
    padding: 0 6px 0 16px;
    border-radius: 12px;
    background: rgba(44, 44, 46, 0.96);
    color: #fff;
    font-size: 15px;
  }

  .toast.raised {
    bottom: calc(var(--tabbar-h) + var(--safe-bottom) + 12px);
  }

  /* Boven een open sheet, zodat de knoppen onderin bereikbaar blijven */
  .toast.top {
    bottom: auto;
    top: calc(var(--safe-top) + 8px);
  }

  .toast span {
    padding: 12px 0;
  }

  button {
    min-height: 44px;
    padding: 0 10px;
    color: #64d2ff;
    font-weight: 600;
    white-space: nowrap;
  }
</style>

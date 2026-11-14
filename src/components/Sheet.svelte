<script lang="ts">
  // Sheet die van onderen omhoog schuift (V7). Sluiten via ×, de achtergrond of omlaag slepen.
  import type { Snippet } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let {
    title,
    onclose,
    children,
    footer,
  }: { title?: string; onclose: () => void; children: Snippet; footer?: Snippet } = $props();

  let dragY = $state(0);
  let startY: number | null = null;

  function down(e: PointerEvent) {
    startY = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent) {
    if (startY !== null) dragY = Math.max(0, e.clientY - startY);
  }
  function up() {
    if (startY === null) return;
    startY = null;
    if (dragY > 90) onclose();
    else dragY = 0;
  }
</script>

<div class="backdrop" transition:fade={{ duration: 200 }} onclick={onclose} aria-hidden="true"></div>
<div
  class="sheet"
  role="dialog"
  aria-modal="true"
  aria-label={title}
  style:transform={dragY ? `translateY(${dragY}px)` : undefined}
  transition:fly={{ y: 600, duration: 280, easing: cubicOut, opacity: 1 }}
>
  <header role="presentation" onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}>
    <span class="grabber"></span>
    <button class="close" aria-label="Sluiten" onclick={onclose}>
      <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      </svg>
    </button>
    {#if title}<h2>{title}</h2>{/if}
  </header>
  <div class="body">
    {@render children()}
  </div>
  {#if footer}
    <div class="footer">{@render footer()}</div>
  {/if}
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 30;
    background: rgba(0, 0, 0, 0.35);
  }

  .sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: var(--kb, 0px);
    z-index: 31;
    display: flex;
    flex-direction: column;
    max-height: calc(var(--vvh, 100dvh) - var(--safe-top) - 12px);
    background: var(--bg);
    border-radius: 14px 14px 0 0;
    transition: transform 0.15s ease;
  }

  header {
    position: relative;
    flex: none;
    min-height: 52px;
    padding: 18px 56px 4px;
    text-align: center;
    touch-action: none;
  }

  .grabber {
    position: absolute;
    top: 6px;
    left: 50%;
    width: 36px;
    height: 5px;
    margin-left: -18px;
    border-radius: 3px;
    background: var(--text-3);
  }

  .close {
    position: absolute;
    top: 8px;
    right: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: var(--text-2);
  }

  .close::before {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--fill);
  }

  .close svg {
    position: relative;
  }

  h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    line-height: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .body {
    flex: 1 1 auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    padding: 8px var(--gutter) 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .body > :global(*) {
    flex-shrink: 0;
  }

  .footer {
    flex: none;
    padding: 8px var(--gutter) calc(12px + var(--safe-bottom));
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>

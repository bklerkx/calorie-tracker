<script lang="ts">
  // Regel die je naar links veegt om te verwijderen (V5). Tikken = bewerken.
  import type { Snippet } from 'svelte';

  let { ondelete, ontap, children }: { ondelete: () => void; ontap: () => void; children: Snippet } = $props();

  const ACTION = 88;
  let el: HTMLElement;
  let x = $state(0);
  let open = $state(false);
  let dragging = $state(false);
  let start: { x: number; y: number; base: number } | null = null;
  let axis: 'x' | 'y' | null = null;
  // Na een veeg vuurt de browser nog een click af; die mag niet als tik tellen.
  let suppressClick = false;

  function down(e: PointerEvent) {
    start = { x: e.clientX, y: e.clientY, base: open ? -ACTION : 0 };
    axis = null;
  }

  function move(e: PointerEvent) {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis === 'x') {
        dragging = true;
        el.setPointerCapture(e.pointerId);
      }
    }
    if (axis === 'x') x = Math.min(0, start.base + dx);
  }

  function up() {
    if (!start) return;
    const wasDrag = axis === 'x';
    start = null;
    dragging = false;
    if (!wasDrag) return;
    suppressClick = true;
    setTimeout(() => (suppressClick = false), 400);
    const width = el.offsetWidth;
    if (-x > width * 0.55) {
      x = -width;
      setTimeout(ondelete, 150);
    } else if (-x > ACTION / 2) {
      x = -ACTION;
      open = true;
    } else {
      x = 0;
      open = false;
    }
  }

  function click() {
    if (dragging || suppressClick) return;
    if (open) {
      x = 0;
      open = false;
      return;
    }
    ontap();
  }
</script>

<div class="wrap" class:revealed={x < 0}>
  <button class="delete" aria-label="Verwijderen" tabindex={open ? 0 : -1} onclick={ondelete}>Verwijder</button>
  <div
    bind:this={el}
    class="row"
    class:animate={!dragging}
    style:transform="translateX({x}px)"
    role="button"
    tabindex="0"
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
    onclick={click}
    onkeydown={(e) => e.key === 'Enter' && ontap()}
  >
    {@render children()}
  </div>
</div>

<style>
  .wrap {
    position: relative;
    overflow: hidden;
  }

  .delete {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 14px;
    background: var(--danger);
    color: #fff;
    font-size: 15px;
    font-weight: 500;
  }

  .wrap:not(.revealed) .delete {
    visibility: hidden;
  }

  .row {
    position: relative;
    background: var(--card);
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
  }

  .row.animate {
    transition: transform 0.2s ease;
  }
</style>

<script lang="ts">
  // Eiwit, koolhydraten, vet en vezels met hun vaste kleur (V2).
  import { formatInt } from '../lib/format';
  import type { Nutrients } from '../lib/types';

  let { values }: { values: Nutrients } = $props();

  const items = $derived([
    { key: 'eiwit', label: 'Eiwit', v: values.eiwit },
    { key: 'kh', label: 'Koolh.', v: values.kh },
    { key: 'vet', label: 'Vet', v: values.vet },
    { key: 'vezels', label: 'Vezels', v: values.vezels },
  ]);
</script>

<div class="macros">
  {#each items as it (it.key)}
    <div class="m">
      <span class="v num">{it.v === undefined || !Number.isFinite(it.v) ? '–' : formatInt(it.v)}<small>g</small></span>
      <span class="l"><i style:background="var(--c-{it.key})"></i>{it.label}</span>
    </div>
  {/each}
</div>

<style>
  .macros {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
  }

  .m {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .v {
    font-size: 17px;
    font-weight: 600;
  }

  small {
    margin-left: 1px;
    font-size: 13px;
    font-weight: 400;
    color: var(--text-2);
  }

  .l {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-2);
  }

  i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
</style>

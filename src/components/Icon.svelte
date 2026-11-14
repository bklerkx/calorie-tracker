<script lang="ts">
  type Name = 'vandaag' | 'week' | 'scan' | 'producten' | 'instellingen' | 'plus' | 'search' | 'edit';
  let { name, size = 26 }: { name: Name; size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.9"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === 'vandaag'}
    <circle cx="12" cy="12" r="8.5" opacity="0.35" />
    <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5 8.5 8.5 0 0 1-6 8.13" />
  {:else if name === 'week'}
    <path d="M5 20v-6M10 20V9M15 20v-8M20 20V5" />
  {:else if name === 'scan'}
    <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
    <path d="M8 9v6M11 9v6M14 9v6M17 9v6" stroke-width="1.6" />
  {:else if name === 'producten'}
    <path d="M8 6h12M8 12h12M8 18h12" />
    <circle cx="4" cy="6" r="0.6" fill="currentColor" />
    <circle cx="4" cy="12" r="0.6" fill="currentColor" />
    <circle cx="4" cy="18" r="0.6" fill="currentColor" />
  {:else if name === 'instellingen'}
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  {:else if name === 'plus'}
    <path d="M12 5v14M5 12h14" />
  {:else if name === 'search'}
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  {:else if name === 'edit'}
    <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
  {/if}
</svg>

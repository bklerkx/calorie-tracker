<script lang="ts">
  import Screen from '../components/Screen.svelte';
  import Icon from '../components/Icon.svelte';
  import { startScanner, type Scanner } from '../lib/scanner';
  import { lookupBarcode } from '../lib/lookup';
  import { openSheet, sheets, showToast } from '../lib/ui.svelte';

  let video: HTMLVideoElement;
  let status = $state<'idle' | 'starting' | 'scanning' | 'denied' | 'error'>('idle');
  let busy = $state(false);
  let visible = $state(!document.hidden);
  let scanner: Scanner | null = null;
  let generation = 0;
  // Na toevoegen ligt het product vaak nog voor de camera. Negeer die code zolang hij in beeld
  // blijft; pas als hij 2 s niet gezien is, telt hij weer (bijv. een tweede exemplaar).
  let lastCode = '';
  let lastSeenAt = 0;
  function ignore(code: string): boolean {
    if (code !== lastCode) return false;
    const now = Date.now();
    const stillInView = now - lastSeenAt < 2000;
    lastSeenAt = now;
    return stillInView;
  }

  const active = $derived(visible && !sheets.open && !busy);

  $effect(() => {
    const onVis = () => (visible = !document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  });

  $effect(() => {
    if (!active) return;
    const gen = ++generation;
    status = 'starting';
    lastSeenAt = Date.now();
    startScanner(video, onCode, ignore)
      .then((s) => {
        if (gen !== generation) s.stop();
        else {
          scanner = s;
          status = 'scanning';
        }
      })
      .catch((e: Error) => {
        if (gen !== generation) return;
        status = e?.name === 'NotAllowedError' || e?.name === 'SecurityError' ? 'denied' : 'error';
      });
    return () => {
      generation++;
      scanner?.stop();
      scanner = null;
    };
  });

  const messages = {
    'not-found': 'Niet gevonden',
    incomplete: 'Gegevens onvolledig',
    offline: 'Geen verbinding',
    'rate-limited': 'Te veel aanvragen, later opnieuw',
    error: 'Opzoeken mislukt',
  };

  async function onCode(code: string) {
    lastCode = code;
    busy = true;
    try {
      const r = await lookupBarcode(code);
      if (r.kind === 'product') openSheet({ kind: 'portion', product: r.product });
      else {
        showToast({ text: messages[r.reason] });
        openSheet({ kind: 'product', draft: r.draft, logAfterSave: true });
      }
    } finally {
      busy = false;
    }
  }
</script>

<Screen title="Scan">
  <section class="viewfinder" aria-label="Camera">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video bind:this={video} playsinline muted class:on={status === 'scanning'}></video>
    {#if status === 'scanning' && !busy}
      <div class="frame"></div>
    {:else}
      <div class="overlay">
        {#if busy}
          <span class="spinner"></span>
        {:else if status === 'denied'}
          <Icon name="scan" size={48} />
          <span>Geen cameratoegang</span>
        {:else if status === 'error'}
          <Icon name="scan" size={48} />
          <span>Camera niet beschikbaar</span>
        {:else}
          <span class="spinner"></span>
        {/if}
      </div>
    {/if}
  </section>

  <div class="buttons">
    <button class="card btn" onclick={() => openSheet({ kind: 'search' })}><Icon name="search" size={22} />Zoeken</button>
    <button class="card btn" onclick={() => openSheet({ kind: 'product', draft: {}, logAfterSave: true })}>
      <Icon name="edit" size={22} />Handmatig
    </button>
    <button class="card btn" onclick={() => openSheet({ kind: 'quick' })}><Icon name="plus" size={22} />Snel kcal</button>
  </div>
</Screen>

<style>
  .viewfinder {
    position: relative;
    overflow: hidden;
    aspect-ratio: 3 / 4;
    max-height: 56dvh;
    width: 100%;
    border-radius: var(--radius);
    background: #000;
  }

  video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.2s;
  }

  video.on {
    opacity: 1;
  }

  .frame {
    position: absolute;
    left: 12%;
    right: 12%;
    top: 38%;
    bottom: 38%;
    border: 3px solid rgba(255, 255, 255, 0.9);
    border-radius: 12px;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 15px;
    background: rgba(0, 0, 0, 0.4);
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid rgba(255, 255, 255, 0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 64px;
    color: var(--accent);
    font-size: 15px;
    font-weight: 500;
  }
</style>

<script lang="ts">
  import Screen from '../components/Screen.svelte';

  let persisted = $state<boolean | null>(null);
  $effect(() => {
    navigator.storage?.persisted?.().then((p) => (persisted = p)).catch(() => (persisted = false));
  });

  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
</script>

<Screen title="Instellingen">
  <section>
    <h2 class="section-title">Doelen</h2>
    <div class="card"><div class="empty">Volgt in fase 3</div></div>
  </section>

  <section>
    <h2 class="section-title">Over</h2>
    <div class="card list">
      <div class="row"><span>Versie</span><span class="value num">{__APP_VERSION__}</span></div>
      <div class="row"><span>Build</span><span class="value num">{__BUILD_DATE__}</span></div>
      <div class="row"><span>Beginscherm</span><span class="value">{standalone ? 'Ja' : 'Nee'}</span></div>
      <div class="row">
        <span>Opslag vast</span>
        <span class="value">{persisted === null ? '…' : persisted ? 'Ja' : 'Nee'}</span>
      </div>
    </div>
  </section>
</Screen>

<style>
  .section-title {
    margin: 0 0 6px var(--gutter);
    font-size: 13px;
    font-weight: 400;
    text-transform: uppercase;
    color: var(--text-2);
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    margin-left: var(--gutter);
    padding-right: var(--gutter);
  }

  .row + .row {
    border-top: 0.5px solid var(--separator);
  }

  .value {
    color: var(--text-2);
  }
</style>

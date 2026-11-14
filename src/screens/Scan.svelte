<script lang="ts">
  import Screen from '../components/Screen.svelte';
  import Icon from '../components/Icon.svelte';
</script>

<Screen title="Scan">
  <section class="viewfinder" aria-label="Camera">
    <Icon name="scan" size={64} />
    <span>Camera volgt in fase 2</span>
  </section>

  <div class="buttons">
    <button class="card btn" disabled><Icon name="search" size={22} /> Zoeken</button>
    <button class="card btn" disabled><Icon name="edit" size={22} /> Handmatig</button>
  </div>
</Screen>

<style>
  .viewfinder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    aspect-ratio: 3 / 4;
    max-height: 55dvh;
    border-radius: var(--radius);
    background: #000;
    color: rgba(255, 255, 255, 0.5);
    font-size: 15px;
  }

  .buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 52px;
    color: var(--accent);
    font-weight: 500;
  }

  .btn:disabled {
    color: var(--text-3);
  }
</style>

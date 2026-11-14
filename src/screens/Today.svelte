<script lang="ts">
  import Screen from '../components/Screen.svelte';
  import Icon from '../components/Icon.svelte';
  import { MEALS } from '../lib/meals';
  import { formatInt } from '../lib/format';
  import { navigate } from '../lib/router.svelte';
</script>

<Screen title="Vandaag">
  <section class="card total">
    <span class="big num">{formatInt(0)}</span>
    <span class="unit">kcal</span>
  </section>

  <div class="empty-day">
    Nog niets gegeten · <button class="link-btn" onclick={() => navigate('scan')}>Scan</button>
  </div>

  {#each MEALS as meal (meal.id)}
    <section class="card meal">
      <header>
        <h2>{meal.label}</h2>
        <button class="add" aria-label="{meal.label} toevoegen" onclick={() => navigate('scan')}>
          <Icon name="plus" size={20} />
        </button>
      </header>
    </section>
  {/each}
</Screen>

<style>
  .total {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 6px;
    padding: 28px var(--gutter);
  }

  .big {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .unit {
    color: var(--text-2);
    font-size: 17px;
  }

  .empty-day {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-2);
    margin: -8px 0;
  }

  .meal header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: var(--gutter);
    min-height: 52px;
  }

  h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
  }

  .add {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    color: var(--text-3);
  }
</style>

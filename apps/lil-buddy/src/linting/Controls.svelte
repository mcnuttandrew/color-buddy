<script lang="ts">
  import { buttonStyle } from "../lib/styles";

  import store from "../stores/store";

  import Tooltip from "../components/Tooltip.svelte";
  import Nav from "../components/Nav.svelte";
</script>

<Tooltip positionAlongRightEdge={true}>
  <div slot="content">
    <div>
      <div>Engine</div>
      <Nav
        tabs={["openai", "anthropic", "google"]}
        isTabSelected={(x) => x === $store.engine}
        selectTab={(x) => store.setEngine(x)}
      />
    </div>
  </div>
  <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
    Controls ⚙️
  </button>
</Tooltip>

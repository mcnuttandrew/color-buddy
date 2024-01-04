<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { colorFromString } from "../../lib/Color";
  import { suggestFix } from "../../lib/api-calls";
  import PalPreview from "../../components/PalPreview.svelte";

  import { buttonStyle, AIButtonStyle } from "../../lib/styles";
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  export let check: {
    name: string;
    check: boolean;
    message: string;
    taskTypes: string[];
  };
  $: suggestion = false as false | { background: string; colors: string[] };
  $: colorSpace = $colorStore.currentPal.colors[0]?.spaceName || "lab";

  function proposeFix() {
    requestState = "loading";
    suggestFix($colorStore.currentPal, check.message, $colorStore.engine)
      .then((x) => {
        if (x.length === 0) {
          requestState = "failed";
          return;
        }
        suggestion = x[0];
        requestState = "loaded";
      })
      .catch((e) => {
        console.log(e);
        requestState = "failed";
      });
  }
  $: tempPal = suggestion && {
    colors: suggestion.colors.map((x) => colorFromString(x, colorSpace)),
    background: colorFromString(suggestion.background, colorSpace),
    name: $colorStore.currentPal.name,
  };
</script>

<Tooltip>
  <div slot="content" let:onClick>
    <button class={buttonStyle}>Ignore for this palette</button>
    <button class={buttonStyle}>Ignore for a bit</button>
    <button class={buttonStyle}>This is too restrictive</button>
    <button class={AIButtonStyle} on:click={() => proposeFix()}>
      Try to fix
    </button>
    {#if requestState === "loading"}
      <div>Loading...</div>
    {:else if requestState === "failed"}
      <div>Failed to generate suggestions</div>
    {:else if requestState === "loaded" && tempPal}
      <div class="flex flex-col">
        <PalPreview pal={tempPal} />
        <div class="flex justify-between">
          <button
            class={buttonStyle}
            on:click={() => {
              colorStore.setCurrentPal(tempPal);
              focusStore.clearColors();
              requestState = "idle";
              suggestion = false;
              onClick();
            }}
          >
            Use
          </button>
          <button
            class={buttonStyle}
            on:click={() => {
              requestState = "idle";
            }}
          >
            Reject
          </button>
        </div>
      </div>
    {/if}
  </div>
  <button slot="target" let:toggle class={` ml-4`} on:click={toggle}>🛠️</button>
</Tooltip>

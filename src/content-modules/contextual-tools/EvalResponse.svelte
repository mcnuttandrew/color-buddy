<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import configStore from "../../stores/config-store";
  import { ColorLint } from "../../lib/lints/ColorLint";
  import type { Palette } from "../../stores/color-store";
  import PalDiff from "../../components/PalDiff.svelte";

  import { buttonStyle } from "../../lib/styles";
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  export let check: ColorLint<any, any>;

  $: suggestion = false as false | Palette;

  function proposeFix() {
    requestState = "loading";
    let hasRetried = false;
    const getFix = () =>
      check.suggestFix($configStore.engine).then((x) => {
        suggestion = x;
        requestState = "loaded";
      });

    getFix().catch((e) => {
      console.log(e);
      if (!hasRetried) {
        requestState = "failed";
      } else {
        hasRetried = true;
        return getFix();
      }
    });
  }
  $: evalConfig = $colorStore.currentPal.evalConfig;
</script>

<Tooltip positionAlongRightEdge={true}>
  <div slot="content" let:onClick>
    <button
      class={buttonStyle}
      on:click={() => {
        colorStore.setCurrentPalEvalConfig({
          ...evalConfig,
          [check.name]: { ignore: true },
        });
      }}
    >
      Ignore for this palette
    </button>
    {#if check.hasParam}
      <button class={buttonStyle}>This is too restrictive</button>
    {/if}
    <button class={buttonStyle} on:click={() => proposeFix()}>
      Try to fix
    </button>
    {#if requestState === "loading"}
      <div>Loading...</div>
    {:else if requestState === "failed"}
      <div>Failed to generate suggestions</div>
    {:else if requestState === "loaded" && suggestion}
      <div class="flex flex-col">
        <PalDiff beforePal={$colorStore.currentPal} afterPal={suggestion} />
        <div class="flex justify-between">
          <button
            class={buttonStyle}
            on:click={() => {
              colorStore.setCurrentPal(suggestion);
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

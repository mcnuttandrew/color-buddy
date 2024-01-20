<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import colorStore from "../../stores/color-store";
  import configStore from "../../stores/config-store";
  import { Color } from "../../lib/Color";
  import { suggestPal } from "../../lib/api-calls";
  import type { Palette } from "../../stores/color-store";
  import PalPreview from "../../components/PalPreview.svelte";
  import { buttonStyle, AIButtonStyle } from "../../lib/styles";

  $: colorSpace = $colorStore.currentPal.colorSpace;
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  let newPal: Palette | undefined = undefined;
  let palPrompt: string = "";

  function makeRequest() {
    const allowedStates = new Set(["idle", "loaded", "failed"]);
    if (!allowedStates.has(requestState)) {
      return;
    }
    requestState = "loading";
    suggestPal(palPrompt, $configStore.engine)
      .then((suggestions) => {
        if (suggestions.length === 0) {
          requestState = "idle";
          return;
        }
        const suggestion = suggestions[0];
        newPal = {
          colors: suggestion.colors.map((x) =>
            Color.colorFromString(x, colorSpace as any)
          ),
          background: Color.colorFromString(
            suggestion.background,
            colorSpace as any
          ),
          name: palPrompt,
          type: "categorical",
          evalConfig: {},
          colorSpace: colorSpace as any,
        };

        requestState = "loaded";
      })
      .catch((e) => {
        console.log(e);
        requestState = "failed";
      });
  }
</script>

<Tooltip>
  <span slot="target" let:toggle>
    <button class={AIButtonStyle} on:click={toggle}>Pal from prompt</button>
  </span>
  <div slot="content" let:onClick>
    <div class="flex flex-col">
      <label for="pal-prompt">
        <div>Name of new Palette</div>
        <div class="text-sm italic">
          (e.g. "Color Wheel Basics" or "Mystic River")
        </div>
      </label>
      {#if requestState === "loaded" && newPal}
        <PalPreview pal={newPal} />
        <div class="flex justify-between">
          <button
            class={buttonStyle}
            on:click={() => {
              if (!newPal) return;
              colorStore.createNewPal(newPal);
              requestState = "idle";
              palPrompt = "";
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
      {:else}
        <form on:submit|preventDefault={makeRequest}>
          <input bind:value={palPrompt} id="pal-prompt" />
          <button
            class:pointer-events-none={requestState === "loading"}
            class={buttonStyle}
          >
            {requestState === "loading" ? "loading..." : "Submit"}
          </button>
        </form>
        {#if requestState === "failed"}
          <div class="text-red-500">No suggestions found, please try again</div>
        {/if}
      {/if}
    </div>
  </div>
</Tooltip>

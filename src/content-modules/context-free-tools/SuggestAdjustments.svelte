<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import colorStore from "../../stores/color-store";
  import { colorFromString } from "../../lib/Color";
  import { suggestAdjustments } from "../../lib/api-calls";
  import type { Palette } from "../../stores/color-store";
  import PalPreview from "../../components/PalPreview.svelte";
  import { buttonStyle } from "../../lib/styles";

  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  let newPal: Palette = {
    colors: [],
    background: colorFromString("#000000", "lab"),
    name: "blank",
  };
  let palPrompt: string = "";
</script>

<Tooltip>
  <span slot="target" let:toggle>
    <button class={buttonStyle} on:click={toggle}>
      Modify Current Pal with AI
    </button>
  </span>
  <div slot="content" let:onClick>
    <div class="flex flex-col">
      <label for="pal-prompt">
        <div>Command</div>
        <div class="text-sm italic">
          (e.g. "Make it more pastel" or "Make it scarier")
        </div>
      </label>
      {#if requestState === "loaded"}
        <PalPreview pal={newPal} />
        <div class="flex justify-between">
          <button
            class={buttonStyle}
            on:click={() => {
              colorStore.setCurrentPalColors(newPal.colors);
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
        <input bind:value={palPrompt} id="pal-prompt" />
        <button
          class={buttonStyle}
          class:pointer-events-none={requestState === "loading"}
          on:click={() => {
            if (requestState === "loading") return;
            requestState = "loading";
            suggestAdjustments(
              palPrompt,
              $colorStore.currentPal,
              $colorStore.engine
            )
              .then((suggestions) => {
                if (suggestions.length === 0) {
                  //   alert("No suggestions found");
                  requestState = "idle";
                  return;
                }
                const suggestion = suggestions[0];
                newPal.colors = suggestion.colors.map((x) =>
                  colorFromString(x, "lab")
                );
                newPal.background = colorFromString(
                  suggestion.background,
                  "lab"
                );
                newPal.name = $colorStore.currentPal.name;

                requestState = "loaded";
              })
              .catch((e) => {
                console.log(e);
                requestState = "failed";
              });
          }}
        >
          {#if requestState === "idle"}
            Submit
          {:else}
            loading...
          {/if}
        </button>
        {#if requestState === "failed"}
          <div class="text-red-500">
            Failed to get suggestions, please try again
          </div>
        {/if}
      {/if}
    </div>
  </div>
</Tooltip>

<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { colorFromString } from "../../lib/Color";
  import { suggestContextualAdjustments } from "../../lib/api-calls";
  import PalPreview from "../../components/PalPreview.svelte";

  let requestState: "idle" | "loading" | "loaded" = "idle";
  $: colors = $colorStore.currentPal.colors;
  $: selectedColors = $focusStore.focusedColors.map((x) => colors[x].toHex());
  let suggestedColors: string[] = [];
  let palPrompt: string = "";

  function toPal(colors: string[]) {
    return {
      colors: colors.map((x) => colorFromString(x, "lab")),
      name: "mods",
      background: $colorStore.currentPal.background,
    };
  }
</script>

{#if $focusStore.focusedColors.length > 0}
  <Tooltip>
    <span slot="target" let:toggle>
      <button class={"underline"} on:click={toggle}>Modify with text</button>
    </span>
    <div slot="content" let:onClick>
      <div class="flex flex-col w-72">
        <label for="pal-prompt">
          <div>Command</div>
          <div class="text-sm italic">(e.g. "Make them groovier")</div>
        </label>
        {#if requestState === "loaded"}
          <div>
            Old
            <PalPreview pal={toPal(selectedColors)} />
            New
            <PalPreview pal={toPal(suggestedColors)} />
          </div>
          <div class="flex justify-between">
            <button
              class="underline"
              on:click={() => {
                const newColors = colors.map((x) => {
                  const idx = selectedColors.indexOf(x.toHex());
                  if (idx === -1) return x;
                  return colorFromString(suggestedColors[idx], "lab");
                });
                colorStore.setCurrentPalColors(newColors);
                onClick();
                requestState = "idle";
                palPrompt = "";
              }}
            >
              Use
            </button>
            <button
              class="underline"
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
            class:underline={requestState === "idle"}
            on:click={() => {
              if (requestState === "loading") return;
              requestState = "loading";
              suggestContextualAdjustments(
                palPrompt,
                {
                  colors: selectedColors.map((x) => colorFromString(x, "lab")),
                  background: $colorStore.currentPal.background,
                  name: $colorStore.currentPal.name,
                },
                $colorStore.engine
              ).then((suggestions) => {
                if (suggestions.length === 0) {
                  requestState = "idle";
                  return;
                }
                const suggestion = suggestions[0];
                suggestedColors = suggestion.colors;
                requestState = "loaded";
              });
            }}
          >
            {#if requestState === "idle"}
              Submit
            {:else}
              loading...
            {/if}
          </button>
        {/if}
      </div>
    </div>
  </Tooltip>
{/if}

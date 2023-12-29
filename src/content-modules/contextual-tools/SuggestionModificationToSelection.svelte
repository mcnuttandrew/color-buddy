<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { colorFromString } from "../../lib/Color";
  import { suggestContextualAdjustments } from "../../lib/api-calls";
  import { buttonStyle, AIButtonStyle } from "../../lib/styles";
  import PalPreview from "../../components/PalPreview.svelte";

  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  $: colorSpace = $colorStore.currentPal.colors[0]?.spaceName || "lab";
  $: colors = $colorStore.currentPal.colors;
  $: selectedColors = $focusStore.focusedColors
    .map((x) => colors[x]?.toHex())
    .filter((x) => x !== undefined);
  let suggestedColors: string[] = [];
  let palPrompt: string = "";

  function toPal(colors: string[]) {
    return {
      colors: colors.map((x) => colorFromString(x, colorSpace)),
      name: "mods",
      background: $colorStore.currentPal.background,
    };
  }
</script>

<Tooltip>
  <span slot="target" let:toggle>
    <button class={AIButtonStyle} on:click={toggle}>Modify with AI</button>
  </span>
  <div slot="content" let:onClick>
    <div class="flex flex-col w-72">
      <label for="pal-prompt">
        <div>Change these points</div>
        <div class="text-sm italic">(e.g. "Make them groovier")</div>
      </label>
      {#if requestState === "loaded"}
        <div>
          Old
          <PalPreview
            pal={selectedColors.length
              ? toPal(selectedColors)
              : $colorStore.currentPal}
          />
          New
          <PalPreview pal={toPal(suggestedColors)} />
        </div>
        <div class="flex justify-between">
          <button
            class={buttonStyle}
            on:click={() => {
              let newColors = colors;
              if (selectedColors.length) {
                let usedSuggestions = new Set([]);
                newColors = colors.map((x, jdx) => {
                  const idx = selectedColors.indexOf(x.toHex());
                  if (idx === -1) return x;
                  usedSuggestions.add(idx);
                  return colorFromString(suggestedColors[idx], colorSpace);
                });
                const unusedSuggestions = suggestedColors.filter(
                  (_, idx) => !usedSuggestions.has(idx)
                );
                newColors = newColors.concat(
                  unusedSuggestions.map((x) => colorFromString(x, colorSpace))
                );
              } else {
                newColors = suggestedColors.map((x) =>
                  colorFromString(x, colorSpace)
                );
              }
              colorStore.setCurrentPalColors(newColors);
              onClick();
              requestState = "idle";
              palPrompt = "";
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
            suggestContextualAdjustments(
              palPrompt,
              selectedColors.length
                ? {
                    colors: selectedColors.map((x) =>
                      colorFromString(x, colorSpace)
                    ),
                    background: $colorStore.currentPal.background,
                    name: $colorStore.currentPal.name,
                  }
                : $colorStore.currentPal,
              $colorStore.engine
            )
              .then((suggestions) => {
                if (suggestions.length === 0) {
                  requestState = "idle";
                  return;
                }
                const suggestion = suggestions[0];
                suggestedColors = suggestion.colors;
                requestState = "loaded";
              })
              .catch((e) => {
                console.log(e);
                requestState = "idle";
              });
          }}
        >
          {#if requestState === "idle" || requestState === "failed"}
            Submit
          {:else}
            loading...
          {/if}
        </button>
      {/if}
      {#if requestState === "failed"}
        <div class="text-red-500">No suggestions found, please try again</div>
      {/if}
    </div>
  </div>
</Tooltip>

<script lang="ts">
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import configStore from "../../stores/config-store";
  import { Color } from "../../lib/Color";
  import { suggestContextualAdjustments } from "../../lib/api-calls";
  import { buttonStyle } from "../../lib/styles";
  import PalDiff from "../../components/PalDiff.svelte";

  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  $: colorSpace = $colorStore.currentPal.colorSpace;
  $: colors = $colorStore.currentPal.colors;
  $: selectedColors = $focusStore.focusedColors
    .map((x) => colors[x]?.toHex())
    .filter((x) => x !== undefined) as string[];
  let suggestedColors: string[] = [];
  let palPrompt: string = "";

  function toPal(colors: string[]) {
    return {
      colors: colors.map((x) => Color.colorFromString(x, colorSpace)),
      name: "mods",
      background: $colorStore.currentPal.background,
      type: $colorStore.currentPal.type,
      evalConfig: {},
      colorSpace,
    };
  }

  function makeRequest() {
    requestState = "loading";
    const pal = selectedColors.length
      ? {
          ...$colorStore.currentPal,
          colors: selectedColors.map((x) =>
            Color.colorFromString(x, colorSpace)
          ),
        }
      : $colorStore.currentPal;
    suggestContextualAdjustments(palPrompt, pal, $configStore.engine)
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
  }

  function useSuggestion() {
    let newColors = colors;
    if (selectedColors.length) {
      let usedSuggestions = new Set<number>([]);
      newColors = colors.map((x, jdx) => {
        const idx = selectedColors.indexOf(x.toHex());
        if (idx === -1) return x;
        usedSuggestions.add(idx);
        return Color.colorFromString(suggestedColors[idx], colorSpace);
      });
      const unusedSuggestions = suggestedColors.filter(
        (_, idx) => !usedSuggestions.has(idx)
      );
      newColors = newColors.concat(
        unusedSuggestions.map((x) => Color.colorFromString(x, colorSpace))
      );
    } else {
      newColors = suggestedColors.map((x) =>
        Color.colorFromString(x, colorSpace)
      );
    }
    colorStore.setCurrentPalColors(newColors);
    requestState = "idle";
    palPrompt = "";
  }
</script>

<div>
  <div class="flex flex-col w-72">
    <label for="pal-prompt" class="italic text-sm">
      <div>Change these points</div>
    </label>
    {#if requestState === "loaded"}
      <div>
        <PalDiff
          beforePal={selectedColors.length
            ? toPal(selectedColors)
            : $colorStore.currentPal}
          afterPal={toPal(suggestedColors)}
        />
      </div>
      <div class="flex justify-between">
        <button class={buttonStyle} on:click={useSuggestion}>Use</button>
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
      <form on:submit|preventDefault={makeRequest} class="flex flex-col">
        <input
          bind:value={palPrompt}
          id="pal-prompt"
          class="indent-2 text-sm leading-6"
          placeholder="e.g. 'Make them groovier'"
        />
        <button
          class={buttonStyle}
          class:pointer-events-none={requestState === "loading"}
        >
          {requestState === "loading" ? "loading..." : "Submit"}
        </button>
      </form>
      {#if !selectedColors.length}
        <span class="italic text-sm">
          (Current scope is all colors, you can select a group of colors to
          limit the scope)
        </span>
      {/if}
    {/if}
    {#if requestState === "failed"}
      <div class="text-red-500">No suggestions found, please try again</div>
    {/if}
  </div>
</div>
<!-- </Tooltip> -->

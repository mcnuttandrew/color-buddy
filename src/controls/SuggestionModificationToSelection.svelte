<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import configStore from "../stores/config-store";
  import { Color } from "../lib/Color";
  import { suggestContextualAdjustments } from "../lib/api-calls";
  import { buttonStyle } from "../lib/styles";
  import PalDiff from "../components/PalDiff.svelte";
  import { toPal } from "../lib/utils";

  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal.colorSpace;
  $: colors = currentPal.colors;
  $: selectedColors = $focusStore.focusedColors
    .map((x) => colors[x]?.toHex())
    .filter((x) => x !== undefined) as string[];
  let suggestedColorSets: string[][] = [];
  let palPrompt: string = "";

  function makeRequest() {
    requestState = "loading";
    const pal = selectedColors.length
      ? {
          ...currentPal,
          colors: selectedColors.map((x) =>
            Color.colorFromString(x, colorSpace)
          ),
        }
      : currentPal;
    suggestContextualAdjustments(palPrompt, pal, $configStore.engine)
      .then((suggestions) => {
        if (suggestions.length === 0) {
          requestState = "idle";
          return;
        }
        suggestedColorSets = suggestions
          .map((x) => {
            try {
              return x.colors;
            } catch (e) {
              console.log(e);
              return undefined;
            }
          })
          .filter((x) => x !== undefined) as string[][];
        requestState = "loaded";
      })
      .catch((e) => {
        console.log(e);
        requestState = "idle";
      });
  }

  function useSuggestion(jdx: number) {
    const suggestedColors = suggestedColorSets[jdx];
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
      <div>Change these points with AI</div>
    </label>
    {#if requestState === "loaded"}
      {#each suggestedColorSets as suggestedColors, idx}
        <div>
          <PalDiff
            beforePal={selectedColors.length
              ? toPal(selectedColors, currentPal, colorSpace)
              : currentPal}
            afterPal={toPal(suggestedColors, currentPal, colorSpace)}
          />
        </div>
        <div class="flex justify-between">
          <button class={buttonStyle} on:click={() => useSuggestion(idx)}>
            Use
          </button>
          <button
            class={buttonStyle}
            on:click={() => {
              suggestedColorSets = suggestedColorSets.filter(
                (_, jdx) => jdx !== idx
              );
              if (suggestedColorSets.length === 0) {
                requestState = "idle";
              }
            }}
          >
            Reject
          </button>
        </div>
      {/each}
    {:else}
      <form on:submit|preventDefault={makeRequest} class="flex flex-col pr-2">
        <textarea
          bind:value={palPrompt}
          on:keypress={(e) => {
            if (e.key === "Enter") {
              // @ts-ignore
              e.target.blur();
              makeRequest();
            }
          }}
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

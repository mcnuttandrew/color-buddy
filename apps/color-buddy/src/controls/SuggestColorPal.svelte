<script lang="ts">
  import { Color, wrapColor } from "@color-buddy/palette";
  import type { Palette } from "@color-buddy/palette";

  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import { suggestPal } from "../lib/api-calls";
  import PalPreview from "../components/PalPreview.svelte";
  import { buttonStyle } from "../lib/styles";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal ? currentPal.colorSpace : "lab";
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  let newPals: Palette[] = [];
  let palPrompt: string = "";

  function suggestionToPal(suggestion: {
    colors: string[];
    background: string;
  }): Palette {
    return {
      colors: suggestion.colors.map((x) =>
        wrapColor(Color.colorFromString(x, colorSpace as any))
      ),
      background: Color.colorFromString(
        suggestion.background,
        colorSpace as any
      ),
      name: palPrompt,
      type: "categorical",
      evalConfig: {},
      colorSpace: colorSpace as any,
      tags: [],
    };
  }

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
        newPals = suggestions
          .map((x) => {
            try {
              return suggestionToPal(x);
            } catch (e) {
              console.log(e);
              return undefined;
            }
          })
          .filter((x) => x !== undefined) as Palette[];

        requestState = "loaded";
      })
      .catch((e) => {
        console.log(e);
        requestState = "failed";
      });
  }
</script>

<div class="flex flex-col">
  <label for="pal-prompt">
    <div>Use the name of a new palette to generate a new palette</div>
  </label>
  {#if requestState === "loaded"}
    {#each newPals as pal, idx}
      <PalPreview {pal} />
      <div class="flex justify-between">
        <button
          class={buttonStyle}
          on:click={() => {
            if (!pal) return;
            colorStore.createNewPal(pal);
            requestState = "idle";
            palPrompt = "";
          }}
        >
          Use
        </button>
        <button
          class={buttonStyle}
          on:click={() => {
            newPals = newPals.filter((_, i) => i !== idx);
            if (newPals.length === 0) {
              requestState = "idle";
            }
          }}
        >
          Reject
        </button>
      </div>
    {/each}
  {:else}
    <form on:submit|preventDefault={makeRequest} class="flex">
      <input
        bind:value={palPrompt}
        id="pal-prompt"
        class="leading-6 text-sm w-full"
        placeholder="(e.g. 'Color Wheel Basics' or 'Mystic River')"
      />
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

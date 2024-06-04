<script lang="ts">
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import { Color, wrapInBlankSemantics } from "@color-buddy/palette-check";
  import { suggestAdditionsToPalette } from "../lib/api-calls";
  import ColorButton from "../components/ColorButton.svelte";
  import AutocompleteOrSearch from "../components/AutocompleteOrSearch.svelte";
  import { colorCentersFromStoneHeer } from "@color-buddy/color-lists";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: colorSpace = currentPal.colorSpace;

  let interpretations = [] as string[];
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";

  function getColorForSearch(searchedString: string) {
    const allowedStates = new Set(["idle", "loaded", "failed"]);
    if (!allowedStates.has(requestState)) {
      return;
    }
    if (searchedString === "") {
      return;
    }
    interpretations = [];
    requestState = "loading";
    suggestAdditionsToPalette(currentPal, $configStore.engine, searchedString)
      .then((x) => {
        console.log("ai suggestions", x);
        x.forEach((color) => {
          if (!interpretations.includes(color)) {
            interpretations.push(color);
          }
        });
        requestState = "loaded";
      })
      .catch((e) => {
        console.log(e);
        requestState = "failed";
      });
  }
</script>

<div class="flex w-full justify-between">
  <div class="font-bold">Add Color</div>
</div>
<section>
  <div class="flex w-full justify-between items-center">
    <AutocompleteOrSearch
      setValue={(x) => {
        const newColor = wrapInBlankSemantics(
          Color.colorFromString(colorCentersFromStoneHeer[x], colorSpace)
        );
        const newColors = [...colors, newColor];
        colorStore.setCurrentPalColors(newColors);
      }}
      optionsAreColors={true}
      searchOptions={Object.keys(colorCentersFromStoneHeer)}
      placeholder="e.g. purple or red"
      runSearch={(x) => {
        getColorForSearch(x);
      }}
    />
  </div>
  {#if requestState === "loading"}
    <div>loading...</div>
  {/if}
  {#if requestState === "failed"}
    <div class="text-sm text-red-800">
      Error try again or modify your color term
    </div>
  {/if}
  {#if requestState === "loaded"}
    <div class="flex flex-wrap">
      {#each interpretations as color}
        <ColorButton
          {color}
          clickColor={() => {
            const newColor = wrapInBlankSemantics(
              Color.colorFromString(color, colorSpace)
            );
            const newColors = [...colors, newColor];
            colorStore.setCurrentPalColors(newColors);
            interpretations = interpretations.filter((x) => x !== color);
          }}
          removeColor={() => {
            interpretations = interpretations.filter((x) => x !== color);
          }}
        />
      {/each}
    </div>
  {/if}
</section>

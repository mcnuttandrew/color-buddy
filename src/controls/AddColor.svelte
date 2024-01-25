<script lang="ts">
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import { buttonStyle } from "../lib/styles";
  import { Color } from "../lib/Color";
  import { suggestAdditionsToPalette } from "../lib/api-calls";
  import ColorButton from "../components/ColorButton.svelte";
  import Tooltip from "../components/Tooltip.svelte";

  const randChan = () => Math.floor(Math.random() * 255);
  function componentToHex(c: number): string {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  const randColor = () =>
    `#${[randChan(), randChan(), randChan()]
      .map((x) => componentToHex(x))
      .join("")}`;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: colorSpace = currentPal.colorSpace;

  let suggestions = [randColor(), randColor(), randColor()];

  let searchedString = "";
  let interpretations = [] as string[];
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";

  function getColorForSearch() {
    const allowedStates = new Set(["idle", "loaded", "failed"]);
    if (!allowedStates.has(requestState)) {
      return;
    }
    if (searchedString === "") {
      return;
    }
    interpretations = [];

    let validString = true;
    try {
      const newColor = Color.colorFromString(
        searchedString,
        colorSpace
      ).toHex();
      if (newColor === "#000") {
        validString = false;
      } else {
        interpretations = [...interpretations, newColor];
        requestState = "loaded";
        return;
      }
    } catch (e) {
      validString = false;
    }

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

  function clickColor(color: string) {
    const newColor = Color.colorFromString(color, colorSpace);
    const newColors = [...colors, newColor];
    colorStore.setCurrentPalColors(newColors);
    suggestions = suggestions.filter((x) => x !== color);
  }
</script>

<!-- <Tooltip> -->
<!-- <div slot="content" class="max-w-xs"> -->
<div class="w-full border-t-2 border-black my-2"></div>
<div class="flex w-full justify-between">
  <div class="font-bold">Add Color</div>
  <Tooltip>
    <button
      slot="target"
      let:toggle
      on:click={toggle}
      class="{buttonStyle} italic text-sm"
    >
      More Suggestions
    </button>
    <div class="flex flex-wrap max-w-md" slot="content">
      {#each suggestions as color}
        <ColorButton
          {color}
          {clickColor}
          removeColor={() => {
            suggestions = suggestions.filter((x) => x !== color);
          }}
        />
      {/each}
      <button
        class={`${buttonStyle}`}
        on:click={() => {
          const newSuggestions = [...suggestions];
          [randColor(), randColor(), randColor()].map((x) =>
            newSuggestions.push(x)
          );
          suggestions = newSuggestions;
        }}
      >
        +
      </button>
    </div>
  </Tooltip>
</div>
<section>
  <div class="flex w-full justify-between items-center">
    <form on:submit|preventDefault={getColorForSearch}>
      <label for="add-color-search">
        <input
          type="text"
          id="add-color-search"
          placeholder="e.g. purple or red"
          class="indent-2 text-sm leading-6"
          bind:value={searchedString}
        />
      </label>
      <button class={buttonStyle}>Search</button>
    </form>
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
            const newColor = Color.colorFromString(color, colorSpace);
            console.log(newColor.toHex(), color);
            const newColors = [...colors, newColor];
            colorStore.setCurrentPalColors(newColors);
            interpretations = interpretations.filter((x) => x !== color);
            searchedString = "";
          }}
          removeColor={() => {
            interpretations = interpretations.filter((x) => x !== color);
          }}
        />
      {/each}
    </div>
  {/if}
</section>

<script lang="ts">
  import colorStore from "../../stores/color-store";
  import configStore from "../../stores/config-store";
  import chroma from "chroma-js";
  import { buttonStyle } from "../../lib/styles";
  import { colorFromString } from "../../lib/Color";
  import { suggestAdditionsToPalette } from "../../lib/api-calls";
  import Tooltip from "../../components/Tooltip.svelte";

  const randChan = () => Math.floor(Math.random() * 255);
  const randColor = (colorSpace: any) =>
    colorFromString(
      `rgb(${randChan()},${randChan()},${randChan()})`,
      "srgb"
    ).toColorSpace(colorSpace || "lab");

  $: colors = $colorStore.currentPal.colors;
  $: colorSpace = $colorStore.currentPal.colorSpace;
  $: console.log("colorSpace", colorSpace);

  let suggestions = [
    randColor(colorSpace),
    randColor(colorSpace),
    randColor(colorSpace),
  ].map((x) => x.toHex());

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
      const newColor = chroma(searchedString).hex();
      interpretations = [...interpretations, newColor];
      requestState = "loaded";
      return;
    } catch (e) {
      validString = false;
    }

    requestState = "loading";
    suggestAdditionsToPalette(
      $colorStore.currentPal,
      $configStore.engine,
      searchedString
    )
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

<Tooltip>
  <div slot="content" class="max-w-xs">
    <section>
      <div class="flex w-full justify-between items-center">
        <form on:submit|preventDefault={getColorForSearch}>
          <label for="add-color-search">
            <input
              type="text"
              id="add-color-search"
              placeholder="Add a color like purple or red"
              class="border-b-2 border-dotted border-black"
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
        <div>Error try again or modify your color term</div>
      {/if}
      {#if requestState === "loaded"}
        <div class="flex flex-wrap">
          {#each interpretations as color}
            <div
              class=" {buttonStyle} h-12 flex justify-between items-center mb-2 flex-none"
            >
              <button
                class="w-3 h-3 rounded-full mr-2"
                style="background-color: {color}"
                on:click={() => {
                  const newColor = colorFromString(color, colorSpace);
                  console.log(newColor.toHex(), color);
                  const newColors = [...colors, newColor];
                  colorStore.setCurrentPalColors(newColors);
                  interpretations = interpretations.filter((x) => x !== color);
                }}
              ></button>
              <button
                on:click={() => {
                  interpretations = interpretations.filter((x) => x !== color);
                }}
              >
                X
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <section class="mt-4 border-t-2 border-black">
      <span class="italic text-sm">Random Suggestions</span>
      <div class="flex flex-wrap">
        {#each suggestions as color}
          <div
            class=" {buttonStyle} h-12 flex justify-between items-center mb-2"
          >
            <button
              class="w-3 h-3 rounded-full mr-2"
              style="background-color: {color}"
              on:click={() => {
                const newColor = colorFromString(color, colorSpace);
                const newColors = [...colors, newColor];
                colorStore.setCurrentPalColors(newColors);
                suggestions = suggestions.filter((x) => x !== color);
              }}
            ></button>
            <button
              on:click={() => {
                suggestions = suggestions.filter((x) => x !== color);
              }}
            >
              X
            </button>
          </div>
        {/each}
        <button
          class={buttonStyle}
          on:click={() => {
            const newSuggestions = [...suggestions];
            [randColor(), randColor(), randColor()].map((x) =>
              newSuggestions.push(x.toHex())
            );
            suggestions = newSuggestions;
          }}
        >
          +
        </button>
      </div>
    </section>
  </div>
  <div slot="target" let:toggle>
    <button class={buttonStyle} on:click={toggle}>Add color</button>
  </div>
</Tooltip>

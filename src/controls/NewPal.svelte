<script lang="ts">
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import examplePalStore from "../stores/example-palette-store";
  import type { StringPalette, Palette } from "../types";
  import focusStore from "../stores/focus-store";
  import { buttonStyle, denseButtonStyle } from "../lib/styles";
  import Modal from "../components/Modal.svelte";
  import {
    newGenericPal,
    createPalFromHexes,
    wrapInBlankSemantics,
  } from "../lib/utils";
  import SuggestColorPal from "./SuggestColorPal.svelte";

  import PalPreview from "../components/PalPreview.svelte";
  $: familiarPals = $examplePalStore.palettes.map((x) => x.palette);
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal ? currentPal.colorSpace : "lab";

  let searchString = "";
  $: filteredPals = familiarPals
    .filter((pal) =>
      pal.name.toLowerCase().includes(searchString.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  function newPal(newPal: StringPalette) {
    const colors = newPal.colors.map((x) => {
      const color = Color.colorFromString(x.color, colorSpace);
      return wrapInBlankSemantics(color);
    });
    const pal = {
      ...newPal,
      colors,
      background: Color.colorFromString(newPal.background, colorSpace),
      colorSpace,
    } as Palette;
    colorStore.createNewPal(pal);
  }

  let inputString = "";
  function processBodyInput(body: string) {
    try {
      const newColors = body
        .split(",")
        .map((x) => x.replace(/"/g, "").trim())
        .filter((x) => x.length > 0)
        .map((x) => Color.colorFromString(x, colorSpace as any));
      newPal(createPalFromHexes(newColors.map((x) => x.toHex())));
    } catch (e) {
      console.error(e);
      return;
    }
  }
  let modalState: "closed" | "open" = "closed";
</script>

{#if modalState === "open"}
  <Modal
    showModal={true}
    closeModal={() => {
      modalState = "closed";
    }}
  >
    <div class="px-4 overflow-hidden w-full">
      <div class="pt-4">
        <button
          class={buttonStyle}
          on:click={() => {
            newPal(createPalFromHexes([]));
            modalState = "closed";
          }}
        >
          New blank
        </button>
        <button
          class={buttonStyle}
          on:click={() => {
            newPal(newGenericPal("new palette"));
            modalState = "closed";
          }}
        >
          New categorical
        </button>
        <button
          class={buttonStyle}
          on:click={() => {
            const pal = createPalFromHexes([
              "#0084a9",
              "#009de5",
              "#5fb1ff",
              "#bbc3ff",
              "#ecddff",
            ]);
            pal.type = "sequential";
            newPal(pal);
            modalState = "closed";
          }}
        >
          New sequential
        </button>
        <button
          class={buttonStyle}
          on:click={() => {
            const pal = createPalFromHexes([
              "#0084ae",
              "#8db3c7",
              "#e5e3e0",
              "#eca288",
              "#e25c36",
            ]);
            pal.type = "diverging";
            newPal(pal);
            modalState = "closed";
          }}
        >
          New diverging
        </button>
      </div>
      <div class="mt-5 border-t-2 border-black"></div>
      <div class="font-bold">New from string of hex</div>
      <textarea
        id="current-colors"
        class="w-full p-2 rounded border-2"
        value={inputString}
        on:keydown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            processBodyInput(e.currentTarget.value);
            e.currentTarget.blur();
            modalState = "closed";
          }
        }}
        on:change={(e) => {
          processBodyInput(e.currentTarget.value);
          modalState = "closed";
        }}
      />
      <div class="mt-5 border-t-2 border-black"></div>
      <div class="font-bold">Generate a new palette using AI</div>
      <SuggestColorPal />
      <div class="mt-5 border-t-2 border-black"></div>
      <div class="font-bold">Search for palettes from predefined examples</div>
      <input bind:value={searchString} placeholder="Search" />
      <div class="overflow-y-scroll">
        <div class="flex flex-wrap">
          {#each filteredPals as pal}
            <button
              class="flex flex-col items-start border-2 border-black p-2 m-2 rounded-lg"
              on:click={() => {
                colorStore.createNewPal(pal);
                modalState = "closed";
                focusStore.clearColors();
              }}
            >
              <div class="text-sm font-bold px-2">{pal.name}</div>
              <PalPreview {pal} allowModification={false} />
            </button>
          {/each}
        </div>
      </div>
    </div>
  </Modal>
{/if}
<div>
  <button
    class={denseButtonStyle}
    on:click={() => {
      modalState = "open";
    }}
  >
    New
  </button>
</div>

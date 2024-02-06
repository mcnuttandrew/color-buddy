<script lang="ts">
  import { Color } from "../lib/Color";
  import colorStore, { newGenericPal } from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import { onMount } from "svelte";
  import type { Palette } from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { VegaColors } from "../lib/charts";
  import { buttonStyle, denseButtonStyle } from "../lib/styles";
  import { makePal, toHex } from "../lib/utils";
  import type { ExtendedPal } from "../lib/utils";
  import SuggestColorPal from "./SuggestColorPal.svelte";

  import MiniPalPreview from "../components/MiniPalPreview.svelte";
  $: familiarPals = [] as ExtendedPal[];
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal.colorSpace;

  onMount(async () => {
    let newPals = [] as ExtendedPal[];

    Object.entries(VegaColors).forEach(([name, colors]) => {
      newPals.push(makePal(name, toHex(colors), colorSpace, "vega"));
    });

    const get = (url: string) => fetch(url).then((x) => x.json());
    const pals = await get("./pal-sets.json");
    (Object.entries(pals) as any[]).forEach(([name, { type, colors }]) => {
      const pal = makePal(name, colors, colorSpace, "ColorBrewer", type);
      newPals.push(pal);
    });
    familiarPals = newPals;
  });
  let searchString = "";
  $: groups = familiarPals.reduce(
    (acc, pal) => {
      if (!acc[pal.group]) acc[pal.group] = [];
      if (searchString.length > 0) {
        if (!pal.name.toLowerCase().includes(searchString.toLowerCase())) {
          return acc;
        }
      }
      acc[pal.group].push(pal);
      return acc;
    },
    {} as Record<string, ExtendedPal[]>
  );

  function newPalFromBlank() {
    const pal = newGenericPal("new palette") as any;
    pal.colors = [];
    pal.background = Color.colorFromString("#ffffff", colorSpace);
    pal.colorSpace = colorSpace;
    colorStore.createNewPal(pal);
  }
  function newWithGenericColors() {
    const pal = newGenericPal("new palette") as any;
    pal.colors = pal.colors.map((x: string) =>
      Color.colorFromString(x, colorSpace)
    );
    pal.background = Color.colorFromString("#ffffff", colorSpace);
    pal.colorSpace = colorSpace;
    colorStore.createNewPal(pal);
  }
</script>

<Tooltip>
  <span slot="content" let:onClick class="max-w-lg">
    <div>
      <button
        class={buttonStyle}
        on:click={() => {
          newPalFromBlank();
          onClick();
        }}
      >
        New blank
      </button>
      <button
        class={buttonStyle}
        on:click={() => {
          newWithGenericColors();
          onClick();
        }}
      >
        New with generic colors
      </button>
    </div>
    <div class="mt-5 border-t-2 border-black"></div>
    <div class="font-bold">Generate a new palette using AI</div>
    <SuggestColorPal />
    <div class="mt-5 border-t-2 border-black"></div>
    <div class="font-bold">Search for palettes from predefined examples</div>
    <input bind:value={searchString} placeholder="Search" />
    <div class="max-h-48 overflow-y-scroll">
      {#each Object.entries(groups) as [group, pals]}
        <div class="font-bold">{group}</div>
        <div class="flex flex-wrap">
          {#each pals as pal}
            <MiniPalPreview
              {pal}
              onClick={() => {
                colorStore.createNewPal(pal);
                onClick();
                focusStore.clearColors();
              }}
            />
          {/each}
        </div>
      {/each}
    </div>
  </span>

  <span slot="target" let:toggle>
    <button class={denseButtonStyle} on:click={toggle}>New</button>
  </span>
</Tooltip>

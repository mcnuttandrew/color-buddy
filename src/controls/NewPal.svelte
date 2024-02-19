<script lang="ts">
  import { Color } from "../lib/Color";
  import colorStore from "../stores/color-store";
  import type { StringPalette, Palette } from "../types";
  import focusStore from "../stores/focus-store";
  import { onMount } from "svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import { VegaColors } from "../lib/charts";
  import { buttonStyle, denseButtonStyle } from "../lib/styles";
  import {
    makePal,
    toHex,
    newGenericPal,
    createPalFromHexes,
  } from "../lib/utils";
  import type { ExtendedPal } from "../lib/utils";
  import SuggestColorPal from "./SuggestColorPal.svelte";

  import MiniPalPreview from "../components/MiniPalPreview.svelte";
  $: familiarPals = [] as ExtendedPal[];
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal ? currentPal.colorSpace : "lab";

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

  function newPal(newPal: StringPalette) {
    const pal = {
      ...newPal,
      colors: newPal.colors.map((x: string) =>
        Color.colorFromString(x, colorSpace)
      ),
      background: Color.colorFromString(newPal.background, colorSpace),
      colorSpace,
    } as Palette;
    colorStore.createNewPal(pal);
  }
</script>

<Tooltip>
  <span slot="content" let:onClick class="max-w-lg">
    <div>
      <button
        class={buttonStyle}
        on:click={() => {
          newPal(createPalFromHexes([]));
          onClick();
        }}
      >
        New blank
      </button>
      <button
        class={buttonStyle}
        on:click={() => {
          newPal(newGenericPal("new palette"));
          onClick();
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
          onClick();
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
          onClick();
        }}
      >
        New diverging
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

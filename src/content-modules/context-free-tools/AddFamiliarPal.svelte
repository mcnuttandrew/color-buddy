<script lang="ts">
  import { Color } from "../../lib/Color";
  import colorStore, { newGenericPal } from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { onMount } from "svelte";
  import type { Palette } from "../../stores/color-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { VegaColors } from "../../lib/charts";
  import { buttonStyle } from "../../lib/styles";
  import { makePal, toHex } from "../../lib/utils";
  import type { ExtendedPal } from "../../lib/utils";

  $: familiarPals = [] as ExtendedPal[];
  $: colorSpace = $colorStore.currentPal.colorSpace;

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
    pal.colors = pal.colors.map((x: string) =>
      Color.colorFromString(x, colorSpace)
    );
    pal.background = Color.colorFromString("#ffffff", colorSpace);
    pal.colorSpace = colorSpace;
    const newPal = pal as Palette;

    colorStore.createNewPal(newPal);
  }
</script>

<Tooltip>
  <span slot="content" let:onClick class="max-w-lg">
    <div class="flex">
      <input bind:value={searchString} placeholder="Search for palettes" />
      <div>
        <button class={buttonStyle} on:click={() => newPalFromBlank()}>
          New blank
        </button>
      </div>
    </div>
    <div class="max-h-48 overflow-y-scroll">
      {#each Object.entries(groups) as [group, pals]}
        <div class="font-bold">{group}</div>
        <div class="flex flex-wrap">
          {#each pals as pal}
            <div class="relative mr-2 mb-2 flex justify-center items-center">
              <div
                class="w-full flex absolute top-0 opacity-50 pointer-events-none"
              >
                {#each pal.colors as color}
                  <div
                    class="h-6"
                    style="background-color: {color.toHex()}; width: {100 /
                      pal.colors.length}%"
                  ></div>
                {/each}
              </div>
              <button
                class="{buttonStyle} "
                on:click={() => {
                  colorStore.createNewPal(pal);
                  onClick();
                  focusStore.clearColors();
                }}
              >
                {pal.name}
              </button>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </span>

  <span slot="target" let:toggle>
    <button class={buttonStyle} on:click={toggle}>New</button>
  </span>
</Tooltip>

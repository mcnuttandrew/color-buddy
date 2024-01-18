<script lang="ts">
  import { colorFromString } from "../../lib/Color";
  import chroma from "chroma-js";
  import colorStore, { newGenericPal } from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { onMount } from "svelte";
  import type { Palette } from "../../stores/color-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { VegaColors } from "../../lib/charts";
  import { buttonStyle } from "../../lib/styles";
  import { colorBrewerMapToType } from "../../lib/utils";

  interface ExtendedPal extends Palette {
    group: string;
  }
  $: familiarPals = [] as ExtendedPal[];
  $: colorSpace = $colorStore.currentPal.colorSpace;

  onMount(() => {
    const toHex = (x: string) => {
      let idx = 0;
      const colors = [];
      while (idx < x.length) {
        colors.push(colorFromString(`#${x.slice(idx, idx + 6)}`, colorSpace));
        idx += 6;
      }
      return colors;
    };
    let newPals = [] as ExtendedPal[];
    Object.entries(VegaColors).forEach(([name, colors]) => {
      newPals.push({
        name,
        colors: toHex(colors),
        background: colorFromString("#ffffff", colorSpace),
        group: "vega",
        type: "categorical",
        evalConfig: {},
        colorSpace,
      });
    });
    Object.entries(chroma.brewer).forEach(([name, colors]) => {
      newPals.push({
        name,
        colors: colors.map((x) => colorFromString(x, colorSpace)),
        background: colorFromString("#ffffff", colorSpace),
        group: "brewer",
        type: colorBrewerMapToType[name.toLowerCase()],
        evalConfig: {},
        colorSpace,
      });
    });
    familiarPals = newPals;
    // Promise.all([
    //   fetch("./tableau-colors.json")
    //     .then((x) => x.json())
    //     .then((x) => {
    //       const newPals = [] as any;
    //       Object.entries(x as Record<string, string[]>).forEach(
    //         ([name, colors]) => {
    //           newPals.push({
    //             name,
    //             colors: colors.map((x: string) =>
    //               colorFromString(x, colorSpace)
    //             ),
    //             background: colorFromString("#ffffff", colorSpace),
    //             group: "tableau",
    //           });
    //         }
    //       );
    //       return newPals;
    //     }),
    // ]).then(([tableauPals]) => {
    //   familiarPals = [...newPals, ...tableauPals];
    // });
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
    pal.colors = pal.colors.map((x: string) => colorFromString(x, colorSpace));
    pal.background = colorFromString("#ffffff", colorSpace);
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

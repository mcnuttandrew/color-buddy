<script lang="ts">
  import { colorFromString } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { onMount } from "svelte";
  import type { Palette } from "../../stores/color-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { VegaColors } from "../../lib/charts";
  import { buttonStyle } from "../../lib/styles";

  interface ExtendedPal extends Palette {
    group: string;
  }
  $: familiarPals = [] as ExtendedPal[];
  $: colorSpace = $colorStore.currentPal.colors[0]?.spaceName || "lab";
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
    let newPals = [
      // {
      //   colors: [
      //     "#c60c30",
      //     "#00a1de",
      //     "#62361b",
      //     "#009b3a",
      //     "#f9461c",
      //     "#522398",
      //     "#e27ea6",
      //     "#f9e300",
      //   ].map((x) => colorFromString(x, colorSpace)),
      //   name: "CTA",
      //   background: colorFromString("#ffffff", colorSpace),
      //   group: "CTA",
      // },
    ] as ExtendedPal[];
    Object.entries(VegaColors).forEach(([name, colors]) => {
      newPals.push({
        name,
        colors: toHex(colors),
        background: colorFromString("#ffffff", colorSpace),
        group: "vega",
      });
    });
    Promise.all([
      fetch("./brewer.json")
        .then((x) => x.json())
        .then((x) => {
          const brewerPals = [] as any;
          Object.entries(x).forEach(([schemeName, schemeSizes]) => {
            Object.entries(schemeSizes as any).forEach(([size, colors]) => {
              if (typeof colors === "string") return;
              brewerPals.push({
                name: `${schemeName}-${size}`,
                colors: (colors as any).map((x: any) =>
                  colorFromString(x, colorSpace)
                ) as any,
                background: colorFromString("#ffffff", colorSpace),
                group: "brewer",
              });
            });
          });
          return brewerPals;
        }),
      fetch("./outfits.json")
        .then((x) => x.json())
        .then((x) => {
          const outfitPals = [] as any;
          x.forEach((outfit: any) => {
            const colors = [outfit.fill1, outfit.fill2, outfit.fill3].map((x) =>
              colorFromString(x, colorSpace)
            );
            outfitPals.push({
              name: `${outfit.name}-${outfit.Category}`,
              colors,
              background: colorFromString("#ffffff", colorSpace),
              group: "outfit",
            });
          });
          return outfitPals;
        }),
    ]).then(([brewerPals, outfitPals]) => {
      familiarPals = [...newPals, ...brewerPals, ...outfitPals];
    });
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
</script>

<Tooltip>
  <span slot="content" let:onClick>
    <input bind:value={searchString} placeholder="Search for palettes" />
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
                  colorStore.createNewPalWithExplicitPal(pal);
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
    <button class={buttonStyle} on:click={toggle}>Add familiar pal</button>
  </span>
</Tooltip>

<script lang="ts">
  // import chroma from "chroma-js";
  import { CIELAB } from "../Color";
  import colorStore from "../color-store";
  import { onMount } from "svelte";
  import type { Palette } from "../color-store";
  import Tooltip from "../Tooltip.svelte";

  $: familiarPals = [] as Palette[];
  onMount(() => {
    const vega = {
      category10:
        "1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf",
      category20:
        "1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5",
      category20b:
        "393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6",
      category20c:
        "3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9",
      tableau10: "4c78a8f58518e4575672b7b254a24beeca3bb279a2ff9da69d755dbab0ac",
      tableau20:
        "4c78a89ecae9f58518ffbf7954a24b88d27ab79a20f2cf5b43989483bcb6e45756ff9d9879706ebab0acd67195fcbfd2b279a2d6a5c99e765fd8b5a5",
      accent: "7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666",
      dark2: "1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666",
      paired:
        "a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928",
      pastel1: "fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2",
      pastel2: "b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc",
      set1: "e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999",
      set2: "66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3",
      set3: "8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f",
    };
    const toHex = (x: string) => {
      let idx = 0;
      const colors = [];
      while (idx < x.length) {
        colors.push(CIELAB.fromString(`#${x.slice(idx, idx + 6)}`));
        idx += 6;
      }
      return colors;
    };
    let newPals = [] as Palette[];
    Object.entries(vega).forEach(([name, colors]) => {
      newPals.push({
        name,
        colors: toHex(colors),
        background: CIELAB.fromString("#ffffff"),
      });
    });
    fetch("./brewer.json")
      .then((x) => x.json())
      .then((x) => {
        Object.entries(x).forEach(([schemeName, schemeSizes]) => {
          Object.entries(schemeSizes as any).forEach(([size, colors]) => {
            if (typeof colors === "string") return;
            newPals.push({
              name: `${schemeName}-${size}`,
              colors: (colors as any).map((x: any) =>
                CIELAB.fromString(x)
              ) as any,
              background: CIELAB.fromString("#ffffff"),
            });
          });
        });
        familiarPals = newPals;
      });
    familiarPals = newPals;
  });
</script>

<Tooltip>
  <span slot="content" let:onClick>
    <div class="max-h-48 overflow-y-scroll">
      {#each familiarPals as pal}
        <button
          class="underline mr-2"
          on:click={() => {
            colorStore.createNewPalWithExplicitPal(pal);
            onClick();
          }}
        >
          {pal.name}
        </button>
      {/each}
    </div>
  </span>

  <span slot="target" let:toggle>
    <button class="underline" on:click={toggle}>Add predefined palette</button>
  </span>
</Tooltip>

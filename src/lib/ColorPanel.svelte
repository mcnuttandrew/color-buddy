<script lang="ts">
  import chroma from "chroma-js";
  import { insert, deleteFrom, randColor } from "../utils";
  export let colors: string[] = [];
  export let setColors: (colors: string[]) => void = () => {};

  function avgColors(
    colors: string[],
    colorSpace: "rgb" | "hsl" | "lab" = "rgb"
  ) {
    const colorSpaceMap: Record<string, (color: string) => number[]> = {
      rgb: (x) => chroma(x).rgb(),
      hsl: (x) => chroma(x).hsl(),
      lab: (x) => chroma(x).lab(),
    };
    const colorSpaceFormatters: Record<string, (color: number[]) => string> = {
      rgb: (x) => `rgb(${x.map((x) => Math.round(x)).join(",")})`,
      hsl: ([h, s, l]) => `hsl(${h}, ${s}%, ${l}%)`,
      lab: (x) => `lab(${x.map((x) => Math.round(x)).join(",")})`,
    };
    const sum = (a: any[], b: any[]) => a.map((x, i) => x + b[i]);
    const sumColor = colors.reduce(
      (acc, x) => sum(acc, colorSpaceMap[colorSpace](x)),
      [0, 0, 0]
    );
    const avgColor = sumColor.map((x) => x / colors.length);
    return chroma(colorSpaceFormatters[colorSpace](avgColor)).hex();
  }

  $: computedGuess = [
    randColor(),
    avgColors(colors, "rgb"),
    avgColors(colors, "hsl"),
    // avgColors(colors, "lab"),
  ];
  $: console.log(computedGuess);
</script>

<div class="flex color-container">
  {#each colors as color, i}
    <div>
      <div
        class="w-32 h-32 text-center flex justify-center items-center rounded-full"
        class:text-white={chroma(color).luminance() < 0.5}
        style="background-color: {color}"
      >
        {color}
      </div>
      <div>
        <button on:click={() => setColors(insert(colors, randColor(), i))}>
          random
        </button>
        <button on:click={() => setColors(deleteFrom(colors, i))}>
          Delete
        </button>
      </div>
    </div>
  {/each}
  <div class="w-32 h-32 text-center flex justify-center items-center">
    {#each computedGuess as color, i}
      <button
        class="w-8 h-8 rounded-full"
        style="background-color: {color}"
        on:click={() => setColors(insert(colors, color))}
      >
        +
      </button>
    {/each}
  </div>
</div>

<style>
  .color-container {
    flex-wrap: wrap;
    /* justify-content: space-evenly; */
    max-width: 640px;
  }
</style>

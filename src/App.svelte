<script lang="ts">
  import chroma from "chroma-js";
  import { onMount } from "svelte";
  import { tsvParse } from "d3-dsv";
  import { charts, buildTheme } from "./charts";
  import Vega from "./lib/Vega.svelte";
  import ColorArea from "./lib/ColorArea.svelte";
  import ColorCircle from "./lib/ColorCircle.svelte";
  import ColorPanel from "./lib/ColorPanel.svelte";
  import TinyWebpage from "./lib/TinyWebpage.svelte";
  import TextBlock from "./lib/TextBlock.svelte";
  import { randColor, pick } from "./utils";
  type Color = string;
  let colors: Color[] = [];
  let currentPalName: string = "Untitled";

  // an example color pallete
  $: colors = [randColor(), randColor(), randColor(), randColor(), randColor()];
  const setColors = (newColors: Color[]) => {
    colors = newColors;
  };
  let defaultPals = [];
  onMount(() => {
    fetch("./outfit-colors.tsv")
      .then((x) => x.text())
      .then((x) => tsvParse(x))
      .then((x): any => {
        defaultPals = x.map(({ fill1, fill2, fill3 }) => [fill1, fill2, fill3]);
        colors = pick(defaultPals);
      });
  });
</script>

<main class="flex h-full">
  <div class="bg-slate-400 p-2">
    <div class="text-4xl font-bold">Color Friend</div>
    <section class="mt-4 border-t-2 border-black">
      <button class="underline">New Pal</button>
    </section>
    <section class="mt-4 border-t-2 border-black">
      <div class="italic">Current Pal</div>
      <div class="flex flex-wrap">
        {#each colors as color}
          <div
            class="w-2 h-2 rounded-full"
            class:text-white={chroma(color).luminance() < 0.5}
            style="background-color: {color}"
          ></div>
        {/each}
      </div>
      <div class="flex">
        <span>Name:</span>
        <div class="" bind:textContent={currentPalName} contenteditable="true">
          {currentPalName}
        </div>
      </div>
      <button class="underline">Suggest a name</button>
    </section>
    <section class="mt-4 border-t-2 border-black">
      <div class="italic">Saved Pals</div>
    </section>
  </div>
  <br class="underline" />
  <div class="w-full flex p-2">
    <!-- left column -->
    <div class="flex-col">
      <div class="flex">
        <ColorCircle {colors} height={300} width={300} {setColors} />
        <ColorArea height={300} width={300} {colors} {setColors} />
      </div>
      <ColorPanel {colors} {setColors} />
    </div>
    <!-- right colum -->
    <div>
      <h1>Visualizations</h1>
      <div>
        {#each charts as spec}
          <Vega theme={buildTheme(colors)} {spec} />
        {/each}
      </div>
      <h1>Web pages</h1>
      <div class="flex flex-wrap">
        <TinyWebpage {colors} />
        <TextBlock {colors} />
      </div>
    </div>
  </div>
</main>

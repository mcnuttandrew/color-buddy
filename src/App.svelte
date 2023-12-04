<script lang="ts">
  import { onMount } from "svelte";
  import { tsvParse } from "d3-dsv";
  import { charts, buildTheme } from "./charts";
  import Vega from "./lib/Vega.svelte";
  import ColorArea from "./lib/ColorArea.svelte";
  import ColorCircle from "./lib/ColorCircle.svelte";
  import ColorPanel from "./lib/ColorPanel.svelte";
  import TinyWebpage from "./lib/TinyWebpage.svelte";
  import { randColor, pick } from "./utils";
  type Color = string;
  let colors: Color[] = [];

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

<main>
  <div class="text-lg font-bold">Color Palette Builder</div>
  <div class="w-full flex">
    <!-- left column -->
    <div class="flex-col">
      <ColorCircle {colors} height={300} width={300} {setColors} />
      <ColorArea height={640} width={640} {colors} {setColors} />
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
      <div>
        <TinyWebpage {colors} />
      </div>
    </div>
  </div>
</main>

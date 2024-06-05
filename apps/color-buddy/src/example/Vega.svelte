<script lang="ts">
  import type { Palette } from "@color-buddy/palette-lint";
  import Example from "./Example.svelte";
  import { getSVG } from "../lib/charts";

  export let palette: Palette;
  export let spec: any;
  export let size = 300;
  export let allowInteraction: boolean;

  let producedSVG: string = "";
  $: getSVG(spec, palette).then((x) => {
    producedSVG = x;
  });
</script>

<Example example={producedSVG} {size} {palette} {allowInteraction} />

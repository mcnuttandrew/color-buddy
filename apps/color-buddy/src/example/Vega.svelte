<script lang="ts">
  import Example from "./Example.svelte";
  import { getSVG } from "../lib/charts";
  import type { Palette } from "../types";

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

<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import Example from "./Example.svelte";
  import { getSVG } from "../lib/charts";

  export let palette: Palette;
  export let spec: any;
  export let size = 300;
  export let allowInteraction: boolean;
  export let bgColor: string;
  $: bg = bgColor || palette.background.toHex();

  let producedSVG: string = "";
  $: getSVG(spec, palette).then((x) => {
    producedSVG = x;
  });
</script>

<Example
  example={producedSVG}
  {size}
  {palette}
  {allowInteraction}
  bgColor={bg}
/>

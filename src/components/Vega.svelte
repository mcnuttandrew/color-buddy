<script lang="ts">
  import colorStore from "../stores/color-store";
  import Example from "./Example.svelte";
  import { getSVG } from "../lib/charts";

  export let spec: any;
  export let size = 300;

  let producedSVG: string = "";
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: getSVG(spec, currentPal).then((x) => {
    producedSVG = x;
  });
</script>

<Example example={producedSVG} {size} />

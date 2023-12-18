<script lang="ts">
  import colorStore from "../stores/color-store";
  import { getSVG } from "../lib/charts";

  import { idxToKey } from "../lib/charts";
  export let spec: any;

  let producedSVG: string = "";
  $: colors = $colorStore.currentPal.colors;

  $: getSVG(spec, $colorStore.currentPal).then((x) => {
    producedSVG = x;
  });
  $: bg = $colorStore.currentPal.background.toHex();
  $: finalSVG = colors.reduce(
    (acc, color, idx) => {
      return acc.replace(new RegExp(idxToKey(idx), "g"), color.toHex());
    },
    producedSVG.replace("SaLmOn", bg)
  );
</script>

<div class="flex max-w-fit">{@html finalSVG}</div>

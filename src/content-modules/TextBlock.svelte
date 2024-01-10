<script lang="ts">
  import colorStore from "../stores/color-store";
  import { seededPick } from "../lib/utils";
  $: bg = $colorStore.currentPal.background;
  $: colors = $colorStore.currentPal.colors;

  let wordBreakDown: { word: string; style: string }[] = [];
  $: wordBreakDown =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      .split(" ")
      .map((word, idx) => {
        const pick = seededPick(idx);
        const cases = [
          ...colors.map((color) => `color: ${color.toHex()}`),
          ...colors.map(
            (color) =>
              `background-color: ${color.toHex()}; 
                color: ${color.luminance() > 0.5 ? "white" : "black"};`
          ),
          ...new Array(20).map(() => ""),
        ];
        return { word, style: pick(cases) };
      });
</script>

<p
  class="max-w-sm flex flex-wrap text-sm"
  style="background-color: {bg.toHex()};"
  class:text-white={bg.luminance() < 0.5}
>
  {#each wordBreakDown as { word, style }}
    <span {style} class="mr-1 transition-all">{` ${word} `}</span>
  {/each}
</p>

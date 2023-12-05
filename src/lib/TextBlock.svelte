<script lang="ts">
  import chroma from "chroma-js";
  import { onMount } from "svelte";
  import { pick } from "../utils";
  export let colors: string[] = [];

  let wordBreakDown: { word: string; style: string }[] = [];
  $: wordBreakDown =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      .split(" ")
      .map((word) => {
        const cases = [
          ...colors.map((color) => `color: ${color}`),
          ...colors.map(
            (color) =>
              `background-color: ${color}; 
                color: ${chroma(color).luminance() > 0.5 ? "white" : "black"};`
          ),
          ...new Array(20).map(() => ""),
        ];
        return { word, style: pick(cases) };
      });
</script>

<p class="max-w-md flex flex-wrap">
  {#each wordBreakDown as { word, style }}
    <span {style}>{word}</span>
  {/each}
</p>

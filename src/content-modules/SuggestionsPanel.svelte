<script lang="ts">
  import { colorFromString } from "../lib/Color";
  import { insert, randColor } from "../lib/utils";
  import colorStore from "../stores/color-store";
  import { suggestAdditionsToPalette } from "../lib/api-calls";
  $: colors = $colorStore.currentPal.colors;
  $: computedGuess = [
    { color: randColor(), explanation: "random" },
    // { color: avgColors(colors, "hsl"), explanation: "average HSL" },
    // { color: avgColors(colors, "rgb"), explanation: "average RGB" },
    // { color: avgColors(colors, "lab"), explanation: "average LAB" },
    // { color: opposingColor(colors[0]), explanation: "opposite of first color" },
  ];
  let aiSuggestions: string[] = [];
  let requestState: "idle" | "loading" = "idle";
</script>

<div class="flex flex-col border-2 border-slate-300 rounded">
  <div>Suggestions</div>
  <div class="flex flex-wrap">
    {#each computedGuess as { color, explanation }}
      <div class="flex items-center justify-center mr-4">
        <button
          class="w-8 h-8 rounded-full"
          style="background-color: {color.toHex()}"
          on:click={() => colorStore.setCurrentPalColors(insert(colors, color))}
        >
          +
        </button>
        <span class="italic text-sm ml-2">
          {explanation}
        </span>
      </div>
    {/each}
    {#each aiSuggestions as color, i}
      <div class="flex items-center justify-center mr-4">
        <button
          class="w-8 h-8 rounded-full"
          style="background-color: {color}"
          on:click={() => {
            colorStore.setCurrentPalColors(
              insert(colors, colorFromString(color, "lab"))
            );
            aiSuggestions = aiSuggestions.filter((x) => x !== color);
          }}
        >
          +
        </button>
        <span class="italic text-sm ml-2">AI Suggestion</span>
      </div>
    {/each}
  </div>
  <button
    class="underline"
    class:animate-pulse={requestState === "loading"}
    on:click={() => {
      if (requestState === "loading") return;
      requestState = "loading";
      suggestAdditionsToPalette(
        $colorStore.currentPal.colors,
        $colorStore.currentPal.background,
        $colorStore.engine
      )
        .then((x) => {
          console.log("ai suggestions", x);
          aiSuggestions = x;
          requestState = "idle";
        })
        .catch((e) => {
          console.log(e);
          requestState = "idle";
        });
    }}
  >
    Get AI suggestions
    {#if requestState === "loading"}(loading){/if}
  </button>
  <!-- <button
    on:click={() => {
      // list of plausible fake color suggestions in hex codes
      aiSuggestions = ["#ff0000", "#00ff00", "#0000ff"];
    }}
  >
    Fake Suggestions
  </button> -->
</div>

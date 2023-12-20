<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import colorStore from "../../stores/color-store";
  import { colorFromString } from "../../lib/Color";
  import { suggestAdditionsToPalette } from "../../lib/api-calls";
  import { randColor, insert } from "../../lib/utils";

  let colors = $colorStore.currentPal.colors;

  let requestState: "idle" | "loading" | "loaded" = "idle";
  let suggestions = [randColor(), randColor(), randColor()].map((x) =>
    x.toHex()
  );
</script>

<Tooltip>
  <span slot="target" let:toggle>
    <button class={"underline"} on:click={toggle}>Get Color Suggestions</button>
  </span>
  <div slot="content" let:onClick>
    <div class="flex flex-col">
      <div class="flex flex-wrap">
        {#each suggestions as color}
          <div
            class=" border-black rounded p-2 flex justify-between items-center"
          >
            <button
              class="w-6 h-6 rounded-full"
              style="background-color: {color}"
              on:click={() => {
                colorStore.setCurrentPalColors(
                  insert(colors, colorFromString(color, "lab"))
                );
                suggestions = suggestions.filter((x) => x !== color);
                requestState = "idle";
              }}
            ></button>
            <button
              on:click={() => {
                suggestions = suggestions.filter((x) => x !== color);
              }}
            >
              X
            </button>
          </div>
        {/each}
      </div>

      <button
        class:underline={requestState === "idle"}
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
              x.forEach((color) => {
                if (!suggestions.includes(color)) {
                  suggestions.push(color);
                }
              });
              requestState = "idle";
            })
            .catch((e) => {
              console.log(e);
              requestState = "idle";
            });
        }}
      >
        {#if requestState === "idle"}
          Get more suggestions
        {:else}
          loading...
        {/if}
      </button>
      <button
        class="underline"
        on:click={() => {
          suggestions = [];
        }}
      >
        Clear all suggestions
      </button>
    </div>
  </div>
</Tooltip>

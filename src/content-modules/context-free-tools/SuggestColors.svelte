<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import colorStore from "../../stores/color-store";
  import { colorFromString } from "../../lib/Color";
  import { suggestAdditionsToPalette } from "../../lib/api-calls";
  import { randColor, insert } from "../../lib/utils";
  import { buttonStyle } from "../../lib/styles";

  let colors = $colorStore.currentPal.colors;

  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  let suggestions = [randColor(), randColor(), randColor()].map((x) =>
    x.toHex()
  );
  $: colorSpace = $colorStore.currentPal.colors[0]?.spaceName || "lab";
</script>

<Tooltip>
  <span slot="target" let:toggle>
    <button class={buttonStyle} on:click={toggle}>Get Color Suggestions</button>
  </span>
  <div slot="content" let:onClick>
    <div class="flex flex-col">
      Suggestions:
      <div class="flex flex-wrap">
        {#each suggestions as color}
          <div class=" {buttonStyle} h-12 flex justify-between items-center">
            <button
              class="w-3 h-3 rounded-full mr-2"
              style="background-color: {color}"
              on:click={() => {
                colorStore.setCurrentPalColors(
                  insert(colors, colorFromString(color, colorSpace))
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
      Options:
      <button
        class={buttonStyle}
        class:pointer-events-none={requestState === "loading"}
        on:click={() => {
          if (requestState === "loading") return;
          requestState = "loading";
          suggestAdditionsToPalette($colorStore.currentPal, $colorStore.engine)
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
              requestState = "failed";
            });
        }}
      >
        {#if requestState === "idle"}
          Get more suggestions
        {:else}
          loading...
        {/if}
      </button>
      {#if requestState === "failed"}
        <div>Failed to get suggestions,please try again</div>
      {/if}
      <button
        class={buttonStyle}
        on:click={() => {
          suggestions = [];
        }}
      >
        Clear all suggestions
      </button>
    </div>
  </div>
</Tooltip>

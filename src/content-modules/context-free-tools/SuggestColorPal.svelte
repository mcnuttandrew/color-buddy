<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import colorStore from "../../stores/color-store";
  import { colorFromString } from "../../lib/Color";
  import { suggestPal } from "../../lib/api-calls";
  import type { Palette } from "../../stores/color-store";
  import PalPreview from "../../components/PalPreview.svelte";

  let requestState: "idle" | "loading" | "loaded" = "idle";
  let newPal: Palette = {
    colors: [],
    background: colorFromString("#000000", "lab"),
    name: "blank",
  };
  let palPrompt: string = "";
</script>

<Tooltip>
  <span slot="target" let:toggle>
    <button class={"underline"} on:click={toggle}>
      Create pal from prompt
    </button>
  </span>
  <div slot="content" let:onClick>
    <div class="flex flex-col">
      <label for="pal-prompt">
        <div>Name of new Palette</div>
        <div class="text-sm italic">
          (e.g. "Color Wheel Basics" or "Mystic River")
        </div>
      </label>
      {#if requestState === "loaded"}
        <PalPreview pal={newPal} />
        <div class="flex justify-between">
          <button
            class="underline"
            on:click={() => {
              colorStore.createNewPalWithExplicitPal(newPal);
              requestState = "idle";
              palPrompt = "";
              onClick();
            }}
          >
            Use
          </button>
          <button
            class="underline"
            on:click={() => {
              requestState = "idle";
            }}
          >
            Reject
          </button>
        </div>
      {:else}
        <input bind:value={palPrompt} id="pal-prompt" />
        <button
          class:underline={requestState === "idle"}
          on:click={() => {
            if (requestState === "loading") return;
            requestState = "loading";
            suggestPal(palPrompt, $colorStore.engine).then((suggestions) => {
              if (suggestions.length === 0) {
                //   alert("No suggestions found");
                requestState = "idle";
                return;
              }
              const suggestion = suggestions[0];
              newPal.colors = suggestion.colors.map((x) =>
                colorFromString(x, "lab")
              );
              newPal.background = colorFromString(suggestion.background, "lab");
              newPal.name = palPrompt;

              requestState = "loaded";
            });
          }}
        >
          {#if requestState === "idle"}
            Submit
          {:else}
            loading...
          {/if}
        </button>
      {/if}
    </div>
  </div>
</Tooltip>

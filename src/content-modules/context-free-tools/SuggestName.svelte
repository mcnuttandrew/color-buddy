<script lang="ts">
  import colorStore from "../../stores/color-store";
  import configStore from "../../stores/config-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { AIButtonStyle, buttonStyle } from "../../lib/styles";

  import { suggestNameForPalette } from "../../lib/api-calls";

  let nameSuggestions: string[] = [];
  let requestState: "idle" | "loading" = "idle";
</script>

<Tooltip>
  <div slot="content">
    <div class="">
      <button
        class={buttonStyle}
        class:animate-pulse={requestState === "loading"}
        on:click={() => {
          if (requestState === "loading") return;
          requestState = "loading";
          suggestNameForPalette($colorStore.currentPal, $configStore.engine)
            .then((x) => {
              nameSuggestions = x;
              requestState = "idle";
            })
            .catch((e) => {
              console.log(e);
              requestState = "idle";
            });
        }}
      >
        Generate Suggestions
        {#if requestState === "loading"}(loading)
        {/if}
      </button>

      <div class="flex flex-wrap items-start">
        {#each nameSuggestions as name}
          <div class="ml-2 rounded bg-green-800 text-white">
            <button
              class="rounded p-2"
              on:click={() => colorStore.setCurrentPalName(name)}
            >
              {name}
            </button>
            <button
              on:click={() => {
                nameSuggestions = nameSuggestions.filter((x) => x !== name);
              }}
              class="rounded p-2 bg-amber-700"
            >
              X
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <div slot="target" let:toggle>
    <button class={AIButtonStyle} on:click={toggle}>Suggest a name</button>
  </div>
</Tooltip>

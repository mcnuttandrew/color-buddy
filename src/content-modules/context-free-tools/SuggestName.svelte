<script lang="ts">
  import colorStore from "../../stores/color-store";
  import configStore from "../../stores/config-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { AIButtonStyle, buttonStyle } from "../../lib/styles";

  import { suggestNameForPalette } from "../../lib/api-calls";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];

  function makeRequest() {
    if (requestState === "loading") return;
    requestState = "loading";
    suggestNameForPalette(currentPal, $configStore.engine)
      .then((x) => {
        nameSuggestions = x;
        requestState = "idle";
      })
      .catch((e) => {
        console.log(e);
        requestState = "idle";
      });
  }

  let nameSuggestions: string[] = [];
  let requestState: "idle" | "loading" = "idle";
</script>

<Tooltip
  onClose={() => {
    nameSuggestions = [];
  }}
>
  <div slot="content" let:onClick>
    <div class="">
      {#if requestState === "loading"}
        <div class:animate-pulse={requestState === "loading"}>
          Generating Suggestions
        </div>
      {/if}

      <div class="flex flex-wrap items-start">
        {#each nameSuggestions as name}
          <div class="ml-2 rounded bg-cyan-500 text-white">
            <button
              class="rounded p-2"
              on:click={() => {
                colorStore.setCurrentPalName(name);
                onClick();
              }}
            >
              {name}
            </button>
            <button
              on:click={() => {
                nameSuggestions = nameSuggestions.filter((x) => x !== name);
              }}
              class="rounded p-2 bg-amber-400"
            >
              X
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <div slot="target" let:toggle>
    <button
      class={AIButtonStyle}
      on:click={() => {
        toggle();
        makeRequest();
      }}
    >
      Suggest a name
    </button>
  </div>
</Tooltip>

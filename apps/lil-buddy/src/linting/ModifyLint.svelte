<script lang="ts">
  import type { Palette } from "color-buddy-palette";
  import store from "../stores/store";
  import Tooltip from "../components/Tooltip.svelte";
  import { modifyLintProgram } from "../lib/api-calls";
  import { JSONStringify } from "../lib/utils";
  import { buttonStyle } from "../lib/styles";

  export let currentProgram: string;
  export let pal: Palette;

  let lintPrompt: string = "";
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";

  function makeRequest(onFinish: () => void) {
    requestState = "loading";

    modifyLintProgram(lintPrompt, currentProgram, pal, $store.engine)
      .then(async (suggestions) => {
        if (suggestions.length === 0) {
          requestState = "idle";
          return;
        }
        store.setCurrentLintProgram(
          JSONStringify(JSON.stringify(suggestions[0]))
        );

        requestState = "loaded";
        onFinish();
      })
      .catch((e) => {
        console.log(e);
        requestState = "idle";
      });
  }
</script>

<Tooltip>
  <div slot="content" class="w-96" let:onClick>
    <div class="text-xs">
      Ask an AI to make a modification to the lint program
    </div>
    <form
      on:submit|preventDefault={() => makeRequest(onClick)}
      class="flex flex-col"
    >
      <textarea
        bind:value={lintPrompt}
        on:keypress={(e) => {
          if (e.key === "Enter") {
            // @ts-ignore
            e.target.blur();
            makeRequest(onClick);
          }
        }}
        id="pal-prompt"
        class="indent-2 text-sm leading-6 border-2"
        placeholder="Make it check for valid blues"
      />
      <button class={""} class:pointer-events-none={requestState === "loading"}>
        {requestState === "loading" ? "loading..." : "Submit"}
      </button>
    </form>
  </div>
  <button
    slot="target"
    let:toggle
    class={buttonStyle}
    on:click={() => {
      toggle();
    }}
  >
    Modify ✨
  </button>
</Tooltip>

<script lang="ts">
  import store from "../stores/store";
  import Tooltip from "../components/Tooltip.svelte";
  import { modifyLintProgram } from "../lib/api-calls";
  import { JSONStringify } from "../lib/utils";
  import { buttonStyle } from "../lib/styles";

  export let currentProgram: string;

  let lintPrompt: string = "";
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";

  function makeRequest() {
    requestState = "loading";

    modifyLintProgram(lintPrompt, currentProgram, $store.engine)
      .then(async (suggestions) => {
        if (suggestions.length === 0) {
          requestState = "idle";
          return;
        }
        store.setCurrentLintProgram(
          JSONStringify(JSON.stringify(suggestions[0]))
        );

        requestState = "loaded";
      })
      .catch((e) => {
        console.log(e);
        requestState = "idle";
      });
  }
</script>

<Tooltip>
  <div slot="content" class="w-96">
    <div>What would you like your check to be able to do?</div>
    <form on:submit|preventDefault={makeRequest} class="flex flex-col">
      <textarea
        bind:value={lintPrompt}
        on:keypress={(e) => {
          if (e.key === "Enter") {
            // @ts-ignore
            e.target.blur();
            makeRequest();
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
    Modify program by AI
  </button>
</Tooltip>

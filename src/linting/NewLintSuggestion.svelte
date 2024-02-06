<script lang="ts">
  import lintStore from "../stores/lint-store";
  import configStore from "../stores/config-store";
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import { suggestLint, suggestLintMetadata } from "../lib/api-calls";
  import { JSONStringify } from "../lib/utils";
  let lintPrompt: string = "";
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  function makeRequest() {
    requestState = "loading";

    suggestLint(lintPrompt, $configStore.engine)
      .then(async (suggestions) => {
        if (suggestions.length === 0) {
          requestState = "idle";
          return;
        }
        const program = JSONStringify(JSON.stringify(suggestions[0]));
        const metaSuggestions = await suggestLintMetadata(
          program,
          $configStore.engine
        );
        let description = lintPrompt;
        let failMessage = lintPrompt;
        let name = "New Lint";
        if (metaSuggestions.length > 0) {
          description = metaSuggestions[0]?.description || lintPrompt;
          failMessage = metaSuggestions[0]?.failMessage || lintPrompt;
          name = metaSuggestions[0]?.name || "New Lint";
        }

        lintStore.createNewLint({
          name,
          description,
          failMessage,
          program,
        });
        requestState = "loaded";
      })
      .catch((e) => {
        console.log(e);
        requestState = "idle";
      });
  }
</script>

<Tooltip>
  <div slot="content">
    <div>What would you like your lint to be able to do?</div>
    <form on:submit|preventDefault={makeRequest} class="flex flex-col">
      <input
        bind:value={lintPrompt}
        id="pal-prompt"
        class="indent-2 text-sm leading-6"
        placeholder="e.g. 'This palette should have a Cascadian vibe'"
      />
      <div>
        <button
          class={buttonStyle}
          class:pointer-events-none={requestState === "loading"}
        >
          {requestState === "loading" ? "loading..." : "Submit"}
        </button>
        <button
          class={buttonStyle}
          on:click|stopPropagation|preventDefault={() => {
            lintStore.createNewLint({
              name: "New Lint",
              description: "",
              failMessage: "",
              program: "true",
            });
          }}
        >
          Just give me a blank one
        </button>
      </div>
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
    New Lint
  </button>
</Tooltip>

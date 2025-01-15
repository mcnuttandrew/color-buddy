<script lang="ts">
  import store from "../stores/store";
  import Tooltip from "../components/Tooltip.svelte";
  import { suggestLint, loadLints } from "../lib/api-calls";

  let lintPrompt: string = "";
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";

  function getNewName(): string {
    const lintNames = new Set($store.lints.map((x) => x.name));
    let name = "New Check";
    let i = 2;
    while (lintNames.has(name)) {
      name = `New Check ${i}`;
      i++;
    }
    return name;
  }
  function makeRequest() {
    requestState = "loading";

    suggestLint(lintPrompt, $store.engine)
      .then(async (suggestions) => {
        if (suggestions.length === 0) {
          requestState = "idle";
          return;
        }
        const prog = suggestions[0] as any;
        let explanation = "";
        if (typeof prog === "object" && prog.comments) {
          explanation = prog.comments;
          delete prog.comments;
        }
        if (typeof prog === "object") {
          prog.$schema = `https://color-buddy-docs.netlify.app/lint-schema.v0.json`;
        }
        const program = JSON.stringify(JSON.stringify(prog));
        let description = explanation || lintPrompt;
        let failMessage = lintPrompt;
        let name = lintPrompt;

        store.createNewLint({
          name,
          description,
          failMessage,
          program,
        });
        setTimeout(() => {
          loadLints();
          lintPrompt = "";
          // lintStore.setEvalDisplayMode("check-customization");
        }, 100);

        requestState = "loaded";
      })
      .catch((e) => {
        console.log(e);
        requestState = "idle";
      });
  }
</script>

<Tooltip targetBody={false}>
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
        placeholder="e.g. 'This palette should have a Cascadian vibe'"
      />
      <div>
        <button
          class={""}
          class:pointer-events-none={requestState === "loading"}
        >
          {requestState === "loading" ? "loading..." : "Submit"}
        </button>
        <button
          class={""}
          on:click|stopPropagation|preventDefault={() => {
            let name = getNewName();
            store.createNewLint({
              name,
              description: "",
              failMessage: "",
              program: "true",
            });
            // lintStore.setEvalDisplayMode("check-customization");
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
    class={""}
    on:click={() => {
      toggle();
    }}
  >
    Create New Check
  </button>
</Tooltip>

<script lang="ts">
  import { prettyPrintLL } from "color-buddy-palette-lint";

  import store from "../stores/store";

  import { buttonStyle } from "../lib/styles";
  import LintMeta from "./LintMeta.svelte";

  import { JSONStringify } from "../lib/utils";

  import MonacoEditor from "../components/MonacoEditor.svelte";
  import Nav from "../components/Nav.svelte";

  import ProgramCommand from "./ProgramCommand.svelte";
  import Controls from "./Controls.svelte";

  import LintTests from "./LintTests.svelte";
  import FocusedTest from "./FocusedTest.svelte";
  import GraphSummary from "./GraphSummary.svelte";

  $: lint = $store.lints.find((lint) => lint.id === $store.focusedLint)!;
  $: program = lint ? lint.program : "";

  // run this lint
  let errors: any = null;

  function generatePrettyText(program: string): string {
    try {
      return prettyPrintLL(JSON.parse(program));
    } catch (e) {
      console.log(e);
      return "parsing error";
    }
  }
</script>

{#if $store.focusedTest}
  <FocusedTest {lint} />
{/if}
<div class="w-full flex">
  <div class="flex flex-col">
    <div class="w-full bg-stone-100 font-bold">Lint Customization</div>
    <div class="flex flex-col px-4">
      <div class="flex">
        <Controls />
        <LintMeta {lint} />
        <button
          class={buttonStyle}
          on:click={() => {
            store.setCurrentLintProgram(JSONStringify(program) || "");
          }}
        >
          Tidy 🧹
        </button>
        <ProgramCommand currentProgram={lint.program} />
        <Nav
          tabs={["graph-summary", "text-program"]}
          isTabSelected={(x) => x === $store.visualSummary}
          selectTab={(x) => store.setVisualSummary(x)}
        />
      </div>

      {#if errors}
        <div class="text-red-500">{errors.message}</div>
      {/if}

      {#if $store.visualSummary === "graph-summary"}
        <div class="font-bold">Graph Summary</div>
        <GraphSummary {lint} />
      {:else}
        <div class="flex justify-between">
          <div class="font-bold">Lint Program</div>
        </div>
        <div>
          {generatePrettyText(program)}
        </div>
        <MonacoEditor
          value={program}
          onChange={(x) => {
            store.setCurrentLintProgram(x);
          }}
          language="json"
        />
      {/if}
    </div>
  </div>
  <div class="w-1/2">
    <div></div>

    <LintTests {lint} />
  </div>
</div>

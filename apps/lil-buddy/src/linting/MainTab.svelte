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

<div class="w-full flex">
  <div class="flex flex-col w-1/2 px-4">
    <Controls />
    <div class="font-bold">Lint Meta</div>
    <LintMeta {lint} />

    {#if errors}
      <div class="text-red-500">{errors.message}</div>
    {/if}

    <div class="flex justify-between">
      <div class="font-bold">Lint Program</div>
      <button
        class={buttonStyle}
        on:click={() => {
          store.setCurrentLintProgram(JSONStringify(program) || "");
        }}
      >
        Clean up Program
      </button>
      <ProgramCommand currentProgram={lint.program} />
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
  </div>
  <div class="w-1/2 px-4">
    <div>
      <Nav
        tabs={["graph-summary", "execution-flow"]}
        isTabSelected={(x) => x === $store.visualSummary}
        selectTab={(x) => store.setVisualSummary(x)}
      />
    </div>
    {#if $store.visualSummary === "graph-summary"}
      <div class="font-bold">Graph Summary</div>
      <GraphSummary {lint} />
    {/if}
    {#if $store.visualSummary === "execution-flow"}
      <LintTests {lint} />
      {#if $store.focusedTest}
        <div class="font-bold">Focused Test</div>
        <FocusedTest {lint} />
      {/if}
    {/if}
  </div>
</div>

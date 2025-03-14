<script lang="ts">
  import { prettyPrintLL } from "color-buddy-palette-lint";

  import store from "../stores/store";

  import { buttonStyle } from "../lib/styles";
  import LintMeta from "./LintMeta.svelte";
  import LintPicker from "./LintPicker.svelte";
  import VisualSummarizer from "./VisualSummarizer.svelte";

  import { JSONStringify, getFocusedTestPal } from "../lib/utils";

  import MonacoEditor from "../components/MonacoEditor.svelte";
  import Nav from "../components/Nav.svelte";

  import ResetLint from "./ResetLint.svelte";
  import ProgramCommand from "./ProgramCommand.svelte";

  import LintTests from "./LintTests.svelte";
  import FocusedTest from "./FocusedTest.svelte";
  import GraphSummary from "./GraphSummary.svelte";

  $: lint = $store.lints.find((lint) => lint.id === $store.focusedLint);
  $: program = lint ? lint.program : "";
  $: focusedTest = $store.focusedTest;
  $: testPal = getFocusedTestPal(lint, focusedTest);

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

<div class="flex px-2 max-h-[50vh]">
  <div class="max-w-72 w-72 overflow-auto bg-stone-100">
    <div class="font-bold">Current Lint</div>
    <LintPicker />
    {#if lint}
      <div class="flex flex-wrap">
        <LintMeta {lint} />
        <ProgramCommand currentProgram={lint.program} />
        <ResetLint />
      </div>
    {/if}
    <div class="font-bold">Palette</div>
    {#if $store.focusedTest && lint}
      <FocusedTest {lint} />
    {/if}
  </div>
  <div class="w-full overflow-auto h-[50vh] p-4">
    {#if testPal && program}
      <VisualSummarizer lint={program} pal={testPal} />
    {:else}
      <div class="text-red-500">No palette selected</div>
    {/if}
  </div>
</div>
<div class="w-full flex">
  <div class="flex flex-col">
    <div class="w-full bg-stone-100 font-bold">Lint Customization</div>
    {#if lint}
      <div class="flex flex-col px-4">
        <div class="flex">
          <button
            class={buttonStyle}
            on:click={() => {
              store.setCurrentLintProgram(JSONStringify(program) || "");
            }}
          >
            Tidy 🧹
          </button>

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
    {/if}
  </div>
  <div class="w-1/2">
    {#if lint}
      <LintTests {lint} />
    {/if}
  </div>
</div>

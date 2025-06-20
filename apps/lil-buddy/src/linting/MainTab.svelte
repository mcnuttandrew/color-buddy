<script lang="ts">
  import { prettyPrintLL } from "color-buddy-palette-lint";
  import { Pane, Splitpanes } from "svelte-splitpanes";

  import store from "../stores/store";

  import { buttonStyle } from "../lib/styles";
  import LintMeta from "./LintMeta.svelte";
  import LintPicker from "./LintPicker.svelte";
  import VisualSummarizer from "./VisualSummarizer.svelte";
  import LintTestsAlt from "./LintTestsAlt.svelte";

  import { JSONStringify, getFocusedTestPal } from "../lib/utils";

  import MonacoEditor from "../components/MonacoEditor.svelte";

  import ResetLint from "./ResetLint.svelte";
  import ModifyLint from "./ModifyLint.svelte";

  import FocusedTest from "./FocusedTest.svelte";
  import GraphSummary from "./GraphSummary.svelte";

  $: lint = $store.lints.find((lint) => lint.id === $store.focusedLint);
  $: program = lint ? lint.program : "";
  $: focusedTest = $store.focusedTest;
  $: testPal = getFocusedTestPal(lint, focusedTest);

  // function generatePrettyText(program: string): string {
  //   try {
  //     return prettyPrintLL(JSON.parse(program));
  //   } catch (e) {
  //     console.log(e);
  //     return "parsing error";
  //   }
  // }
</script>

<div class="flex h-full overflow-hidden">
  <div class="w-full">
    <Splitpanes horizontal={true}>
      <Pane class="bg-white w-full flex">
        <div class="flex flex-col w-80 h-full">
          <div class="bg-stone-200 px-4 pt-1">
            <div class="flex justify-between">
              <div class="font-bold">Current Lint</div>
              <LintPicker />
            </div>
            {#if lint}<LintTestsAlt {lint} />{/if}
          </div>
          <div class="bg-stone-100 py-1 px-4 h-full overflow-auto">
            <div class="font-bold">Test Case</div>
            {#if $store.focusedTest && lint}
              <FocusedTest {lint} />
            {/if}
          </div>
        </div>
        <div
          class="w-[calc(100%-300px)] h-[calc(100%)] overflow-auto p-4 mb-64 min-w-[calc(100%-300px)]"
        >
          {#if testPal && program}
            <VisualSummarizer lint={program} pal={testPal} />
          {:else}
            <div class="text-red-500">No palette selected</div>
          {/if}
        </div>
        <!-- </div> -->
      </Pane>
      <Pane class="bg-white flex flex-col" minSize={20}>
        <div class="w-full bg-stone-100 py-1 px-4 flex">
          {#if testPal && lint}
            <ModifyLint currentProgram={lint.program} pal={testPal} />
          {/if}
          <button
            class={`${buttonStyle} mx-2`}
            on:click={() => {
              store.setCurrentLintProgram(JSONStringify(program) || "");
            }}
          >
            Tidy 🧹
          </button>
          <ResetLint />
          {#if lint}
            <div class="flex flex-wrap mx-2">
              <LintMeta {lint} />
            </div>
          {/if}
        </div>
        {#if lint}
          <div class="flex flex-col px-4">
            <div class="flex">
              <!-- <Nav
                tabs={["graph-summary", "text-program"]}
                isTabSelected={(x) => x === $store.visualSummary}
                selectTab={(x) => store.setVisualSummary(x)}
              /> -->
            </div>

            {#if $store.visualSummary === "graph-summary"}
              <GraphSummary {lint} />
            {:else}
              <!-- <div class="flex justify-between">
                <div class="font-bold">Lint Program</div>
              </div>
              <div>
                {generatePrettyText(program)}
              </div> -->
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
      </Pane>
    </Splitpanes>
  </div>
</div>

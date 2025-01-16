<script lang="ts">
  import { PREBUILT_LINTS, linter } from "color-buddy-palette-lint";

  import store from "../stores/store";
  import { newId, runLint } from "../lib/utils";
  import { buttonStyle } from "../lib/styles";
  import LintMeta from "./LintMeta.svelte";

  import MonacoEditor from "../components/MonacoEditor.svelte";
  import Nav from "../components/Nav.svelte";
  import DeleteLint from "./DeleteLint.svelte";

  import LintTests from "./LintTests.svelte";
  import FocusedTest from "./FocusedTest.svelte";

  $: lint = $store.lints.find((lint) => lint.id === $store.focusedLint)!;
  $: program = lint ? lint.program : "";

  $: builtInLint = PREBUILT_LINTS.find((x) => x.id === $store.focusedLint);
  $: isBuiltInThatsBeenModified =
    builtInLint && lint?.program !== builtInLint?.program;

  // run this lint
  let errors: any = null;
  let debugCompare = false;
</script>

<div class="w-full flex">
  <!-- pick from a list of available lints -->

  <div class="flex flex-col w-1/2 px-4">
    <div class="font-bold">Controls</div>
    <div class="flex">
      <DeleteLint {lint} />
      {#if isBuiltInThatsBeenModified}
        <button
          class={buttonStyle}
          on:click={() => {
            store.setCurrentLintProgram(builtInLint?.program || "");
          }}
        >
          Restore this lint to original version
        </button>
      {/if}
      <button
        class={buttonStyle}
        on:click={() => {
          const clonedId = newId();
          store.cloneLint(lint.id, clonedId);
          store.setFocusedLint(clonedId);
        }}
      >
        Clone this lint
      </button>
    </div>
    <div class="font-bold">Lint Meta</div>
    <LintMeta {lint} />

    {#if errors}
      <div class="text-red-500">{errors.message}</div>
    {/if}

    <!-- {#if lintRun.kind === "success"}
        <div>
          <div class="font-bold">Lint Self Description (from the program):</div>
          <div>{lintRun?.naturalLanguageProgram}</div>
        </div>
      {/if} -->
    <div class="flex justify-between">
      <div class="font-bold">Lint Program</div>
      <button
        class={buttonStyle}
        on:click={() => {
          store.setCurrentLintProgram(JSON.stringify(program) || "");
        }}
      >
        Clean up Program
      </button>
      <div class="flex justify-between">
        <div class="flex flex-col">
          <div class="font-bold">Show Compare Debug In Terminal</div>
          <div>
            <Nav
              tabs={["Show", "Hide"]}
              isTabSelected={(x) => (debugCompare ? "Show" : "Hide") === x}
              selectTab={(x) => {
                debugCompare = x === "Show";
              }}
            />
          </div>
        </div>
      </div>
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
    {#if $store.focusedTest}
      <div class="font-bold">Focused Test</div>
      <FocusedTest {lint} />
    {/if}
    <div class="font-bold">Lint Tests</div>

    <LintTests {lint} />
  </div>
</div>

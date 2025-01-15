<script lang="ts">
  import { PREBUILT_LINTS, linter } from "color-buddy-palette-lint";
  import type { Palette } from "color-buddy-palette";
  import type { LintResult, LintProgram } from "color-buddy-palette-lint";

  import store, { newId } from "../stores/store";

  import Tooltip from "../components/Tooltip.svelte";

  import MonacoEditor from "../components/MonacoEditor.svelte";
  import Nav from "../components/Nav.svelte";
  import PalPreview from "../components/PalPreview.svelte";

  import LintCustomizationPreview from "./LintCustomizationPreview.svelte";
  import NewLintSuggestion from "./NewLintSuggestion.svelte";
  import LintCustomizationAddTest from "./LintCustomizationAddTest.svelte";

  $: lint = $store.lints.find((lint) => lint.id === $store.focusedLint)!;
  $: program = lint ? lint.program : "";

  $: builtInLint = PREBUILT_LINTS.find((x) => x.id === $store.focusedLint);
  $: isBuiltInThatsBeenModified =
    builtInLint && lint?.program !== builtInLint?.program;

  // run this lint
  let errors: any = null;
  function runLint(
    lint: LintProgram,
    options: Parameters<typeof linter>[2],
    pal: Palette
  ): LintResult {
    if (!lint) {
      store.setFocusedLint(false);
      return { kind: "ignored", lintProgram: lint };
    }
    try {
      const result = linter(pal, [lint], options);
      errors = null;
      return result[0];
    } catch (e) {
      errors = e;
      return { kind: "ignored", lintProgram: lint };
    }
  }
  let debugCompare = false;
  let showTestCases = true;
  let showDeleteDoubleCheck = false;

  // $: lintRun = runLint(lint, { debugCompare }, currentPal);

  $: currentTaskTypes = lint?.taskTypes || ([] as string[]);

  // $: blameData = (lintRun.kind === "success" && lintRun.blameData) || [];
  $: blameData = [];
  $: pairData = blameData as number[][];
  const taskTypes = ["sequential", "diverging", "categorical"] as const;

  $: lints = $store.lints;

  type TestResult = {
    pal: Palette;
    result: LintResult;
    blame: any;
  };
  // test results
  $: passingTestResults = (
    (showTestCases && lint?.expectedPassingTests) ||
    []
  ).map((pal) => {
    const result = runLint(lint, {}, pal);
    return {
      result,
      pal,
      blame: result.kind === "success" ? result?.blameData : [],
    };
  }) as TestResult[];
  $: failingTestResults = (
    (showTestCases && lint?.expectedFailingTests) ||
    []
  ).map((pal) => {
    const result = runLint(lint, {}, pal);
    return {
      result,
      pal,
      blame: result.kind === "success" ? result?.blameData : [],
    };
  }) as TestResult[];
  let requiredTagAdd = "";

  // $: currentLintAppliesToCurrentPalette = (lint?.requiredTags || []).every(
  //   (tag) =>
  //     currentPal.tags.map((x) => x.toLowerCase()).includes(tag.toLowerCase())
  // );
</script>

{#if !lint}
  <div
    class="flex justify-between bg-stone-200 h-12 items-center px-4 text-xl font-bold"
  >
    <div>Pick a Check to Customize</div>
    <NewLintSuggestion />
  </div>
  <div class="flex flex-col p-4">
    <div>
      {#each lints || [] as lint}
        <button
          class={""}
          on:click={() => {
            store.setFocusedLint(lint.id);
          }}
        >
          {lint.name}
        </button>
      {/each}
    </div>
  </div>
{/if}

{#if lint}
  <div class="flex flex-col w-full text-sm">
    <!-- TOP BAR -->
    <div
      class="flex justify-between bg-stone-200 h-12 items-center px-4 text-xl font-bold"
    >
      Customize Check

      <button
        class={""}
        on:click={() => {
          store.setFocusedLint(false);
        }}
      >
        Customize Another Check
      </button>
    </div>

    <div class="px-4 flex flex-col">
      <!-- MAIN CONTENT -->
      <div class="flex flex-col">
        <div class="font-bold">Name</div>
        <input
          class="ml-2 border border-gray-300 rounded px-2 py-1"
          type="text"
          value={lint.name}
          on:change={(e) => {
            // @ts-ignore
            const name = e.target.value;
            store.setCurrentLintName(name);
          }}
        />
      </div>
      <div class="flex flex-wrap">
        <!-- <div>
          <div class="font-bold">Lint Level</div>
          <select
            class="px-2"
            on:change={(e) => {
              // @ts-ignore
              store.setCurrentLintLevel(e.currentTarget.value);
            }}
            value={lint.level}
          >
            {#each ["error", "warning"] as level}
              <option value={level}>{level.toUpperCase()}</option>
            {/each}
          </select>
        </div> -->
        <div class="mx-2">
          <div class="font-bold">Group</div>
          <select value={lint.group} class="px-2">
            {#each ["usability", "color-accessibility", "contrast-accessibility", "design", "custom"] as group}
              <option
                value={group}
                on:change={(e) => {
                  // @ts-ignore
                  store.setCurrentLintGroup(e.currentTarget.value);
                }}
              >
                {group}
              </option>
            {/each}
          </select>
        </div>
        <!-- TASK TYPES -->
        <div class="flex flex-col">
          <div class="mr-2 font-bold">Task Types</div>
          <div class="flex flex-wrap">
            {#each taskTypes as taskType}
              <div class="flex items-center mr-4">
                <label>
                  <input
                    type="checkbox"
                    checked={currentTaskTypes.includes(taskType)}
                    on:change={(e) => {
                      const newTasks = currentTaskTypes.includes(taskType)
                        ? currentTaskTypes.filter((x) => x !== taskType)
                        : [...currentTaskTypes, taskType];
                      store.setCurrentLintTaskTypes(newTasks);
                    }}
                  />
                  {taskType}
                </label>
              </div>
            {/each}
          </div>
        </div>
        <!-- TAGS -->
        <div class="flex flex-col">
          <div class="flex">
            <div class="mr-2 font-bold">Required Tags</div>
            <Tooltip positionAlongRightEdge={true} targetBody={false}>
              <button class={""} slot="target" let:toggle on:click={toggle}>
                (Add tag)
              </button>

              <div class="" slot="content">
                <form
                  on:submit|preventDefault|stopPropagation={() => {
                    store.setCurrentTags([
                      ...lint.requiredTags,
                      requiredTagAdd,
                    ]);
                    requiredTagAdd = "";
                  }}
                >
                  <input
                    class="border-2 border-gray-300 rounded px-2 py-1"
                    type="text"
                    bind:value={requiredTagAdd}
                  />
                </form>
              </div>
            </Tooltip>
          </div>
          <div class="flex flex-wrap">
            {#each lint.requiredTags as tag}
              <div>
                {tag}
                <button
                  class={""}
                  on:click={() => {
                    const newTags = lint.requiredTags.filter((x) => x !== tag);
                    store.setCurrentTags(newTags);
                  }}
                >
                  X
                </button>
              </div>
            {/each}
          </div>
        </div>
      </div>
      <div class="px-2 py-2">
        {#if isBuiltInThatsBeenModified}
          <button
            class={""}
            on:click={() => {
              store.setCurrentLintProgram(builtInLint?.program || "");
            }}
          >
            Restore this lint to original version
          </button>
        {/if}
        <div class="flex">
          {#if showDeleteDoubleCheck}
            <div class="flex">
              <div>Are you sure you want to delete this check?</div>
              <button
                on:click={() => {
                  store.deleteLint(lint.id);
                  store.setFocusedLint(false);
                  showDeleteDoubleCheck = false;
                }}
                class={""}
              >
                Yes
              </button>
              <button
                on:click={() => (showDeleteDoubleCheck = false)}
                class={""}
              >
                No
              </button>
            </div>
          {:else}
            <button on:click={() => (showDeleteDoubleCheck = true)} class={""}>
              Delete this check
            </button>
          {/if}
          <button
            class={""}
            on:click={() => {
              const clonedId = newId();
              store.cloneLint(lint.id, clonedId);
              store.setFocusedLint(clonedId);
            }}
          >
            Clone this lint
          </button>
          <a
            class={""}
            target="_blank"
            href="https://color-buddy-docs.netlify.app/lang-docs.html"
          >
            Docs
          </a>
        </div>
      </div>

      <div>
        <div>Description</div>
        <textarea
          class="ml-2 border-2 border-gray-300 rounded px-2 py-1 w-full"
          value={lint.description}
          on:change={(e) => {
            // @ts-ignore
            const description = e.target.value;
            store.setCurrentLintDescription(description);
          }}
        />
      </div>
      <div>
        <div class="flex">
          <div class="">Error message</div>
          <div class="text-sm italic ml-4">
            {"If lint failures caused by specific color can mark them via {{blame}}"}
          </div>
        </div>
        <textarea
          class="ml-2 border-2 border-gray-300 rounded px-2 py-1 w-full"
          value={lint.failMessage}
          on:change={(e) => {
            // @ts-ignore
            const errorMessage = e.target.value;
            store.setCurrentLintFailMessage(errorMessage);
          }}
        />
      </div>

      <!-- {#if false && currentLintAppliesToCurrentPalette}

        {#if lintRun.kind === "success" && lintRun.passes}
          <div class="text-green-500">
            This lint passes for the current palette
          </div>
        {/if}
        {#if lintRun.kind === "success" && !lintRun.passes && !errors}
          <div>
            <div class="flex">
              <div class="text-red-500 mr-2">
                This lint fails for the current palette.
              </div>
              The following colors are blamed. Using
              <select
                value={lint.blameMode}
                class="mx-2"
                on:change={() => {
                  // @ts-ignore
                  store.setCurrentLintBlameMode(event.target.value);
                }}
              >
                <option>none</option>
                <option>single</option>
                <option>pair</option>
              </select>
              Blame mode
            </div>
            {#if lint.blameMode === "pair"}
              <div class="flex flex-wrap">
                {#each pairData as pair}
                  <div class="mr-2 mb-1 border-2 border-black rounded">
                    <PalPreview
                      pal={{
                        ...currentPal,
                        colors: pair.map((x) => currentPal.colors[x]),
                      }}
                      allowModification={false}
                    />
                  </div>
                {/each}
              </div>
            {:else}
              <PalPreview
                pal={{
                  ...currentPal,
                  colors: blameData
                    .flatMap((x) => x)
                    .map((x) => currentPal.colors[x]),
                }}
                allowModification={false}
              />
            {/if}
          </div>
        {/if}
      {:else}
        <div class="text-red-500">
          This lint does not apply to the current palette due to a mismatch
          between its tags and the palette's tags
        </div>
      {/if} -->
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
          class={""}
          on:click={() => {
            store.setCurrentLintProgram(JSON.stringify(program) || "");
          }}
        >
          Clean up Program
        </button>
      </div>
      <MonacoEditor
        value={program}
        onChange={(x) => {
          store.setCurrentLintProgram(x);
        }}
        language="json"
      />
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
        <div class="flex flex-col">
          <div class="font-bold">Test Cases</div>
          <div>
            <Nav
              tabs={["Show", "Hide"]}
              isTabSelected={(x) => (showTestCases ? "Show" : "Hide") === x}
              selectTab={(x) => {
                showTestCases = x === "Show";
              }}
            />
          </div>
        </div>
      </div>

      <div>
        {#if showTestCases}
          <div class="flex">
            <div class="flex flex-col w-1/2">
              <div class="flex">
                <div class="font-bold">Expected to be passing:</div>
                <LintCustomizationAddTest
                  currentTests={lint.expectedPassingTests}
                  setNewTests={(tests) =>
                    store.setCurrentLintExpectedPassingTests(tests)}
                />
              </div>
              <div class="flex">
                {#each passingTestResults as passing, idx}
                  <div class="flex flex-col w-fit">
                    <LintCustomizationPreview
                      removeCase={() => {
                        const newTests = [...lint.expectedPassingTests].filter(
                          (_, i) => i !== idx
                        );
                        store.setCurrentLintExpectedPassingTests(newTests);
                      }}
                      pal={passing.pal}
                      blamedSet={new Set(passing.blame)}
                      updatePal={(newPal) => {
                        const newTests = [...lint.expectedPassingTests];
                        newTests[idx] = newPal;
                        store.setCurrentLintExpectedPassingTests(newTests);
                      }}
                    />
                    {#if passing.result.kind === "success" && passing.result?.passes}
                      <div class="text-green-500">Correct</div>
                    {:else}
                      <div class="text-red-500">Incorrect</div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
            <div class="flex flex-col w-1/2">
              <div class="flex">
                <div class="font-bold">Expected to be failing</div>
                <LintCustomizationAddTest
                  currentTests={lint.expectedFailingTests}
                  setNewTests={(tests) =>
                    store.setCurrentLintExpectedFailingTests(tests)}
                />
              </div>
              <div class="flex">
                {#each failingTestResults as failing, idx}
                  <div class="flex flex-col w-fit">
                    <LintCustomizationPreview
                      pivotRight={true}
                      removeCase={() => {
                        const newTests = [...lint.expectedFailingTests].filter(
                          (_, i) => i !== idx
                        );
                        store.setCurrentLintExpectedFailingTests(newTests);
                      }}
                      pal={failing.pal}
                      blamedSet={new Set(failing.blame)}
                      updatePal={(newPal) => {
                        const newTests = [...lint.expectedFailingTests];
                        newTests[idx] = newPal;
                        store.setCurrentLintExpectedFailingTests(newTests);
                      }}
                    />
                    {#if failing.result.kind === "success"}
                      {#if !failing.result?.passes}
                        <div class="text-green-500">Correct</div>
                      {:else}
                        <div class="text-red-500">Incorrect</div>
                      {/if}
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          </div>
          <div class="italic">Items marked with dashed sides are blamed</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

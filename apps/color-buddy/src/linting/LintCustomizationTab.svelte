<script lang="ts">
  import lintStore, { newId } from "../stores/lint-store";
  import { PREBUILT_LINTS, linter } from "color-buddy-palette-lint";
  import type { Palette } from "color-buddy-palette";
  import type { LintResult, LintProgram } from "color-buddy-palette-lint";

  import colorStore from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";

  import MonacoEditor from "../components/MonacoEditor.svelte";
  import Nav from "../components/Nav.svelte";
  import PalPreview from "../components/PalPreview.svelte";
  import { buttonStyle } from "../lib/styles";
  import { JSONStringify } from "../lib/utils";

  import LintCustomizationPreview from "./LintCustomizationPreview.svelte";
  import NewLintSuggestion from "./NewLintSuggestion.svelte";
  import LintCustomizationAddTest from "./LintCustomizationAddTest.svelte";
  export let maxWidth: number;

  $: lint = $lintStore.lints.find(
    (lint) => lint.id === $lintStore.focusedLint
  )!;
  $: program = lint ? lint.program : "";

  $: builtInLint = PREBUILT_LINTS.find((x) => x.id === $lintStore.focusedLint);
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
      lintStore.setFocusedLint(false);
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
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: lintRun = runLint(lint, { debugCompare }, currentPal);

  $: currentTaskTypes = lint?.taskTypes || ([] as string[]);

  $: blameData = (lintRun.kind === "success" && lintRun.blameData) || [];
  $: pairData = blameData as number[][];
  const taskTypes = ["sequential", "diverging", "categorical"] as const;

  $: lints = $lintStore.lints;
  $: lintsByGroup = lints.reduce(
    (acc, lint) => {
      acc[lint.group] = acc[lint.group] || [];
      acc[lint.group].push(lint);
      return acc;
    },
    {} as Record<string, (typeof lints)[number][]>
  );
  // sort lints by group
  $: sortedLintsByGroup = Object.keys(lintsByGroup).reduce(
    (acc, key) => {
      acc[key] = lintsByGroup[key].sort((a, b) => a.name.localeCompare(b.name));
      return acc;
    },
    {} as Record<string, (typeof lints)[number][]>
  );

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

  $: currentLintAppliesToCurrentPalette = (lint?.requiredTags || []).every(
    (tag) =>
      currentPal.tags.map((x) => x.toLowerCase()).includes(tag.toLowerCase())
  );
</script>

{#if !lint}
  <div class="flex flex-col p-4">
    <div class="font-bold">Select a lint</div>
    <NewLintSuggestion />
    <div>
      {#each Object.keys(sortedLintsByGroup) as group}
        <div class="font-bold">{group}</div>
        {#each sortedLintsByGroup[group] as lint}
          <button
            class={buttonStyle}
            on:click={() => {
              lintStore.setFocusedLint(lint.id);
            }}
          >
            {lint.name}
          </button>
        {/each}
      {/each}
    </div>
  </div>
{/if}

{#if lint}
  <div class="flex flex-col w-full text-sm">
    <!-- TOP BAR -->
    <div class="flex justify-between bg-stone-200 h-12 items-center px-4">
      <button
        class={buttonStyle}
        on:click={() => {
          lintStore.setFocusedLint(false);
        }}
      >
        Deselect
      </button>
      {#if isBuiltInThatsBeenModified}
        <button
          class={buttonStyle}
          on:click={() => {
            lintStore.setCurrentLintProgram(builtInLint?.program || "");
          }}
        >
          Restore this lint to original version
        </button>
      {/if}
      <div class="flex">
        {#if showDeleteDoubleCheck}
          <div class="flex">
            <div>Are you sure you want to delete this lint?</div>
            <button
              on:click={() => {
                lintStore.deleteLint(lint.id);
                lintStore.setFocusedLint(false);
                showDeleteDoubleCheck = false;
              }}
              class={buttonStyle}
            >
              Yes
            </button>
            <button
              on:click={() => (showDeleteDoubleCheck = false)}
              class={buttonStyle}
            >
              No
            </button>
          </div>
        {:else}
          <button
            on:click={() => (showDeleteDoubleCheck = true)}
            class={buttonStyle}
          >
            Delete this lint
          </button>
        {/if}
        <button
          class={buttonStyle}
          on:click={() => {
            const clonedId = newId();
            lintStore.cloneLint(lint.id, clonedId);
            lintStore.setFocusedLint(clonedId);
          }}
        >
          Clone this lint
        </button>
        <a
          class={buttonStyle}
          target="_blank"
          href="https://color-buddy-docs.netlify.app/lang-docs.html"
        >
          Docs
        </a>
      </div>
    </div>

    <div class="px-4 flex flex-col" style={`max-width: ${maxWidth}px`}>
      <!-- MAIN CONTENT -->
      <div class="flex flex-col">
        <div class="font-bold">Lint Name:</div>
        <input
          class="ml-2 border border-gray-300 rounded px-2 py-1"
          type="text"
          value={lint.name}
          on:change={(e) => {
            // @ts-ignore
            const name = e.target.value;
            lintStore.setCurrentLintName(name);
          }}
        />
      </div>
      <div class="flex flex-wrap">
        <div>
          <div class="font-bold">Lint Level:</div>
          <select
            class="px-2"
            on:change={(e) => {
              // @ts-ignore
              lintStore.setCurrentLintLevel(e.currentTarget.value);
            }}
            value={lint.level}
          >
            {#each ["error", "warning"] as level}
              <option value={level}>{level.toUpperCase()}</option>
            {/each}
          </select>
        </div>
        <div class="mx-4">
          <div class="font-bold">Lint Group:</div>
          <select value={lint.group} class="px-2">
            {#each ["usability", "accessibility", "design", "custom"] as group}
              <option
                value={group}
                on:change={(e) => {
                  // @ts-ignore
                  lintStore.setCurrentLintGroup(e.currentTarget.value);
                }}
              >
                {group}
              </option>
            {/each}
          </select>
        </div>
        <!-- TASK TYPES -->
        <div class="flex flex-col">
          <div class="mr-2 font-bold">Task Types:</div>
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
                      lintStore.setCurrentLintTaskTypes(newTasks);
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
            <Tooltip positionAlongRightEdge={true}>
              <button
                class={`${buttonStyle} px-0`}
                slot="target"
                let:toggle
                on:click={toggle}
              >
                (Add tag)
              </button>

              <div class="" slot="content">
                <form
                  on:submit|preventDefault|stopPropagation={() => {
                    lintStore.setCurrentTags([
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
                  class={buttonStyle}
                  on:click={() => {
                    const newTags = lint.requiredTags.filter((x) => x !== tag);
                    lintStore.setCurrentTags(newTags);
                  }}
                >
                  X
                </button>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div>
        <div class="font-bold">Lint Description:</div>
        <textarea
          class="ml-2 border-2 border-gray-300 rounded px-2 py-1 w-full"
          value={lint.description}
          on:change={(e) => {
            // @ts-ignore
            const description = e.target.value;
            lintStore.setCurrentLintDescription(description);
          }}
        />
      </div>
      <div>
        <div class="flex">
          <div class="font-bold">Lint Error Message:</div>
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
            lintStore.setCurrentLintFailMessage(errorMessage);
          }}
        />
      </div>

      {#if currentLintAppliesToCurrentPalette}
        <!-- <div class="font-bold">
        Current Palette:
        <PalPreview pal={currentPal} allowModification={false} />
      </div> -->
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
                  lintStore.setCurrentLintBlameMode(event.target.value);
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
      {/if}
      {#if errors}
        <div class="text-red-500">{errors.message}</div>
      {/if}

      {#if lintRun.kind === "success"}
        <div>
          <div class="font-bold">Lint Self Description (from the program):</div>
          <div>{lintRun?.naturalLanguageProgram}</div>
        </div>
      {/if}
      <div class="flex justify-between">
        <div class="font-bold">Lint Program</div>
        <button
          class={buttonStyle}
          on:click={() => {
            lintStore.setCurrentLintProgram(JSONStringify(program) || "");
          }}
        >
          Clean up Program
        </button>
      </div>
      <MonacoEditor
        value={program}
        onChange={(x) => {
          lintStore.setCurrentLintProgram(x);
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
                  {currentPal}
                  setNewTests={(tests) =>
                    lintStore.setCurrentLintExpectedPassingTests(tests)}
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
                        lintStore.setCurrentLintExpectedPassingTests(newTests);
                      }}
                      pal={passing.pal}
                      blamedSet={new Set(passing.blame)}
                      updatePal={(newPal) => {
                        const newTests = [...lint.expectedPassingTests];
                        newTests[idx] = newPal;
                        lintStore.setCurrentLintExpectedPassingTests(newTests);
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
                  {currentPal}
                  setNewTests={(tests) =>
                    lintStore.setCurrentLintExpectedFailingTests(tests)}
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
                        lintStore.setCurrentLintExpectedFailingTests(newTests);
                      }}
                      pal={failing.pal}
                      blamedSet={new Set(failing.blame)}
                      updatePal={(newPal) => {
                        const newTests = [...lint.expectedFailingTests];
                        newTests[idx] = newPal;
                        lintStore.setCurrentLintExpectedFailingTests(newTests);
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

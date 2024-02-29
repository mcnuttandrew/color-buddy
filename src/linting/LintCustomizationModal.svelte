<script lang="ts">
  import lintStore, { newId } from "../stores/lint-store";
  import { BUILT_INS } from "../lib/linter";
  import colorStore from "../stores/color-store";

  import Modal from "../components/Modal.svelte";
  import MonacoEditor from "../components/MonacoEditor.svelte";
  import Nav from "../components/Nav.svelte";
  import PalPreview from "../components/PalPreview.svelte";
  import { CreateCustomLint } from "../lib/CustomLint";
  import { buttonStyle } from "../lib/styles";
  import { JSONStringify } from "../lib/utils";
  import type { CustomLint } from "../lib/CustomLint";
  import { affects, contexts } from "../types";

  // export let onClose: () => void;

  $: lint = $lintStore.lints.find(
    (lint) => lint.id === $lintStore.focusedLint
  )!;
  $: program = lint ? lint.program : "";

  $: builtInLint = BUILT_INS.find((x) => x.id === $lintStore.focusedLint);
  $: isBuiltInThatsBeenModified =
    builtInLint && lint?.program !== builtInLint?.program;

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  // run this lint
  let errors: any = null;
  function runLint(lint: CustomLint, options: any) {
    if (!lint) {
      // onClose();
      return;
    }
    try {
      const customLint = CreateCustomLint(lint);
      const result = new customLint(currentPal).run(options);
      errors = null;
      return result;
    } catch (e) {
      errors = e;
    }
  }
  let debugCompare = false;
  $: lintRun = runLint(lint, { debugCompare });
  let showDoubleCheck = false;

  $: currentTaskTypes = lint?.taskTypes || ([] as string[]);
  $: currentAffects = lint?.affectTypes || ([] as string[]);
  $: currentContexts = lint?.contextTypes || ([] as string[]);

  $: checkData = lintRun?.checkData || [];
  $: pairData = checkData as number[][];
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
</script>

{#if !lint}
  <div class="flex flex-col p-4">
    <div class="font-bold">Select a lint</div>
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
  <!-- <Modal
    showModal={true}
    closeModal={() => {
      lintStore.setFocusedLint(false);
      onClose();
    }}
  > -->
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
        {#if showDoubleCheck}
          <div class="flex">
            <div>Are you sure you want to delete this lint?</div>
            <button
              on:click={() => {
                lintStore.deleteLint(lint.id);
                lintStore.setFocusedLint(false);
              }}
              class={buttonStyle}
            >
              Yes
            </button>
            <button
              on:click={() => (showDoubleCheck = false)}
              class={buttonStyle}
            >
              No
            </button>
          </div>
        {:else}
          <button on:click={() => (showDoubleCheck = true)} class={buttonStyle}>
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
        <a class={buttonStyle} target="_blank" href="./lang-docs.md">Docs</a>
      </div>
    </div>

    <div class="px-4 flex flex-col">
      <!-- MAIN CONTENT -->
      <div class="flex">
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
      <div class="flex">
        <div class="font-bold">Lint Level:</div>
        <Nav
          tabs={["error", "warning"]}
          isTabSelected={(x) => x === lint.level}
          selectTab={(x) => {
            // @ts-ignore
            lintStore.setCurrentLintLevel(x);
          }}
        />
      </div>
      <div class="flex">
        <div class="font-bold">Lint Group:</div>
        <Nav
          tabs={["usability", "accessibility", "design", "custom"]}
          isTabSelected={(x) => x === lint.group}
          selectTab={(x) => lintStore.setCurrentLintGroup(x)}
        />
      </div>
      <!-- TASK TYPES -->
      <div class="flex">
        <div class="mr-2 font-bold">Lint Task Types:</div>
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
      <!-- AFFECTS -->
      <div class="flex">
        <div class="mr-2 font-bold">Affects:</div>
        <div class="flex flex-wrap">
          {#each affects as affectType}
            <div class="flex items-center mr-4">
              <label>
                <input
                  type="checkbox"
                  checked={currentAffects.includes(affectType)}
                  on:change={(e) => {
                    const newAffects = currentAffects.includes(affectType)
                      ? currentAffects.filter((x) => x !== affectType)
                      : [...currentAffects, affectType];
                    lintStore.setCurrentAffects(newAffects);
                  }}
                />
                {affectType}
              </label>
            </div>
          {/each}
        </div>
      </div>

      <!-- CONTEXTS -->
      <div class="flex">
        <div class="mr-2 font-bold">Contexts:</div>
        <div class="flex flex-wrap">
          {#each contexts as context}
            <div class="flex items-center mr-4">
              <label>
                <input
                  type="checkbox"
                  checked={currentContexts.includes(context)}
                  on:change={(e) => {
                    const newContext = currentContexts.includes(context)
                      ? currentContexts.filter((x) => x !== context)
                      : [...currentContexts, context];
                    lintStore.setCurrentContext(newContext);
                  }}
                />
                {context}
              </label>
            </div>
          {/each}
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
        <div class="font-bold">Lint Error Message:</div>
        <div class="text-sm italic">
          {"If failures of your lint rule can be attributed to a specific color or colors, include {{blame}} in this message"}
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
      <div class="flex">
        Show Compare Debug In Terminal
        <Nav
          tabs={["Show", "Hide"]}
          isTabSelected={(x) => (debugCompare ? "Show" : "Hide") === x}
          selectTab={(x) => {
            debugCompare = x === "Show";
          }}
        />
      </div>
      <!-- <div class="font-bold">
        Current Palette:
        <PalPreview pal={currentPal} allowModification={false} />
      </div> -->
      {#if lintRun?.passes}
        <div class="text-green-500">
          This lint passes for the current palette
        </div>
      {/if}
      {#if !lintRun?.passes && !errors}
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
                colors: checkData
                  .flatMap((x) => x)
                  .map((x) => currentPal.colors[x]),
              }}
              allowModification={false}
            />
          {/if}
        </div>
      {/if}
      {#if errors}
        <div class="text-red-500">{errors.message}</div>
      {/if}

      <div>
        <div class="font-bold">Test Cases</div>
      </div>
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
    </div>
  </div>
  <!-- </Modal> -->
{/if}

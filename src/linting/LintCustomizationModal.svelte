<script lang="ts">
  import lintStore from "../stores/lint-store";
  import colorStore from "../stores/color-store";

  import Modal from "../components/Modal.svelte";
  import MonacoEditor from "../components/MonacoEditor.svelte";
  import Nav from "../components/Nav.svelte";
  import PalPreview from "../components/PalPreview.svelte";
  import { CreateCustomLint } from "../lib/lints/CustomLint";

  $: lint = $lintStore.lints.find(
    (lint) => lint.id === $lintStore.focusedLint
  )!;
  $: program = lint?.program ?? "";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  // run this lint
  $: customLint = CreateCustomLint(lint);
  $: lintRun = new customLint(currentPal).run();
</script>

{#if lint}
  <Modal
    showModal={true}
    closeModal={() => {
      lintStore.setFocusedLint(false);
    }}
  >
    <div class="flex flex-col container">
      <div class="font-bold text-lg">Customize Lint</div>
      <div class="flex">
        <div>Lint Name:</div>
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
        <div>Lint Level:</div>
        <Nav
          tabs={["error", "warning"]}
          isTabSelected={(x) => x === lint.level}
          selectTab={(x) => {
            // @ts-ignore
            lintStore.setCurrentLintLevel(x);
          }}
        />
      </div>
      <div>
        <div>Lint Description:</div>
        <textarea
          class="ml-2 border border-gray-300 rounded px-2 py-1 w-full"
          value={lint.description}
          on:change={(e) => {
            // @ts-ignore
            const description = e.target.value;
            lintStore.setCurrentLintDescription(description);
          }}
        />
      </div>
      <div>
        <div>Lint Error Message:</div>
        <div class="text-sm italic">
          {"If failures of your lint rule can be attributed to a specific color or colors, include {{blame}} in this message"}
        </div>
        <textarea
          class="ml-2 border border-gray-300 rounded px-2 py-1 w-full"
          value={lint.failMessage}
          on:change={(e) => {
            // @ts-ignore
            const errorMessage = e.target.value;
            lintStore.setCurrentLintFailMessage(errorMessage);
          }}
        />
      </div>
      <div>Lint Program</div>
      <MonacoEditor
        value={program}
        onChange={(x) => {
          lintStore.setCurrentLintProgram(x);
        }}
        language="json"
      />
      <div>
        Current Palette:
        <PalPreview pal={currentPal} allowModification={false} />
      </div>
      {#if lintRun.passes}
        <div class="text-green-500">This lint passes</div>
      {/if}
      {#if !lintRun.passes}
        <div>
          <div class="flex">
            <div class="text-red-500 mr-2">
              This lint fails for the current palette.
            </div>
            The following colors are blamed:
          </div>
          <PalPreview
            pal={{
              ...currentPal,
              colors: lintRun.checkData.map((x) => currentPal.colors[x]),
            }}
            allowModification={false}
          />
        </div>
      {/if}
    </div>
  </Modal>
{/if}

<style>
  .container {
    min-width: 800px;
    min-height: 800px;
  }
</style>

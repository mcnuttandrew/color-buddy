<script lang="ts">
  import store from "../stores/store";
  import type { TestResult } from "../lib/utils";
  import PalPreview from "../components/PalPreview.svelte";
  export let idx: number;
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";

  export let testResult: TestResult;
  export let type: "passing" | "failing";
</script>

<div class="border rounded px-2 mx-2">
  <div class="flex justify-between">
    <div class="text-xs">
      {#if testResult.result.kind === "success" && ((type === "passing" && testResult.result?.passes) || (type === "failing" && !testResult.result?.passes))}
        <div class="text-green-500">Correct</div>
      {:else if testResult.result.kind === "success"}
        <div class="text-red-500">Incorrect</div>
      {:else}
        <div class="text-yellow-500">{testResult.result.kind}</div>
      {/if}
    </div>
    <Tooltip>
      <div slot="content">
        <button
          class={buttonStyle}
          on:click={() => {
            const lint = $store.lints.find(
              (lint) => lint.id === $store.focusedLint
            );
            if (!lint) return;
            if (type === "passing") {
              store.setCurrentLintExpectedFailingTests([
                ...lint.expectedFailingTests,
                testResult.pal,
              ]);
              store.setCurrentLintExpectedPassingTests(
                lint.expectedPassingTests.filter((_, jdx) => idx !== jdx)
              );
            } else {
              store.setCurrentLintExpectedPassingTests([
                ...lint.expectedPassingTests,
                testResult.pal,
              ]);
              store.setCurrentLintExpectedFailingTests(
                lint.expectedFailingTests.filter((_, jdx) => idx !== jdx)
              );
            }
          }}
        >
          Move to {type === "passing" ? "failing" : "passing"}
        </button>
        <button
          class={buttonStyle}
          on:click={() => {
            const lint = $store.lints.find(
              (lint) => lint.id === $store.focusedLint
            );
            if (!lint) return;
            if (type === "passing") {
              store.setCurrentLintExpectedPassingTests(
                lint.expectedPassingTests.filter((_, jdx) => idx !== jdx)
              );
            } else {
              store.setCurrentLintExpectedFailingTests(
                lint.expectedFailingTests.filter((_, jdx) => idx !== jdx)
              );
            }
          }}
        >
          Delete
        </button>
      </div>

      <button slot="target" let:toggle on:click={toggle}>⚙️</button>
    </Tooltip>
  </div>

  <button
    class="flex min-w-16"
    on:click={() => {
      store.setFocusedTest({ type, index: idx });
    }}
  >
    <PalPreview pal={testResult.pal} showTags={true} />
  </button>
</div>

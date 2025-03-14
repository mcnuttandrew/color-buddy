<script lang="ts">
  import { suggestMCFix } from "color-buddy-palette-lint";

  import store from "../stores/store";

  import type { TestResult } from "../lib/utils";
  import PalPreview from "../components/PalPreview.svelte";
  import Tooltip from "../components/Tooltip.svelte";

  export let idx: number;
  import { buttonStyle } from "../lib/styles";
  export let testResult: TestResult;
  export let type: "passing" | "failing";

  let mcState = "ready" as "ready" | "loading" | "error";

  let isCorrect =
    testResult.result.kind === "success" &&
    ((type === "passing" && testResult.result?.passes) ||
      (type === "failing" && !testResult.result?.passes));
</script>

<div class="border rounded px-2 mx-2">
  <div class="flex justify-between">
    <div class="text-xs">
      {#if isCorrect}
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
              store.setCurrentLintExpectedPassingTests([
                ...lint.expectedPassingTests,
                testResult.pal,
              ]);
            } else {
              store.setCurrentLintExpectedFailingTests([
                ...lint.expectedFailingTests,
                testResult.pal,
              ]);
            }
          }}
        >
          Duplicate
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

        {#if !isCorrect}
          <button
            class={buttonStyle}
            on:click={async () => {
              mcState = "loading";
              const lint = $store.lints.find(
                (lint) => lint.id === $store.focusedLint
              );
              if (!lint) return;
              const program = lint.program;
              let parsedProgram = JSON.parse(program);
              if (type === "failing") {
                parsedProgram = { not: parsedProgram };
                lint.program = JSON.stringify(parsedProgram);
              }
              const fix = await suggestMCFix(testResult.pal, [lint]);
              lint.program = program;
              if (fix) {
                const tests =
                  type === "passing"
                    ? lint.expectedPassingTests
                    : lint.expectedFailingTests;
                const updatedTests = tests.map((pal, jdx) =>
                  jdx === idx ? fix : pal
                );
                type === "passing"
                  ? store.setCurrentLintExpectedPassingTests(updatedTests)
                  : store.setCurrentLintExpectedFailingTests(updatedTests);

                mcState = "ready";
              } else {
                console.log("no fix found");
                mcState = "error";
              }
            }}
          >
            {#if mcState === "loading"}
              Processing
            {:else if mcState === "error"}
              No fix found
            {:else}
              Attempt to fix
            {/if}
          </button>
        {/if}
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

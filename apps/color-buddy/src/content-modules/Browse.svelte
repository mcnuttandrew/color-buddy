<script lang="ts">
  import examplePalStore from "../stores/example-palette-store";
  import lintStore from "../stores/lint-store";
  import configStore from "../stores/config-store";

  import { onMount } from "svelte";

  import type { LintResult } from "@color-buddy/palette-lint";

  import MiniPalPreview from "../components/MiniPalPreview.svelte";
  import { lint } from "../lib/api-calls";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";

  onMount(async () => {
    // wait for the palettes to be loaded
    while ($examplePalStore.palettes.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    computeLints(false);
  });
  function computeLints(breakLint: boolean) {
    $examplePalStore.palettes.forEach(async (pal, index) => {
      if (!breakLint && pal.lints.length > 0) {
        return;
      }
      lint(pal.palette, false).then((res) => {
        examplePalStore.postLint(index, res);
      });
    });
  }

  //   todo add the local ones as well
  const lintMarks = {
    pass: "✅",
    fail: "❌",
    warn: "⚠️",
  };
  $: pals = $examplePalStore.palettes;

  $: allEvaluatedLints = pals.reduce(
    (acc, pal) => {
      pal.lints.forEach((lint) => {
        acc[lint.lintProgram.name] = lint;
      });
      return acc;
    },
    {} as Record<string, LintResult>
  );
  let disAllowedLints = new Set<string>();

  $: filteredPals = pals;
  let sortedBy = "natural";
  $: console.log(allEvaluatedLints, disAllowedLints);
</script>

<div class="flex flex-col p-4">
  <div class="flex">
    <button
      class={buttonStyle}
      on:click={() =>
        (disAllowedLints = new Set(Object.keys(allEvaluatedLints)))}
    >
      Hide all
    </button>
    <button
      class={buttonStyle}
      on:click={() => (disAllowedLints = new Set([]))}
    >
      Show all
    </button>
    <button
      class={buttonStyle}
      on:click={() => (filteredPals = $examplePalStore.palettes)}
    >
      reset filters
    </button>
    <button class={buttonStyle} on:click={() => computeLints(true)}>
      Re run lints
    </button>
  </div>
  <div class="flex flex-col flex-wrap max-h-80">
    {#each Object.values(allEvaluatedLints) as lint}
      <div class="px-2 flex">
        <button
          class={buttonStyle}
          on:click={() => {
            if (disAllowedLints.has(lint.lintProgram.name)) {
              disAllowedLints.delete(lint.lintProgram.name);
            } else {
              disAllowedLints.add(lint.lintProgram.name);
            }
            disAllowedLints = disAllowedLints;
          }}
        >
          {#if disAllowedLints.has(lint.lintProgram.name)}❌{:else}✅{/if}
        </button>
        <div class="text-sm">{lint.lintProgram.name}</div>
        {#if !lint.lintProgram.customProgram}
          <button
            class={buttonStyle}
            on:click={() => {
              lintStore.setFocusedLint(lint.lintProgram.id);
              configStore.setEvalDisplayMode("lint-customization");
            }}
          >
            Customize
          </button>
        {/if}
        <button
          class={buttonStyle}
          on:click={() => {
            filteredPals = filteredPals.filter((pal) => {
              const thisLint = pal.lints.find(
                (l) => l.lintProgram.name === lint.lintProgram.name
              );
              return thisLint?.passes;
            });
          }}
        >
          Show only passing
        </button>
        <button
          class={buttonStyle}
          on:click={() => {
            filteredPals = filteredPals.filter((pal) => {
              const thisLint = pal.lints.find(
                (l) => l.lintProgram.name === lint.lintProgram.name
              );
              return !thisLint?.passes;
            });
          }}
        >
          Show only failing
        </button>
        <button
          class={buttonStyle}
          on:click={() => {
            if (sortedBy === lint.lintProgram.name) {
              sortedBy = `${lint.lintProgram.name}-reverse`;
              filteredPals = filteredPals.sort((a, b) =>
                b.lints.find(
                  (x) => x.lintProgram.name === lint.lintProgram.name
                )?.passes
                  ? 1
                  : -1
              );
            } else {
              sortedBy = lint.lintProgram.name;
              filteredPals = filteredPals.sort((a, b) =>
                a.lints.find(
                  (x) => x.lintProgram.name === lint.lintProgram.name
                )?.passes
                  ? 1
                  : -1
              );
            }
          }}
        >
          Sort by
        </button>
      </div>
    {/each}
  </div>
</div>
<div class="flex flex-col h-full overflow-scroll px-4">
  <div class="w-full flex">
    <div class="font-bold w-40">
      Name (
      <button
        on:click={() => {
          if (sortedBy === "name") {
            sortedBy = "name-reverse";
            filteredPals = filteredPals.sort((a, b) =>
              b.palette.name.localeCompare(a.palette.name)
            );
          } else {
            sortedBy = "name";
            filteredPals = filteredPals.sort((a, b) =>
              a.palette.name.localeCompare(b.palette.name)
            );
          }
        }}
      >
        Sort
      </button>
      )
    </div>
    <div class="font-bold w-40">
      Type (
      <button
        on:click={() => {
          if (sortedBy === "type") {
            sortedBy = "type-reverse";
            filteredPals = filteredPals.sort((a, b) =>
              b.palette.type.localeCompare(a.palette.type)
            );
          } else {
            sortedBy = "type";
            filteredPals = filteredPals.sort((a, b) =>
              a.palette.type.localeCompare(b.palette.type)
            );
          }
        }}
      >
        Sort
      </button>
      )
    </div>
    <div class="font-bold w-80">Colors</div>
    <div class="font-bold w-40">Lints</div>
  </div>
  <div class="flex flex-col w-full">
    {#each filteredPals as pal, idx (pal.palette.name)}
      <div class="w-full flex">
        <div class="w-40 flex">
          <Tooltip>
            <div slot="content">
              <div class="font-bold">Colors</div>
              <div>
                {pal.palette.colors.map((x) => x.color.toHex()).join(", ")}
              </div>
              <div class="font-bold">Controls</div>
              <button
                class={buttonStyle}
                on:click={() => {
                  filteredPals = filteredPals.filter((x, jdx) => idx !== jdx);
                }}
              >
                Hide
              </button>
            </div>
            <button slot="target" let:toggle on:click={toggle}>⏎</button>
          </Tooltip>
          <span>{pal.palette.name}</span>
        </div>
        <div class="w-40">
          {pal.palette.type}
        </div>
        <div class="w-80">
          <MiniPalPreview
            pal={pal.palette}
            opacityClass=""
            className="max-w-xs"
            onClick={() => {}}
          />
        </div>
        <div class="flex">
          {#each pal.lints as lint}
            {#if !disAllowedLints.has(lint.lintProgram.name)}
              <Tooltip>
                <div slot="content">
                  <div class="font-bold">{lint.lintProgram.name}</div>
                  <div>{lint.lintProgram.description}</div>
                </div>
                <button
                  slot="target"
                  let:toggle
                  on:click={toggle}
                  class:border-2={sortedBy === lint.lintProgram.name ||
                    sortedBy === `${lint.lintProgram.name}-reverse`}
                >
                  {#if lint.passes}
                    <div>{lintMarks.pass}</div>
                  {:else if lint.lintProgram.level === "warning"}
                    <div>{lintMarks.warn}</div>
                  {:else}
                    <div>{lintMarks.fail}</div>
                  {/if}
                </button>
              </Tooltip>
            {/if}
          {/each}
          {#if pal.lints.length === 0}
            <div>🤷Loading</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

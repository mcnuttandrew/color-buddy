<script lang="ts">
  import exampleStore from "../stores/example-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import BrowseCard from "./BrowseCard.svelte";
  import { buttonStyle, simpleTooltipRowStyle } from "../lib/styles";
  import Swatches from "./Swatches.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import Nav from "../components/Nav.svelte";
  import NewExampleModal from "./NewExampleModal.svelte";
  import ColorSimControl from "./ColorSimControl.svelte";

  import ChevDown from "virtual:icons/fa6-solid/angle-down";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  let editTarget = null as null | number;

  $: examples = $exampleStore.examples;

  $: allSelected = examples.every((x) => !x.hidden);
  $: exampleShowMap = examples.map((x: any) => {
    if (x.hidden) {
      return false;
    }
    if (!allSelected) return true;
    if ($configStore.exampleRoute === "svg" && x?.svg) {
      return true;
    }
    if ($configStore.exampleRoute === "vega" && x.vega) {
      return true;
    }
    return false;
  });
  $: selectedExamples = examples.filter((_, idx) => exampleShowMap[idx]);
  $: exampleName =
    selectedExamples.length > 1
      ? "All"
      : selectedExamples.at(0)?.name || "None";

  const navNameMap = {
    svg: "SVG",
    vega: "Visualizations (via Vega)",
    // swatches: "Swatches",
  } as any;
  const navNameMapRev = Object.keys(navNameMap).reduce((acc, key) => {
    acc[navNameMap[key]] = key;
    return acc;
  }, {} as any);

  function makeOperations(idx: number, name: string) {
    return [
      {
        name: "Edit...",
        action: () => {
          editTarget = idx;
        },
        closeOnClick: true,
      },
      {
        name: "Delete",
        action: () => exampleStore.deleteExample(idx),
        closeOnClick: true,
      },
      {
        name: "Duplicate",
        action: () => exampleStore.duplicateExample(idx),
        closeOnClick: true,
      },
      {
        name: "Hide",
        action: () => exampleStore.toggleHidden(idx),
        closeOnClick: true,
      },

      // !exampleIsSoled && {
      //   name: "Focus (Expand & hide others)",
      //   action: () => {
      //     exampleStore.hideAllExcept(idx);
      //     exampleStore.setExampleSize(idx, 600);
      //   },
      //   closeOnClick: true,
      // },
      // exampleIsSoled && {
      //   name: "Unfocus (show all examples)",
      //   action: () => {
      //     exampleStore.restoreHiddenExamples();
      //     exampleStore.setExampleSize(idx, 250);
      //   },
      //   closeOnClick: true,
      // },
      // {
      //   name: "Expand",
      //   action: () => exampleStore.setExampleSize(idx, 600),
      //   condition: size !== 600,
      // },
      // {
      //   name: "Reset size",
      //   action: () => exampleStore.setExampleSize(idx, 250),
      //   condition: size !== 250,
      // },
      // {
      //   name: "Shrink",
      //   action: () => exampleStore.setExampleSize(idx, 50),
      //   condition: size !== 50,
      // },
    ].filter((x) => x) as any[] as {
      name: string;
      action: () => void;
      closeOnClick: boolean;
    }[];
  }
</script>

<div class="flex bg-stone-200 px-4 py-2 items-end">
  <div class="flex flex-col mr-2">
    <div class="text-sm">Examples</div>
    <Nav
      tabs={Object.values(navNameMap)}
      isTabSelected={(x) => navNameMapRev[x] === $configStore.exampleRoute}
      selectTab={(x) => {
        const val = Object.keys(navNameMapRev).find((key) => key === x);
        // @ts-ignore
        configStore.setExampleRoute(navNameMapRev[val]);
      }}
    />
  </div>
  <div class="flex flex-col">
    <div class="text-sm">Focused example</div>
    <Tooltip>
      <div class="flex flex-col" slot="content">
        <button
          class={simpleTooltipRowStyle}
          class:font-bold={allSelected}
          on:click={() => {
            exampleStore.restoreHiddenExamples();
            exampleStore.setExampleSize("all", 250);
          }}
        >
          All
        </button>
        <div class="my-3 border-t border-black"></div>
        {#each examples as example, idx}
          {#if "vega" in example}
            <button
              class={simpleTooltipRowStyle}
              on:click={() => {
                exampleStore.hideAllExcept(idx);
                exampleStore.setExampleSize(idx, 600);
              }}
            >
              {example.name}
            </button>
          {/if}
        {/each}
        <div class="my-3 border-t border-black"></div>
        {#each examples as example, idx}
          {#if "svg" in example}
            <button
              class={simpleTooltipRowStyle}
              on:click={() => {
                exampleStore.hideAllExcept(idx);
                exampleStore.setExampleSize(idx, 600);
              }}
            >
              {example.name}
            </button>
          {/if}
        {/each}
        <div class="my-3 border-t border-black"></div>
        <NewExampleModal
          {editTarget}
          onClose={() => {
            editTarget = null;
          }}
        />
        <Tooltip positionAlongRightEdge={true}>
          <div slot="content" let:onClick class="max-w-md">
            <div>
              Are you sure you want to reset to the default examples? This will
              remove any custom ones you've uploaded
            </div>
            <div class="flex justify-between">
              <button
                class={buttonStyle}
                on:click={() => {
                  configStore.setUseSimulatorOnExamples(false);
                  exampleStore.restoreDefaultExamples();
                  onClick();
                }}
              >
                Yes! Reset em now
              </button>
              <button class={buttonStyle} on:click={onClick}>
                No! Never mind
              </button>
            </div>
          </div>
          <button
            slot="target"
            let:toggle
            class={buttonStyle}
            on:click={toggle}
          >
            Reset Modifications
          </button>
        </Tooltip>
      </div>
      <button
        slot="target"
        let:toggle
        on:click={toggle}
        class="{buttonStyle} flex items-center"
      >
        {exampleName}
        <ChevDown class="ml-2 text-sm" />
      </button>
    </Tooltip>
  </div>

  <ColorSimControl />
</div>
<div
  class="flex flex-wrap overflow-auto p-4 w-full bg-stone-100 pb-20"
  style={`height: calc(100% - 100px)`}
>
  {#if $configStore.exampleRoute === "swatches"}
    <Swatches paletteIdx={$colorStore.currentPal} />
  {/if}
  {#each examples as example, idx}
    {#if exampleShowMap[idx]}
      <BrowseCard
        allowInteraction={true}
        allowResize={true}
        palette={currentPal}
        previewIndex={idx}
        markAsCurrent={false}
        onRename={(name) => exampleStore.setExampleName(idx, name)}
        operations={makeOperations(idx, example.name)}
        titleClick={false}
        title={example.name}
      />
    {/if}
  {/each}
</div>

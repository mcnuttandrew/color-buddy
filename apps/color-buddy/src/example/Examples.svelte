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
  $: examples = $exampleStore.examples;

  $: allSelected = examples.every((x) => !x.hidden);
  $: exampleShowMap = examples.map((x: any) => {
    if ($configStore.exampleRoute === "swatches") {
      return false;
    }
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

  // $: numHidden = examples.filter((x) => x.hidden).length;

  const navNameMap = {
    swatches: "Swatches",
    vega: "Visualizations",
    svg: "SVG",
  } as any;
  const navNameMapRev = Object.keys(navNameMap).reduce((acc, key) => {
    acc[navNameMap[key]] = key;
    return acc;
  }, {} as any);

  function makeOperations(idx: number, name: string) {
    return [
      {
        name: "Edit...",
        action: () => configStore.setNewExampleModalTarget(idx),
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
      // {
      //   name: "Hide",
      //   action: () => exampleStore.toggleHidden(idx),
      //   closeOnClick: true,
      // },
    ].filter((x) => x) as any[] as {
      name: string;
      action: () => void;
      closeOnClick: boolean;
    }[];
  }
</script>

<div class="flex py-1 items-center bg-stone-100">
  <div class="flex flex-col mr-2">
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
  <div class="flex ml-2">
    {#if $configStore.exampleRoute !== "swatches"}
      <div class="mr-1">Thumbnails</div>
      <Tooltip positionAlongRightEdge={true}>
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
          <button
            class={buttonStyle}
            on:click={() => configStore.setNewExampleModalTarget("new")}
          >
            Add New Example
          </button>

          <Tooltip positionAlongRightEdge={true}>
            <div slot="content" let:onClick class="max-w-md">
              <div>
                Are you sure you want to reset to the default examples? This
                will remove any custom ones you've uploaded
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
              Restore Defaults
            </button>
          </Tooltip>
        </div>
        <button
          slot="target"
          let:toggle
          on:click={toggle}
          class="{buttonStyle
            .split(' ')
            .filter((x) => !x.startsWith('py'))
            .join(' ')} flex items-center"
        >
          {exampleName}
          <ChevDown class="ml-2 text-sm" />
        </button>
      </Tooltip>
    {/if}
  </div>
  <!-- {#if numHidden > 0 && $configStore.exampleRoute === "swatches"}
    <div class="flex flex-col ml-2">
      <button
        class={buttonStyle}
        on:click={() => exampleStore.restoreHiddenExamples()}
      >
        Unhide {numHidden} examples
      </button>
    </div>
  {/if} -->

  <ColorSimControl />
</div>
<div
  class="flex flex-wrap overflow-auto p-4 w-full pb-20"
  style={`height: calc(100% - 100px)`}
>
  {#if $configStore.exampleRoute === "swatches"}
    <div style={`background: ${currentPal.background.toHex()}`} class="p-4">
      <Swatches paletteIdx={$colorStore.currentPal} />
    </div>
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
<NewExampleModal />

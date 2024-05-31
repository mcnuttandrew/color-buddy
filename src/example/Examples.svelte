<script lang="ts">
  import exampleStore from "../stores/example-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import BrowseCard from "./BrowseCard.svelte";
  import { buttonStyle } from "../lib/styles";
  import Swatches from "./Swatches.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import Nav from "../components/Nav.svelte";
  import NewExampleModal from "./NewExampleModal.svelte";
  import ColorSimControl from "./ColorSimControl.svelte";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  let editTarget = null as null | number;

  $: exampleShowMap = $exampleStore.examples.map((x: any) => {
    if (x.hidden) {
      return false;
    }
    if ($configStore.exampleRoute === "svg" && x?.svg) {
      return true;
    }
    if ($configStore.exampleRoute === "vega" && x.vega) {
      return true;
    }
    return false;
  });
  $: examples = $exampleStore.examples as any;
  $: hiddenExamples = $exampleStore.examples.filter((x: any) => x.hidden);
  $: numberHidden = hiddenExamples.length;

  const navNameMap = {
    svg: "SVG",
    vega: "Visualizations (via Vega)",
    swatches: "Swatches",
  } as any;
  const navNameMapRev = Object.keys(navNameMap).reduce((acc, key) => {
    acc[navNameMap[key]] = key;
    return acc;
  }, {} as any);

  function makeOperations(idx: number) {
    let exampleIsSoled = $exampleStore.examples[idx].size === 600;
    return [
      {
        name: "Edit",
        action: () => {
          editTarget = idx;
        },
      },
      {
        name: "Delete",
        action: () => exampleStore.deleteExample(idx),
      },
      {
        name: "Duplicate",
        action: () => exampleStore.duplicateExample(idx),
      },
      {
        name: "Hide",
        action: () => exampleStore.toggleHidden(idx),
      },

      !exampleIsSoled && {
        name: "Focus (expand and hide others)",
        action: () => {
          exampleStore.hideAllExcept(idx);
          exampleStore.setExampleSize(idx, 600);
        },
      },
      exampleIsSoled && {
        name: "Unfocus (restore group)",
        action: () => {
          exampleStore.restoreHiddenExamples();
          exampleStore.setExampleSize(idx, 250);
        },
      },
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
    ].filter((x) => x) as any[] as { name: string; action: () => void }[];
  }
</script>

<div class="flex flex-col bg-stone-300 px-4 py-2">
  <div class="flex">
    <NewExampleModal
      {editTarget}
      onClose={() => {
        editTarget = null;
      }}
    />
    <Tooltip>
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
          <button class={buttonStyle} on:click={onClick}>No! Never mind</button>
        </div>
      </div>
      <button slot="target" let:toggle class={buttonStyle} on:click={toggle}>
        Reset to defaults
      </button>
    </Tooltip>
    <ColorSimControl />
    {#if numberHidden > 0}
      <Tooltip>
        <div slot="content">
          <button
            class={buttonStyle}
            on:click={() => exampleStore.restoreHiddenExamples()}
          >
            Restore All Examples
          </button>
          <div>Restore individual example</div>
          {#each hiddenExamples as example, idx}
            <button
              class={buttonStyle}
              on:click={() => exampleStore.restoreHiddenExample(idx)}
            >
              {example.name}
            </button>
          {/each}
        </div>
        <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
          Restore hidden examples
        </button>
      </Tooltip>
    {/if}
  </div>
  <div class="flex">
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
</div>
<div
  class="flex flex-wrap overflow-auto p-4 w-full bg-stone-100 pb-20"
  style={`height: calc(100% - 100px)`}
>
  {#if $configStore.exampleRoute === "swatches"}
    <Swatches
      paletteIdx={$colorStore.currentPal}
      bg={currentPal.background.toString()}
    />
  {/if}
  {#each examples as example, idx}
    {#if exampleShowMap[idx]}
      <BrowseCard
        allowInteraction={true}
        allowResize={true}
        palette={currentPal}
        previewIndex={idx}
        onRename={(name) => exampleStore.setExampleName(idx, name)}
        operations={makeOperations(idx)}
        titleClick={false}
        title={example.name}
      />
    {/if}
  {/each}
</div>

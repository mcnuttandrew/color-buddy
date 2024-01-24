<script lang="ts">
  import { Color } from "../lib/Color";
  import type { Palette } from "../stores/color-store";
  import exampleStore, {
    DEMOS,
    detectColorsInSvgString,
    modifySVGForExampleStore,
  } from "../stores/example-store";
  import colorStore from "../stores/color-store";

  import ExampleWrapper from "./ExampleWrapper.svelte";
  import Modal from "../components/Modal.svelte";
  import { buttonStyle } from "../lib/styles";
  import { xml } from "@codemirror/lang-xml";
  import CodeMirror from "svelte-codemirror-editor";
  import Swatches from "../content-modules/Swatches.svelte";
  import Tooltip from "../components/Tooltip.svelte";

  let modalState: "closed" | "input-svg" | "input-vega" | "edit-colors" =
    "closed";
  let modifyingExample: number | false = false;
  $: bg = $colorStore.currentPal.background;
  $: colorSpace = $colorStore.currentPal.colorSpace;
  let value = "";

  $: detectedColors = [] as string[];
  $: sections = $exampleStore.sections as any;
  function onToggle(group: string) {
    exampleStore.toggleSection(group as keyof typeof $exampleStore.sections);
  }

  function createNewPal() {
    const newPal: Palette = {
      colors: detectedColors.map((x) => Color.colorFromString(x, colorSpace)),
      background: bg,
      name: "New Palette",
      type: "categorical",
      evalConfig: {},
      colorSpace: "lab",
    };
    colorStore.createNewPal(newPal);
  }

  let validJSON = false;
  $: {
    if (modalState === "input-vega") {
      try {
        JSON.parse(value);
        validJSON = true;
      } catch (e) {
        validJSON = false;
      }
    }
  }
  function clickExample(example: { svg?: string; vega?: string }, idx: number) {
    if (example.svg) {
      value = example.svg;
      modalState = "input-svg";
    }
    if (example.vega) {
      value = example.vega;
      modalState = "input-vega";
    }
    modifyingExample = idx;
  }

  async function fileUpload(e: any) {
    const file = e.target.files[0];
    const text = await file.text();
    value = text;
  }

  $: exampleShowMap = $exampleStore.examples.map((x: any) => {
    if (x.hidden) {
      return false;
    }
    if (sections.svg && x?.svg) {
      return true;
    }
    if (sections.vega && x.vega) {
      return true;
    }
    return false;
  });
  $: examples = $exampleStore.examples as any;
  $: groupsHidden = Object.keys(sections).filter((x) => !sections[x]).length;
  $: hiddenExamples = $exampleStore.examples.filter((x: any) => x.hidden);
  $: numberHidden = hiddenExamples.length + groupsHidden;

  $: numToShow = $exampleStore.examples.filter((x: any) => {
    if (x.hidden) {
      return false;
    }
    if (sections.svg && x?.svg) {
      return true;
    }
    if (sections.vega && x.vega) {
      return true;
    }
    return false;
  }).length;
</script>

<div class="flex items-center bg-stone-300 px-4 py-2">
  {#each Object.keys(sections) as group}
    <div class="mr-2">
      <label for={`${group}-checkbox`}>{group}</label>
      <input
        id={`${group}-checkbox`}
        type="checkbox"
        checked={sections[group]}
        on:change={(e) => onToggle(group)}
      />
    </div>
  {/each}
  <button
    class={buttonStyle}
    on:click={() => {
      modalState = "input-svg";
    }}
  >
    Add New Example
  </button>
  <Tooltip>
    <div slot="content" let:onClick class="max-w-md">
      <div>
        Are you sure you want to reset to the default examples? This will remove
        any custom ones you've uploaded
      </div>
      <div class="flex justify-between">
        <button
          class={buttonStyle}
          on:click={() => exampleStore.restoreDefaultExamples()}
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
<div
  class="flex flex-wrap overflow-auto p-4 w-full bg-stone-100"
  style={`height: calc(100% - 100px)`}
>
  {#each examples as example, idx}
    {#if exampleShowMap[idx]}
      <ExampleWrapper {example} {idx} bg={bg.toHex()} {clickExample} />
    {/if}
  {/each}
  {#if $exampleStore.sections["swatches"]}
    <div class="mr-4 mb-2">
      <div class="bg-stone-300 w-full justify-between flex p-1">
        Swatches
        <Tooltip>
          <button
            slot="target"
            class={buttonStyle}
            let:toggle
            on:click={toggle}
          >
            Options
          </button>
          <div slot="content">
            <button
              class={buttonStyle}
              on:click={() => {
                onToggle("swatches");
              }}
            >
              Hide
            </button>
            {#if numToShow > 1}
              <button
                class={buttonStyle}
                on:click={() => {
                  exampleStore.onlySwatches();
                }}
              >
                Focus
              </button>
            {/if}
          </div>
        </Tooltip>
      </div>
      <Swatches />
    </div>
  {/if}
</div>
{#if modalState !== "closed"}
  <Modal
    showModal={true}
    closeModal={() => {
      modalState = "closed";
    }}
  >
    <div slot="header">
      <div class="flex justify-between">
        <div>Add an Example</div>
        <div>
          {#each ["svg", "vega (or vega-lite)"] as mode}
            <button
              class={buttonStyle}
              class:font-bold={(modalState === "input-svg" && mode === "svg") ||
                (modalState === "input-vega" && mode === "vega (or vega-lite)")}
              on:click={() => {
                modalState = mode === "svg" ? "input-svg" : "input-vega";
              }}
            >
              {mode}
            </button>
          {/each}
        </div>
      </div>
    </div>
    <div class="h-96 overflow-auto" style="width: 700px;">
      <div>
        {#if modalState === "input-svg" || modalState === "input-vega"}
          Demos:
          {#each DEMOS.filter((demo) => {
            return modalState === "input-svg" ? demo.type === "svg" : demo.type === "vega";
          }) as demo}
            <button
              class={buttonStyle}
              on:click={() => {
                let initialMode = modalState;
                fetch(demo.filename)
                  .then((response) => response.text())
                  .then((text) => {
                    value = text;
                    modalState = initialMode;
                  })
                  .catch((e) => {
                    console.error(e);
                  });
              }}
            >
              {demo.title}
            </button>
          {/each}
        {/if}
      </div>
      {#if modalState === "input-svg"}
        <CodeMirror
          bind:value
          lang={xml()}
          placeholder={"Paste in some SVG text here"}
        />
        <div>
          <input
            accept="image/svg"
            id="fileUpload"
            name="fileUpload"
            type="file"
            on:change={(e) => fileUpload(e)}
          />
          <label for="fileUpload">Or upload a file</label>
        </div>
      {/if}

      {#if modalState === "input-vega"}
        {#if !validJSON}
          <div class="text-red-500">Invalid JSON</div>
        {/if}
        <CodeMirror
          bind:value
          placeholder={"Paste in a valid vega or vega-lite program here"}
        />
      {/if}

      {#if modalState === "edit-colors"}
        <div>
          <h3>
            We detect the following colors, remove any that you do NOT want to
            be replaced in the editor
          </h3>
          <div class="flex">
            <div class="flex flex-col">
              {#each detectedColors as color, idx}
                <div class="flex">
                  <div
                    class="w-24 h-8"
                    class:text-white={Color.colorFromString(
                      color,
                      colorSpace
                    ).luminance() < 0.5}
                    style="background-color: {color};"
                  >
                    {color}
                  </div>
                  <button
                    class={buttonStyle}
                    on:click={() => {
                      detectedColors = detectedColors.filter(
                        (x) => x !== color
                      );
                    }}
                  >
                    Remove
                  </button>
                  {#if idx}
                    <button
                      class={buttonStyle}
                      on:click={() => {
                        detectedColors = [
                          ...detectedColors.slice(0, idx - 1),
                          detectedColors[idx],
                          detectedColors[idx - 1],
                          ...detectedColors.slice(idx + 1),
                        ];
                      }}
                    >
                      Move up
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
            <div>
              {@html value}
            </div>
          </div>
        </div>
      {/if}
    </div>
    <div>
      {#if modalState === "edit-colors"}
        <button
          class={buttonStyle}
          on:click={() => {
            const svg = modifySVGForExampleStore(value, detectedColors);
            const example = {
              svg,
              numColors: detectedColors.length,
              name: "Custom Example",
            };
            if (modifyingExample !== false) {
              exampleStore.updateExample(example, modifyingExample);
            } else {
              exampleStore.addExample(example);
            }
            modalState = "closed";
            value = "";
            modifyingExample = false;
          }}
        >
          {modifyingExample ? "Update" : "Add"} Example
        </button>
        <button
          class={buttonStyle}
          on:click={() => {
            modalState = "input-svg";
          }}
        >
          Back to editing SVG
        </button>
        <button class={buttonStyle} on:click={createNewPal}>
          Use identified colors as new palette
        </button>
      {/if}
      {#if modalState === "input-svg"}
        <button
          class={buttonStyle}
          on:click={() => {
            modalState = "edit-colors";
            detectedColors = detectColorsInSvgString(value);
          }}
        >
          Mark Colors
        </button>
      {/if}
      {#if modalState === "input-vega"}
        <button
          class={buttonStyle}
          on:click={() => {
            const example = { vega: value, name: "Custom Example", size: 300 };
            if (modifyingExample !== false) {
              exampleStore.updateExample(example, modifyingExample);
            } else {
              exampleStore.addExample(example);
            }
            modalState = "closed";
            value = "";
            modifyingExample = false;
          }}
        >
          {modifyingExample ? "Update" : "Add"} Example
        </button>
      {/if}
    </div>
  </Modal>
{/if}

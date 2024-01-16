<script lang="ts">
  import { colorFromString } from "../lib/Color";
  import type { Palette } from "../stores/color-store";
  import chroma from "chroma-js";
  import exampleStore, {
    DEMOS,
    detectColorsInSvgString,
    modifySVGForExampleStore,
  } from "../stores/example-store";
  import colorStore from "../stores/color-store";
  import Vega from "../components/Vega.svelte";
  import Modal from "../components/Modal.svelte";
  import { buttonStyle } from "../lib/styles";
  import { xml } from "@codemirror/lang-xml";
  import CodeMirror from "svelte-codemirror-editor";
  import Tooltip from "../components/Tooltip.svelte";
  import Example from "../components/Example.svelte";
  import Swatches from "../content-modules/Swatches.svelte";

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
      colors: detectedColors.map((x) => colorFromString(x, colorSpace)),
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

  $: examples = $exampleStore.examples.filter((x: any) => {
    if (sections.svg && x?.svg) {
      return true;
    }
    if (sections.vega && x.vega) {
      return true;
    }
    return false;
  }) as any;
</script>

<div class="flex items-center bg-slate-200 px-4">
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
    Add Example
  </button>
  <button
    class={buttonStyle}
    on:click={() => exampleStore.restoreDefaultExamples()}
  >
    Restore default examples
  </button>
</div>
<div
  class="flex flex-wrap overflow-auto p-4 w-full bg-slate-300"
  style={`height: calc(100% - 100px)`}
>
  {#if $exampleStore.sections["swatches"]}
    <Swatches />
  {/if}

  {#each examples as example, idx}
    <div
      class="flex flex-col border-2 border-dashed rounded w-min mr-4"
      style="background: {bg.toHex()};"
    >
      <div class="flex">
        {#if example.svg}
          <Example example={example.svg} />
        {/if}
        {#if example.vega}
          <Vega spec={example.vega} />
        {/if}
        <Tooltip>
          <div slot="content" let:onClick>
            <button
              class={buttonStyle}
              on:click={() => clickExample(example, idx)}
            >
              Edit
            </button>
            <button
              class={buttonStyle}
              on:click={() => {
                exampleStore.deleteExample(idx);
                onClick();
              }}
            >
              Delete
            </button>
          </div>
          <div slot="target" let:toggle>
            <button class={buttonStyle} on:click={toggle}>⚙</button>
          </div>
        </Tooltip>
      </div>
    </div>
  {/each}
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
          <div class="flex flex-col">
            {#each detectedColors as color}
              <div class="flex">
                <div
                  class="w-24 h-8"
                  class:text-white={chroma(color).luminance() < 0.5}
                  style="background-color: {color};"
                >
                  {color}
                </div>
                <button
                  class={buttonStyle}
                  on:click={() => {
                    detectedColors = detectedColors.filter((x) => x !== color);
                  }}
                >
                  Remove
                </button>
              </div>
            {/each}
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
            const example = { svg, numColors: detectedColors.length };
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
            const example = { vega: value };
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

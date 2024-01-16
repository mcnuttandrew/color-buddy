<script lang="ts">
  import { colorFromString } from "../lib/Color";
  import type { Palette } from "../stores/color-store";
  import chroma from "chroma-js";
  import exampleStore from "../stores/example-store";
  import colorStore from "../stores/color-store";
  import { charts, idxToKey } from "../lib/charts";
  import Vega from "../components/Vega.svelte";
  import Modal from "../components/Modal.svelte";
  import { buttonStyle } from "../lib/styles";
  import { xml } from "@codemirror/lang-xml";
  import CodeMirror from "svelte-codemirror-editor";
  import Tooltip from "../components/Tooltip.svelte";
  import Example from "../components/Example.svelte";
  import Swatches from "../content-modules/Swatches.svelte";

  let modalState: "closed" | "input-svg" | "edit-colors" = "closed";
  let modifyingExample: number | false = false;
  $: bg = $colorStore.currentPal.background;
  $: colorSpace = $colorStore.currentPal.colorSpace;
  let value = "";

  function detectColorsInSvgString(svgString: string) {
    const colors = new Set<string>();
    //  match hex or rgb(255, 255, 255)
    const regex = /#(?:[0-9a-fA-F]{3}){1,2}|rgb\((?:\d{1,3},\s*){2}\d{1,3}\)/g;

    let match;
    while ((match = regex.exec(svgString))) {
      colors.add(match[0]);
    }
    return Array.from(colors);
  }

  function modifySVGForExampleStore(
    svgString: string,
    targetedColors: string[]
  ) {
    let svg = svgString;
    targetedColors.forEach((color, idx) => {
      svg = svg.replace(new RegExp(color, "g"), idxToKey(idx));
    });
    return svg;
  }

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
  const DEMOS = [
    { title: "Mondrian", filename: "./mondrian.svg" },
    { title: "Annotated R2", filename: "./r2.svg" },
    { title: "Annotated Fourier", filename: "./fourier.svg" },
    { title: "VIS Logo", filename: "./vis-logo.svg" },
    { title: "Holy Grail Layout", filename: "./HolyGrail.svg" },
  ];
</script>

<div class="flex items-center bg-slate-200 px-4">
  {#each Object.keys($exampleStore.sections) as group}
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
</div>
<div
  class="flex flex-wrap overflow-auto p-4 w-full bg-slate-300"
  style={`height: calc(100% - 100px)`}
>
  {#if $exampleStore.sections["custom"]}
    {#each $exampleStore.examples as example, idx}
      <div
        class="flex flex-col border-2 border-dashed rounded w-min mr-4"
        style="background: {bg.toHex()};"
      >
        <div class="flex">
          <Example example={example.svg} />
          <Tooltip>
            <div slot="content" let:onClick>
              <button
                class={buttonStyle}
                on:click={() => {
                  value = example.svg;
                  modalState = "input-svg";
                  modifyingExample = idx;
                }}
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
  {/if}
  {#if $exampleStore.sections["swatches"]}
    <Swatches />
  {/if}
  {#each charts as { chart, group }}
    {#if sections[group]}
      <div class="flex flex-col border-2 border-dashed rounded w-min mr-4">
        <Vega spec={chart($colorStore.currentPal)} />
      </div>
    {/if}
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
      </div>
    </div>
    <div class="h-96 overflow-auto" style="width: 700px;">
      <div>
        Demos:
        {#if modalState === "input-svg"}
          {#each DEMOS as demo}
            <button
              class={buttonStyle}
              on:click={() => {
                fetch(demo.filename)
                  .then((response) => response.text())
                  .then((text) => {
                    value = text;
                    modalState = "input-svg";
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
            //   exampleStore.addExample(value);
            modalState = "edit-colors";
            detectedColors = detectColorsInSvgString(value);
          }}
        >
          Mark Colors
        </button>
      {/if}
    </div>
  </Modal>
{/if}

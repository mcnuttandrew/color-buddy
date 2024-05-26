<script lang="ts">
  import { Color } from "../lib/Color";
  import exampleStore, {
    DEMOS,
    detectColorsInSvgString,
    modifySVGForExampleStore,
  } from "../stores/example-store";
  import colorStore from "../stores/color-store";
  import type { Palette } from "../types";

  import Modal from "../components/Modal.svelte";
  import { buttonStyle } from "../lib/styles";
  import MonacoEditor from "../components/MonacoEditor.svelte";
  import { makePalFromString } from "../lib/utils";
  let modalState: "closed" | "input-svg" | "input-vega" | "edit-colors" =
    "closed";

  export let editTarget: null | number = null;
  export let onClose: () => void;
  let value = "";
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal.colorSpace;

  $: detectedColors = [] as string[];

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

  $: {
    if (editTarget !== null) {
      const example = $exampleStore.examples[editTarget];
      if (example.svg) {
        value = example.svg;
        modalState = "input-svg";
      }
      if (example.vega) {
        value = example.vega;
        modalState = "input-vega";
      }
    }
  }

  async function fileUpload(e: any) {
    const file = e.target.files[0];
    const text = await file.text();
    value = text;
  }
</script>

{#if modalState !== "closed"}
  <Modal
    showModal={true}
    closeModal={() => {
      modalState = "closed";
    }}
  >
    <div class="bg-stone-200 h-12 flex justify-between items-center px-4">
      <div class="font-bold">Add an Example</div>
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
    <div class="h-96 overflow-auto px-4" style="width: 700px;">
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
        <MonacoEditor language="xml" onChange={(x) => (value = x)} {value} />
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
        <MonacoEditor language="json" onChange={(x) => (value = x)} {value} />
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
            if (editTarget !== null) {
              exampleStore.updateExample(example, editTarget);
            } else {
              exampleStore.addExample(example);
            }
            modalState = "closed";
            value = "";
            onClose();
            // modifyingExample = false;
          }}
        >
          {editTarget !== null ? "Update" : "Add"} Example
        </button>
        <button
          class={buttonStyle}
          on:click={() => {
            modalState = "input-svg";
          }}
        >
          Back to editing SVG
        </button>
        <button
          class={buttonStyle}
          on:click={() => {
            colorStore.createNewPal(makePalFromString(detectedColors));
          }}
        >
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
      {#if modalState === "input-vega" && validJSON}
        <button
          class={buttonStyle}
          on:click={() => {
            const example = { vega: value, name: "Custom Example", size: 300 };
            if (editTarget !== null) {
              exampleStore.updateExample(example, editTarget);
            } else {
              exampleStore.addExample(example);
            }
            modalState = "closed";
            value = "";
            onClose();
            // modifyingExample = false;
          }}
        >
          {editTarget !== null ? "Update" : "Add"} Example
        </button>
      {/if}
    </div>
  </Modal>
{/if}
<button
  class={buttonStyle}
  on:click={() => {
    modalState = "input-svg";
  }}
>
  Add New Example
</button>
<!-- <button
  class={buttonStyle}
  on:click={() => {
    modalState = "input-svg";
  }}
>
  <slot />
</button> -->

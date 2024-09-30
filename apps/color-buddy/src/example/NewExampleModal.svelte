<script lang="ts">
  import { Color, makePalFromString } from "color-buddy-palette";
  import exampleStore, {
    DEMOS,
    detectColorsInSvgString,
    modifySVGForExampleStore,
  } from "../stores/example-store";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";

  import Modal from "../components/Modal.svelte";
  import { buttonStyle } from "../lib/styles";
  import MonacoEditor from "../components/MonacoEditor.svelte";
  import Nav from "../components/Nav.svelte";
  let modalState: "closed" | "input-svg" | "input-vega" | "edit-colors" =
    "closed";

  $: externalModalState = $configStore.newExampleModalTarget;
  let value = "";
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colorSpace = currentPal?.colorSpace || "lab";

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
    if (typeof externalModalState === "number") {
      const example = $exampleStore.examples[externalModalState] as any;
      if (example.svg) {
        value = example.svg;
        modalState = "input-svg";
      }
      if (example.vega) {
        value = example.vega;
        modalState = "input-vega";
      }
    } else if (externalModalState === "new") {
      modalState = "input-svg";
      value = "";
    }
  }

  async function fileUpload(e: any) {
    const file = e.target.files[0];
    const text = await file.text();
    value = text;
  }
</script>

{#if modalState !== "closed" && externalModalState !== "off"}
  <Modal
    showModal={true}
    size="700px"
    closeModal={() => {
      modalState = "closed";
      configStore.setNewExampleModalTarget("off");
    }}
  >
    <div class="bg-stone-200 h-12 flex justify-between items-center px-4">
      <div class="font-bold">Add an Example</div>
      {#if modalState === "edit-colors"}
        <div>
          Detected colors: {detectedColors.length}
        </div>
      {:else}
        <Nav
          tabs={["svg", "vega (or vega-lite)"]}
          isTabSelected={(x) =>
            (modalState === "input-svg" && x === "svg") ||
            (modalState === "input-vega" && x === "vega (or vega-lite)")}
          selectTab={(x) =>
            (modalState = x === "svg" ? "input-svg" : "input-vega")}
        />
      {/if}
    </div>
    <div class="h-full px-4" style="width: 700px;">
      <div>
        {#if modalState === "input-svg"}
          <p>
            Paste in the contents of an SVG file. After you are satisfied with
            the SVG, you can automatically extract the colors from the SVG and
            add it as an example.
          </p>
        {/if}
        {#if modalState === "input-vega"}
          <p>
            Paste in a Vega or Vega-Lite JSON specification. After you are
            satisfied with the JSON, you can add it as an example. You can find
            examples to use at the <a
              class="underline text-blue-500"
              href="https://vega.github.io/vega-lite/examples/"
            >
              Vega-Lite Gallery
            </a>
            .
          </p>
        {/if}
      </div>
      <div>
        {#if modalState === "input-svg" || modalState === "input-vega"}
          Demos:
          {#each DEMOS.filter((demo) => {
            if (modalState === "input-svg") {
              return demo.type === "svg";
            } else {
              return demo.type === "vega";
            }
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
          <label class={buttonStyle} for="fileUpload">Or upload a file</label>
          <input
            accept="image/svg"
            id="fileUpload"
            name="fileUpload"
            type="file"
            on:change={(e) => fileUpload(e)}
          />
        </div>
      {/if}

      {#if modalState === "input-vega"}
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
    <div class="px-4 bg-stone-100 py-4 flex justify-center">
      {#if modalState === "edit-colors"}
        <button
          class={buttonStyle}
          on:click={() => {
            const svg = modifySVGForExampleStore(value, detectedColors);
            const example = {
              svg,
              numColors: detectedColors.length,
              name: "Custom Example",
              size: 250,
            };
            if (typeof externalModalState === "number") {
              exampleStore.updateExample(example, externalModalState);
            } else {
              exampleStore.addExample(example);
            }
            modalState = "closed";
            value = "";

            configStore.setNewExampleModalTarget("off");
          }}
        >
          This looks good to me!
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
          This svg looks good to me!
        </button>
      {/if}
      {#if modalState === "input-vega" && !validJSON}
        <div class="text-red-500">Invalid JSON</div>
      {/if}
      {#if modalState === "input-vega" && validJSON}
        <button
          class={buttonStyle}
          on:click={() => {
            const example = { vega: value, name: "Custom Example", size: 300 };
            if (typeof externalModalState === "number") {
              exampleStore.updateExample(example, externalModalState);
            } else {
              exampleStore.addExample(example);
            }
            modalState = "closed";
            value = "";

            configStore.setNewExampleModalTarget("off");
          }}
        >
          {typeof externalModalState === "number" ? "Update" : "Add"} Example
        </button>
      {/if}
    </div>
  </Modal>
{/if}
<!-- <button
  class={buttonStyle}
  on:click={() => {
    modalState = "input-svg";
    value = "";
  }}
>
  Add New Example
</button> -->

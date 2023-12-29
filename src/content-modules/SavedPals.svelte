<script lang="ts">
  import colorStore from "../stores/color-store";
  import SuggestName from "./context-free-tools/SuggestName.svelte";
  import AddFamiliarPal from "./context-free-tools/AddFamiliarPal.svelte";
  import SuggestColorPal from "./context-free-tools/SuggestColorPal.svelte";
  import SuggestColors from "./context-free-tools/SuggestColors.svelte";
  import PalPreview from "../components/PalPreview.svelte";
  import Background from "./Background.svelte";
  import Sort from "./context-free-tools/Sort.svelte";
  import GetColorsFromString from "./context-free-tools/GetColorsFromString.svelte";
  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  import SetColorSpace from "./SetColorSpace.svelte";
</script>

<div class="bg-slate-400 p-2 w-96 h-full container">
  <div class="text-4xl font-bold">Color Buddy</div>
  <div class="flex justify-between z-50">
    <div>
      <button on:click={() => colorStore.undo()}>Undo</button>
      <button on:click={() => colorStore.redo()}>Redo</button>
    </div>
    <div>
      {#each ["google", "openai"] as ai}
        <button
          class={buttonStyle}
          class:font-bold={ai === $colorStore.engine}
          on:click={() => {
            colorStore.setEngine(ai);
          }}
        >
          {ai}
        </button>
      {/each}
    </div>
  </div>

  <section class="mt-4 border-t-2 border-black">
    <div class="">
      <span class="italic">Current Pal:</span>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="flex justify-between">
        <div class="flex">
          <span>✎</span>
          <div
            class=""
            on:keyup={(e) => {
              // @ts-ignore
              colorStore.setCurrentPalName(e.target.textContent);
            }}
            contenteditable="true"
          >
            {$colorStore.currentPal.name}
          </div>
        </div>
        <SuggestName />
      </div>
    </div>
    <PalPreview pal={$colorStore.currentPal} />
    <Background />
    <GetColorsFromString />
    <SetColorSpace />
    <div class="mt-4 border-t-2 border-black">
      <div class="italic">Global Actions</div>
      <!-- <button class={buttonStyle} on:click={() => colorStore.createNewPal()}>
        New Pal
      </button> -->
      <AddFamiliarPal />

      <Sort />
      <SuggestColorPal />
      <SuggestColors />
    </div>
  </section>
  <section class="mt-4 border-t-2 border-black h-full max-h-full">
    <div class="italic">Saved Pals</div>
    <div class="h-full overflow-auto">
      {#each $colorStore.palettes as pal}
        <div class="flex flex-col mt-2 h-fit">
          <div class="flex items-center justify-between">
            <div>
              <button
                class={buttonStyle}
                on:click={() => colorStore.startUsingPal(pal.name)}
              >
                {pal.name}
              </button>
            </div>
            <Tooltip>
              <div slot="content" let:onClick>
                <button
                  class={buttonStyle}
                  on:click={() => colorStore.copyPal(pal.name)}
                >
                  Copy
                </button>
                <button
                  class={buttonStyle}
                  on:click={() => {
                    colorStore.removePal(pal.name);
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
          <PalPreview {pal} />
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .container {
    min-width: 18rem;
  }
</style>

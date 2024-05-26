<script lang="ts">
  import colorStore from "../stores/color-store";
  import focusStore from "../stores/focus-store";
  import exampleStore from "../stores/example-store";
  import configStore from "../stores/config-store";
  import Example from "../example/Example.svelte";
  import Vega from "../example/Vega.svelte";

  import { suggestNameForPalette } from "../lib/api-calls";

  import PalPreview from "../components/PalPreview.svelte";

  import { buttonStyle } from "../lib/styles";
  import Tooltip from "../components/Tooltip.svelte";
  $: nameSuggestions = [] as string[];
  let state: "idle" | "loading" = "idle";
  let showRename = false;

  let preview = -1;
  $: example = $exampleStore.examples[preview];
</script>

<Tooltip>
  <div slot="content" class="max-w-md">
    <button
      class={buttonStyle}
      on:click={() => {
        preview = -1;
      }}
    >
      Swatches
    </button>
    {#each $exampleStore.examples as example, idx}
      <button
        class={buttonStyle}
        on:click={() => {
          preview = idx;
        }}
      >
        {example.name}
      </button>
    {/each}
  </div>
  <button
    slot="target"
    let:toggle
    class={`${buttonStyle} pl-0`}
    on:click={toggle}
  >
    Change example: {example?.name || "Swatches"}
  </button>
</Tooltip>
<div class="flex flex-wrap bg-stone-100 h-full overflow-auto p-4">
  {#each $colorStore.palettes as pal, paletteIdx}
    <div class="flex flex-col mt-2 h-fit p-4 border-2">
      {#if paletteIdx === $colorStore.currentPal}
        <span class="font-bold">Current</span>
      {/if}
      <div class="flex items-center justify-between">
        <button
          class={`${buttonStyle} whitespace-break-spaces`}
          on:click={() => {
            focusStore.clearColors();
            colorStore.startUsingPal(paletteIdx);
          }}
        >
          {pal.name}
        </button>
        <Tooltip
          onClose={() => {
            showRename = false;
            nameSuggestions = [];
          }}
        >
          <div
            slot="content"
            let:onClick
            class="flex flex-col justify-start items-start"
          >
            <button
              class={buttonStyle}
              on:click={() => {
                configStore.setComparePal(paletteIdx);
                configStore.setRoute("compare");
                onClick();
              }}
            >
              Compare with current
            </button>
            <button
              class={buttonStyle}
              on:click={() => colorStore.duplicatePal(paletteIdx)}
            >
              Duplicate
            </button>
            <button
              class={buttonStyle}
              on:click={() => {
                colorStore.removePal(paletteIdx);
                onClick();
              }}
            >
              Delete
            </button>
            {#if paletteIdx !== 0}
              <button
                class={buttonStyle}
                on:click={() => {
                  const pals = $colorStore.palettes;
                  const newIdx = paletteIdx - 1;
                  if (newIdx < 0) return;
                  const newPals = [...pals];
                  newPals[paletteIdx] = pals[newIdx];
                  newPals[newIdx] = pals[paletteIdx];
                  colorStore.setPalettes(newPals);

                  onClick();
                }}
              >
                Move up
              </button>
            {/if}
            {#if paletteIdx !== $colorStore.palettes.length - 1}
              <button
                class={buttonStyle}
                on:click={() => {
                  const pals = $colorStore.palettes;
                  const newIdx = paletteIdx + 1;
                  if (newIdx >= pals.length) return;
                  const newPals = [...pals];
                  newPals[paletteIdx] = pals[newIdx];
                  newPals[newIdx] = pals[paletteIdx];
                  colorStore.setPalettes(newPals);

                  onClick();
                }}
              >
                Move down
              </button>
            {/if}
            <button
              class={buttonStyle}
              on:click={() => {
                showRename = true;
              }}
            >
              Rename
            </button>
            {#if showRename}
              <input
                class="border-2 border-black"
                value={pal.name}
                on:blur={(e) => {
                  const newPals = [...$colorStore.palettes];
                  newPals[paletteIdx] = { ...pal, name: e.currentTarget.value };
                  colorStore.setPalettes(newPals);
                  showRename = false;
                }}
                on:keydown={(e) => {
                  if (e.key === "Enter") {
                    const newPals = [...$colorStore.palettes];
                    newPals[paletteIdx] = {
                      ...pal,
                      name: e.currentTarget.value,
                    };
                    colorStore.setPalettes(newPals);
                    showRename = false;
                  }
                }}
              />
            {/if}
            <button
              class={buttonStyle}
              on:click={() => {
                state = "loading";
                suggestNameForPalette(pal, $configStore.engine).then((res) => {
                  state = "idle";
                  nameSuggestions = res;
                });
              }}
            >
              Suggest Name
            </button>
            {#if nameSuggestions.length > 0}
              <div class="font-bold text-sm">Suggested Names</div>
              {#each nameSuggestions as name}
                <button
                  class={buttonStyle}
                  on:click={() => {
                    const newPals = [...$colorStore.palettes];
                    newPals[paletteIdx] = { ...pal, name };
                    colorStore.setPalettes(newPals);
                    nameSuggestions = [];
                  }}
                >
                  {name}
                </button>
              {/each}
            {/if}
            <div></div>
          </div>
          <button
            slot="target"
            let:toggle
            class={buttonStyle}
            on:click={toggle}
          >
            ⚙
          </button>
        </Tooltip>
      </div>
      {#if preview === -1}
        <PalPreview {pal} />
      {:else}
        {#if example.svg}
          <Example example={example.svg} size={example.size} {paletteIdx} />
        {/if}
        {#if example.vega}
          <Vega spec={example.vega} size={example.size} {paletteIdx} />
        {/if}
      {/if}
    </div>
  {/each}
</div>

<script lang="ts">
  import { buttonStyle } from "../lib/styles";
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import { suggestNameForPalette } from "../lib/api-calls";
  let state: "ready" | "loading" | "error" = "ready";
  $: paletteIndexesToRename = $colorStore.palettes
    .map((pal, idx) => (pal.name.toLowerCase() === "new palette" ? idx : false))
    .filter((idx) => typeof idx === "number") as number[];
  $: palNames = new Set(
    $colorStore.palettes.map((pal) => pal.name.toLowerCase())
  );
  async function GenerateNewNames() {
    if (state !== "ready") return;
    console.log("Generating new names for New Palettes");
    state = "loading";
    for (const idx of paletteIndexesToRename) {
      const palette = $colorStore.palettes[idx];
      console.log(palette, idx);
      try {
        const names = await suggestNameForPalette(palette, $configStore.engine);
        if (names.length > 0) {
          const subNames = names.filter(
            (name) => !palNames.has(name.toLowerCase())
          );
          const newName = subNames.length > 0 ? subNames[0] : names[0];
          colorStore.renamePalette(idx, newName);
        }
      } catch (e) {
        console.error(e);
        state = "error";
        return;
      }
    }

    state = "ready";
  }
</script>

{#if paletteIndexesToRename.length > 0 && state === "ready"}
  <button on:click={GenerateNewNames} class={buttonStyle}>
    Generate names for "New Palette"s
  </button>
{/if}
{#if state === "loading"}
  <p>Generating names...</p>
{/if}
{#if state === "error"}
  <p>There was an error generating names</p>
{/if}

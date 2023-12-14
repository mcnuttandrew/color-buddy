<script lang="ts">
  import chroma from "chroma-js";
  import colorStore from "../color-store";
  import { onMount } from "svelte";
  import { actionButton } from "../../styles";
  import type { Palette } from "../color-store";

  const familiarPals: Palette[] = [];
  onMount(() => {
    fetch("./brewer.json")
      .then((x) => x.json())
      .then((x) => {
        Object.entries(x).forEach(([schemeName, schemeSizes]) => {
          Object.entries(schemeSizes as any).forEach(([size, colors]) => {
            if (typeof colors === "string") return;
            familiarPals.push({
              name: `${schemeName}-${size}`,
              colors: (colors as any).map((x: any) => chroma(x).hex()) as any,
              background: "#ffffff",
            });
          });
        });
      });
  });

  let state: "closed" | "open" = "closed";
</script>

<div class="border-2 border-white rounded p-2">
  <button
    class={actionButton}
    on:click={() => {
      state = state === "closed" ? "open" : "closed";
    }}
  >
    Select a familiar palette
  </button>
  {#if state === "open"}
    <select
      value={null}
      on:change={(e) => {
        const pal = familiarPals.find((x) => x.name === e.target.value);
        colorStore.createNewPalWithExplicitPal(pal);
        state = "closed";
      }}
    >
      {#each familiarPals as pal}
        <option value={pal.name}>{pal.name}</option>
      {/each}
    </select>
  {/if}
</div>

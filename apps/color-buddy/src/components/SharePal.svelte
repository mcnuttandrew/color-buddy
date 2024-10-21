<script lang="ts">
  import ExportIcon from "virtual:icons/fa6-solid/file-export";
  import Tooltip from "./Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";

  import colorStore from "../stores/color-store";

  $: palette = $colorStore.palettes[$colorStore.currentPal];

  function generateWebUrl() {
    const colors = `[${palette.colors.map((x) => `"${x.toHex()}"`).join(",")}]`;
    const background = palette.background.toHex();
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("colors", colors);
    newUrl.searchParams.set("background", background);
    newUrl.searchParams.set("palName", palette.name);
    newUrl.searchParams.set("space", palette.colorSpace);
    return newUrl.toString();
  }

  let copyState = "idle" as "idle" | "copied";
</script>

<div class="mt-0.5 ml-2">
  <Tooltip>
    <div slot="content" let:open class="max-w-md overflow-hidden">
      <div class="font-bold">Share via url</div>
      <div class="font-mono text-sm p-1 border">{open && generateWebUrl()}</div>
      <div class="flex items-center">
        <button
          class={buttonStyle}
          on:click={() => {
            navigator.clipboard.writeText(generateWebUrl());
            copyState = "copied";
            setTimeout(() => {
              copyState = "idle";
            }, 2000);
          }}
        >
          Copy
        </button>
        {#if copyState === "copied"}
          <div class=" ml-4">Copied!</div>
        {/if}
      </div>
    </div>

    <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
      <ExportIcon class="text-xl" />
    </button>
  </Tooltip>
</div>

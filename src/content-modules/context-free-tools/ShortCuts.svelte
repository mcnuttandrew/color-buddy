<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import { buttonStyle } from "../../lib/styles";
  const metaKey = navigator.platform.match("Mac") ? "⌘" : "ctrl";
  const shortCuts = [
    { name: "Undo", shortcut: `${metaKey}+z` },
    { name: "Redo", shortcut: `${metaKey}+y` },
    { name: "Delete Selection", shortcut: "delete" },
    { name: "Copy", shortcut: `${metaKey}+c` },
    { name: "Paste", shortcut: `${metaKey}+v` },
    { name: "Move", shortcut: "arrow keys" },
  ];
</script>

<Tooltip>
  <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
    Short cuts
  </button>
  <div slot="content">
    <div class="font-bold">Short cuts</div>
    <div>
      {#each shortCuts as { name, shortcut }}
        <div class="flex justify-between">
          <div class="mr-4">{name}</div>
          <div>{shortcut}</div>
        </div>
      {/each}
    </div>
  </div>
</Tooltip>

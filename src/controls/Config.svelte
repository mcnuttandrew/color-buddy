<script lang="ts">
  import configStore from "../stores/config-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  const aiModes = ["google", "openai"] as const;
  $: showBg = $configStore.showColorBackground;

  const isMac = navigator.userAgent.indexOf("Mac OS X") !== -1;
  const metaKey = isMac ? "⌘" : "ctrl";
  const shortCuts = [
    { name: "Undo", shortcut: `${metaKey}+z` },
    { name: "Redo", shortcut: `${metaKey}+y` },
    { name: "Delete Selection", shortcut: "delete" },
    { name: "Copy", shortcut: `${metaKey}+c` },
    { name: "Paste", shortcut: `${metaKey}+v` },
    { name: "Move", shortcut: "arrow keys" },
    { name: "Checkpoint palette", shortcut: `${metaKey}+s` },
  ];
</script>

<Tooltip>
  <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
    {`Config ⚙`}
  </button>
  <div slot="content">
    <div>Pick AI Provider</div>
    <div>
      {#each aiModes as ai}
        <button
          class={buttonStyle}
          class:font-bold={ai === $configStore.engine}
          on:click={() => configStore.setEngine(ai)}
        >
          {ai}
        </button>
      {/each}
    </div>
    <div>Background on drag</div>
    {#each ["show", "hide"] as show}
      <button
        class={buttonStyle}
        class:font-bold={(show === "show" && showBg) ||
          (show == "hide" && !showBg)}
        on:click={() => configStore.setShowColorBackground(show === "show")}
      >
        {show}
      </button>
    {/each}

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

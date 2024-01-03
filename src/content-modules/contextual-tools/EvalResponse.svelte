<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";

  import { buttonStyle, AIButtonStyle } from "../../lib/styles";

  // unicode symbols meaning fix
  const symbols = [
    "⚙",
    "⚒",
    "🔧",
    "🔨",
    "🛠",
    "🧰",
    "🔩",
    "⚙️",
    "⚒️",
    "🔧️",
    "🔨️",
    "🛠️",
    "🧰️",
    "🔩️",
  ];
</script>

<Tooltip>
  <div slot="content">
    <button class={buttonStyle}>Ignore for this palette</button>
    <button class={buttonStyle}>Ignore for a bit</button>
    <button class={buttonStyle}>This is too restrictive</button>
    <button class={AIButtonStyle}>Generate Fix Suggestions</button>
  </div>
  <button slot="target" let:toggle class={` ml-4`} on:click={toggle}>🛠️</button>
</Tooltip>

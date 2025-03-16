<script lang="ts">
  import { PREBUILT_LINTS } from "color-buddy-palette-lint";
  import { buttonStyle } from "../lib/styles";

  import store from "../stores/store";

  $: lint = $store.lints.find((lint) => lint.id === $store.focusedLint)!;
  $: builtInLint = PREBUILT_LINTS.find((x) => x.id === $store.focusedLint);
  $: isBuiltInThatsBeenModified =
    builtInLint && lint?.program !== builtInLint?.program;
</script>

{#if isBuiltInThatsBeenModified}
  <button
    class={buttonStyle}
    on:click={() => {
      store.setCurrentLintProgram(builtInLint?.program || "");
    }}
  >
    Reset 🔄
  </button>
{/if}

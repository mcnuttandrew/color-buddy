<script lang="ts">
  import { PREBUILT_LINTS, prettyPrintLL } from "color-buddy-palette-lint";
  import { buttonStyle } from "../lib/styles";

  import store from "../stores/store";

  import Tooltip from "../components/Tooltip.svelte";
  import Nav from "../components/Nav.svelte";
  import DeleteLint from "./DeleteLint.svelte";
  import { newId } from "../lib/utils";

  $: lint = $store.lints.find((lint) => lint.id === $store.focusedLint)!;
  $: builtInLint = PREBUILT_LINTS.find((x) => x.id === $store.focusedLint);
  $: isBuiltInThatsBeenModified =
    builtInLint && lint?.program !== builtInLint?.program;
</script>

<Tooltip>
  <div slot="content">
    <p>Controls</p>
    <DeleteLint {lint} />
    {#if isBuiltInThatsBeenModified}
      <button
        class={buttonStyle}
        on:click={() => {
          store.setCurrentLintProgram(builtInLint?.program || "");
        }}
      >
        Restore this lint to original version
      </button>
    {/if}
    <button
      class={buttonStyle}
      on:click={() => {
        const clonedId = newId();
        store.cloneLint(lint.id, clonedId);
        store.setFocusedLint(clonedId);
      }}
    >
      Clone this lint
    </button>
    <div>
      <div>Engine</div>
      <Nav
        tabs={["openai", "anthropic", "google"]}
        isTabSelected={(x) => x === $store.engine}
        selectTab={(x) => store.setEngine(x)}
      />
    </div>
  </div>
  <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
    Controls
  </button>
</Tooltip>

<script lang="ts">
  import store from "../stores/store";
  import type { LintProgram } from "color-buddy-palette-lint";
  import { buttonStyle } from "../lib/styles";
  let showDeleteDoubleCheck = false;
  export let lint: LintProgram;
</script>

<div>
  {#if showDeleteDoubleCheck}
    <div class="flex">
      <div>Are you sure you want to delete this lint?</div>
      <button
        on:click={() => {
          store.deleteLint(lint.id);
          store.setFocusedLint(false);
          showDeleteDoubleCheck = false;
        }}
        class={buttonStyle}
      >
        Yes
      </button>
      <button
        on:click={() => (showDeleteDoubleCheck = false)}
        class={buttonStyle}
      >
        No
      </button>
    </div>
  {:else}
    <button on:click={() => (showDeleteDoubleCheck = true)} class={buttonStyle}>
      Delete this lint
    </button>
  {/if}
</div>

<script lang="ts">
  export let onChange: (str: string) => void;
  export let value: string;
  export let limitWidth: boolean = false;

  let focused = false;
</script>

{#if focused}
  <input
    type="text"
    bind:value
    on:blur={() => {
      onChange(value);
      focused = false;
    }}
    on:keyup={(e) => {
      if (e.key === "Enter") {
        focused = false;
        onChange(value);
      }
    }}
  />
{:else}
  <button on:click={() => (focused = true)} class:wrap-title={limitWidth}>
    {value}
  </button>
{/if}

<style>
  .wrap-title {
    max-width: 205px;
    white-space: break-spaces;
    line-break: anywhere;
  }
</style>

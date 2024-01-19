<script lang="ts">
  export let onChange: (str: string) => void;
  export let value: string;

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
  <button on:click={() => (focused = true)}>
    {value}
  </button>
{/if}

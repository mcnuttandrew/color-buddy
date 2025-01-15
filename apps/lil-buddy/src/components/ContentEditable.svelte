<script lang="ts">
  export let onChange: (str: string) => void;
  export let value: string;
  export let useEditButton: boolean = false;
  export let onClick: () => void = () => {};
  export let displayValue: string = value;

  let focused = false;
</script>

{#if focused}
  <input
    type="text"
    bind:value
    class="border-2 border-gray-300 w-fit"
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
  <button
    on:click={() => {
      if (useEditButton) {
        onClick();
      } else {
        focused = true;
      }
    }}
  >
    {displayValue}
  </button>
{/if}
{#if useEditButton && !focused}
  <button on:click={() => (focused = true)}>✎</button>
{/if}

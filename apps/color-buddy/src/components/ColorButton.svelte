<script lang="ts">
  import { buttonStyle } from "../lib/styles";
  export let color: string;
  export let clickColor: (color: string) => void;
  export let removeColor: (color: string) => void;
</script>

<div
  class="text-sm px-2 transition-colors mr-2 whitespace-nowrap hover:underline flex justify-between items-center mb-2 opacity-100"
>
  <button
    class="w-3 h-3 rounded-full mr-2"
    style="background-color: {color}"
    on:click={() => clickColor(color)}
  ></button>
  <button class="" on:click={() => clickColor(color)}>{color}</button>
  <button class="ml-2" on:click={() => removeColor(color)}>X</button>
</div>

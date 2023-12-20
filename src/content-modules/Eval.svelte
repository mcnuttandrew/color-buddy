<script lang="ts">
  import colorStore from "../stores/color-store";
</script>

<div>
  {#each $colorStore.currentPal.colors as color}
    <div class="flex flex-col">
      <div
        class="w-32 h-12 mr-2 flex justify-center items-center"
        style="background-color: {color.toHex()}"
      >
        <div>{color.toHex()}</div>
      </div>
    </div>
  {/each}
</div>

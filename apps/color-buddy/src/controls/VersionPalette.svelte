<script lang="ts">
  import colorStore from "../stores/color-store";
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
</script>

<button
  class={"text-white"}
  on:click={() => {
    const newPal = { ...currentPal };
    const currentPalNames = new Set($colorStore.palettes.map((v) => v.name));
    let i = 2;
    // regex removes the version number from the name
    const name = newPal.name.replace(/ v\d+$/, "");
    while (currentPalNames.has(`${name} v${i}`)) {
      i++;
    }
    newPal.name = `${name} v${i}`;
    colorStore.createNewPal(newPal);
  }}
>
  Duplicate
</button>

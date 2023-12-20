<script lang="ts">
  import { Color, colorFromString } from "../lib/Color";
  export let color: Color;
  export let onColorChange: (color: Color) => void;
</script>

<div class="flex justify-between">
  <div
    contenteditable="true"
    on:blur={(e) => {
      // @ts-ignore
      const newColor = e.target.textContent;
      try {
        onColorChange(colorFromString(newColor, "lab"));
      } catch (e) {
        console.log(e);
      }
    }}
  >
    {color}
  </div>
</div>

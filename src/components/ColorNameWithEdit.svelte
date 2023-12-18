<script lang="ts">
  import { Color, CIELAB } from "../lib/Color";
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
        onColorChange(CIELAB.fromString(newColor));
      } catch (e) {
        console.log(e);
      }
    }}
  >
    {color}
  </div>
</div>

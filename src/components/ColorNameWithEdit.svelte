<script lang="ts">
  import chroma from "chroma-js";
  import type { Color } from "chroma-js";
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
        onColorChange(chroma(newColor));
      } catch (e) {
        console.log(e);
      }
    }}
  >
    {color}
  </div>
</div>

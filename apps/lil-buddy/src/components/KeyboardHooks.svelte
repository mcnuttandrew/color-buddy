<script lang="ts">
  import store from "../stores/store";
  function onKeyDown(e: any) {
    const tagName = e.target.tagName.toLowerCase();
    const tagType = e.target.type;

    const classes = e.target.getAttribute("class") || "";
    if (tagName === "input" && !classes.includes("color-slider")) {
      const isUIElement =
        tagType === "number" || tagType === "range" || tagType === "text";
      if (isUIElement) {
        return;
      }
    }
    // block code mirror editing
    if (classes.includes("cm-content")) {
      return;
    }
    if (tagName === "textarea") {
      return;
    }
    const key = e.key.toLowerCase();
    const metaKey = e.metaKey || e.ctrlKey;
    // UNDO REDO
    if (key === "z" && metaKey) {
      e.preventDefault();
      store.undo();
    }
    if ((key === "y" && metaKey) || (key === "z" && metaKey && e.shiftKey)) {
      e.preventDefault();
      store.redo();
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} />

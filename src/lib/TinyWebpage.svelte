<script>
  import { store } from "./store";
  $: colors = $store.currentPal;
  // export let colors = ["#f3f3f3", "#333333", "#000000", "#007bff"]; // Default colors
</script>

<div
  class="preview"
  style="--background: {colors[0]}; --header: {colors[1]}; --text: {colors[2]}; --button: {colors[3]}"
>
  <div class="header">Header</div>
  <div class="content">
    <p>Webpage Preview</p>
  </div>
  <button class="button">Button</button>
</div>

<style>
  .preview {
    width: 200px;
    height: 200px;
    color: var(--text);
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .header {
    background-color: var(--header);
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    text-align: center;
    font-size: 0.8rem;
  }

  .content {
    font-size: 0.7rem;
  }

  .button {
    background-color: var(--button);
    color: white;
    border: none;
    padding: 0.3rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.7rem;
  }
</style>

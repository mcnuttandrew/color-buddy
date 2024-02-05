<script lang="ts">
  import lintStore from "../stores/lint-store";
  import Modal from "../components/Modal.svelte";
  import MonacoEditor from "../components/MonacoEditor.svelte";
  import CodeMirror from "svelte-codemirror-editor";
  let value = "";
</script>

<Modal
  showModal={true}
  closeModal={() => {
    lintStore.setFocusedLint(undefined);
  }}
>
  <div class="flex flex-col container">
    <div class="font-bold text-lg">Customize Lint</div>
    <div class="flex flex-col">
      <div class="flex items-center">
        <input type="checkbox" />
        <div class="ml-2">Ignore</div>
      </div>
      <div class="flex items-center">
        <input type="checkbox" />
        <div class="ml-2">Error</div>
      </div>
      <div class="flex items-center">
        <input type="checkbox" />
        <div class="ml-2">Warning</div>
      </div>
    </div>
    <MonacoEditor />
  </div>
</Modal>

<style>
  .container {
    min-width: 800px;
  }
</style>

<script lang="ts">
  // https://www.codelantis.com/blog/sveltekit-monaco-editor
  import { onDestroy, onMount } from "svelte";
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
  export let value: string;
  export let onChange: (value: string) => void;
  export let language: string = "json";

  let editor: Monaco.editor.IStandaloneCodeEditor;
  let monaco: typeof Monaco;
  let editorContainer: HTMLElement;

  onMount(async () => {
    // Import our 'monaco.ts' file here
    // (onMount() will only be executed in the browser, which is what we want)
    monaco = (await import("./monaco")).default;

    // Your monaco instance is ready, let's display some code!
    const editor = monaco.editor.create(editorContainer);
    const model = monaco.editor.createModel(value, language);
    editor.setModel(model);
    editor.onDidChangeModelContent((event) => {
      onChange(editor.getValue());
    });
  });

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose());
    editor?.dispose();
  });
</script>

<div>
  <div class="container" bind:this={editorContainer} />
</div>

<style>
  .container {
    width: 100%;
    min-width: 100%;
    height: 400px;
  }
</style>

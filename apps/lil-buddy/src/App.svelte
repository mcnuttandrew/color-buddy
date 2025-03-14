<script lang="ts">
  import MainTab from "./linting/MainTab.svelte";
  import { buttonStyle } from "./lib/styles";
  import store from "./stores/store";
  import Controls from "./linting/Controls.svelte";
  import Modal from "./components/Modal.svelte";

  import KeyboardHooks from "./components/KeyboardHooks.svelte";
  $: lint = $store.lints.find((lint) => lint.id === $store.focusedLint)!;
  $: isOpen = !lint;
</script>

<main>
  <div
    class="flex justify-between bg-stone-200 h-12 items-center px-2 text-xl font-bold"
  >
    <div class="flex">
      Lil Buddy
      <div class="ml-8">
        <button class={buttonStyle} on:click={() => store.undo()}>Undo</button>
        <button class={buttonStyle} on:click={() => store.redo()}>Redo</button>
      </div>
    </div>

    <div class="flex">
      <a
        class={`${buttonStyle} mr-2`}
        target="_blank"
        href="https://color-buddy-docs.netlify.app/lang-docs.html"
      >
        Docs
      </a>
      <Controls />
    </div>
  </div>
  <MainTab />
  {#if isOpen}
    <Modal
      showModal={true}
      closeModal={() => {
        isOpen = false;
      }}
    >
      <div class="w-full bg-stone-200 px-3 text-2xl font-bold">
        Select a lint to begin
      </div>
      <div class="flex flex-col p-4">
        <div>
          {#each $store.lints || [] as lint}
            <button
              class={"border p-2 rounded"}
              on:click={() => {
                store.setFocusedLint(lint.id);
                store.setFocusedTestToBeValid();
                isOpen = false;
              }}
            >
              {lint.name}
            </button>
          {/each}
        </div>
      </div>
    </Modal>
  {/if}
</main>
<KeyboardHooks />

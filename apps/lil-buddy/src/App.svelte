<script lang="ts">
  import LintCustomizationTab from "./linting/MainTab.svelte";
  import { buttonStyle } from "./lib/styles";
  import store from "./stores/store";
  import LintPicker from "./linting/LintPicker.svelte";

  import NewLintSuggestion from "./linting/NewLintSuggestion.svelte";
  import KeyboardHooks from "./components/KeyboardHooks.svelte";
  $: lint = $store.lints.find((lint) => lint.id === $store.focusedLint)!;
</script>

<main>
  <div
    class="flex justify-between bg-stone-200 h-12 items-center px-4 text-xl font-bold"
  >
    Lil Buddy: "{lint.name}"

    <LintPicker />

    <NewLintSuggestion />
    <a
      class={buttonStyle}
      target="_blank"
      href="https://color-buddy-docs.netlify.app/lang-docs.html"
    >
      Docs
    </a>
  </div>
  {#if lint}
    <LintCustomizationTab />
  {/if}
  {#if !lint}
    <div class="flex flex-col p-4">
      <div>
        {#each $store.lints || [] as lint}
          <button
            class={"border p-2 rounded"}
            on:click={() => {
              store.setFocusedLint(lint.id);
            }}
          >
            {lint.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</main>
<KeyboardHooks />

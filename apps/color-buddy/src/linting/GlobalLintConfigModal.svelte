<script lang="ts">
  import lintStore from "../stores/lint-store";
  import colorStore from "../stores/color-store";
  import { buttonStyle, linkStyle } from "../lib/styles";
  import { lintPacks } from "../lib/pre-built-lint-configs";
  import Modal from "../components/Modal.svelte";
  import { lintGroupNames, typeToImg } from "../constants";
  import { titleCase } from "../lib/utils";

  $: lints = [...$lintStore.lints].sort((a, b) => a.name.localeCompare(b.name));
  $: ignoreList = $colorStore.globallyIgnoredLints;
  $: ignoredSet = new Set(ignoreList);
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];

  $: lintsByGroup = lints.reduce(
    (acc, lint) => {
      acc[lint.group] = acc[lint.group] || [];
      acc[lint.group].push(lint);
      return acc;
    },
    {} as Record<string, (typeof lints)[number][]>
  );

  // note: its still an ignore list under the hood because we don't want to have to include every new lint
  let modalState: "closed" | "open" = "closed";
  function onClose() {
    modalState = "closed";
  }
</script>

<Modal
  showModal={modalState === "open"}
  closeModal={() => {
    modalState = "closed";
    onClose();
  }}
>
  <div class="w-full bg-stone-200 text-xl px-4 py-2 font-bold">
    Evaluation Tests
  </div>
  <div class="flex bg-stone-100 p-4 justify-between pr-8">
    <button
      class={buttonStyle}
      on:click={() =>
        colorStore.setGloballyIgnoredLints(lints.map((x) => x.id))}
    >
      None
    </button>
    <button
      class={buttonStyle}
      on:click={() => colorStore.setGloballyIgnoredLints([])}
    >
      All
    </button>
    {#each lintPacks as pack}
      <div>
        <button
          class={buttonStyle}
          on:click={() => {
            const recommendedList = new Set(pack.lints);
            colorStore.setGloballyIgnoredLints(
              lints.filter((x) => !recommendedList.has(x.id)).map((x) => x.id)
            );
          }}
        >
          {pack.name}
        </button>
        <!-- <span class="text-sm">{pack.description}</span> -->
      </div>
    {/each}
    <a class={linkStyle} href="https://color-buddy-docs.netlify.app/">Help</a>
    {#if Object.keys(currentPal.evalConfig)}
      <div>
        <button
          class={`${buttonStyle}`}
          on:click={() => colorStore.setCurrentPalEvalConfig({})}
        >
          Restore Defaults
        </button>
      </div>
    {/if}
  </div>
  <div class="flex flex-col px-4">
    <div class="flex flex-col overflow-scroll">
      {#each Object.keys(lintGroupNames) as group}
        {#if (lintsByGroup[group] || []).length > 0}
          <div class="mt-2 flex items-center">
            <div class="h-8 w-10 flex items-center justify-center">
              <img
                src={typeToImg[group]}
                class="h-6 w-6"
                alt="Logo for {group}"
              />
            </div>
            <div class="text-lg">{lintGroupNames[group]}</div>
          </div>
        {/if}
        <div class="ml-11">
          {#each lintsByGroup[group] || [] as lint}
            <label class="flex text-sm">
              <input
                type="checkbox"
                checked={!ignoredSet.has(lint.id)}
                class="mr-2"
                on:change={() => {
                  let newLints = [...ignoreList];
                  if (ignoredSet.has(lint.id)) {
                    newLints = newLints.filter((l) => l !== lint.id);
                  } else {
                    newLints.push(lint.id);
                  }
                  colorStore.setGloballyIgnoredLints(newLints);
                }}
              />
              <div class="whitespace-nowrap mr-2">
                {#if lint.taskTypes.length && lint.taskTypes.length !== 3}
                  {lint.taskTypes.map(titleCase).join(", ")}:
                {/if}
                {lint.name}
              </div>
            </label>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</Modal>

<button
  class={buttonStyle}
  on:click={() => {
    modalState = "open";
  }}
>
  Settings
</button>

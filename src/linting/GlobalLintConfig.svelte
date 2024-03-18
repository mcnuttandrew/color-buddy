<script lang="ts">
  import lintStore, { GLOBAL_OKAY_LIST } from "../stores/lint-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";

  $: lints = [...$lintStore.lints].sort((a, b) => a.name.localeCompare(b.name));
  $: ignoreList = $lintStore.globallyIgnoredLints;
  $: ignoredSet = new Set(ignoreList);

  $: lintsByGroup = lints.reduce(
    (acc, lint) => {
      acc[lint.group] = acc[lint.group] || [];
      acc[lint.group].push(lint);
      return acc;
    },
    {} as Record<string, (typeof lints)[number][]>
  );

  const recommendedNonIgnoredLints = new Set(GLOBAL_OKAY_LIST);
</script>

<Tooltip positionAlongRightEdge={true}>
  <div slot="content" class="flex flex-col">
    <div class="font-bold">Global Lint Ignore List</div>
    <div class="italic text-sm">Checked lints will be ignored</div>
    <div class="flex">
      <button
        class={buttonStyle}
        on:click={() =>
          lintStore.setGloballyIgnoredLints(lints.map((x) => x.id))}
      >
        Ignore All
      </button>
      <button
        class={buttonStyle}
        on:click={() => lintStore.setGloballyIgnoredLints([])}
      >
        Ignore none
      </button>
      <button
        class={buttonStyle}
        on:click={() =>
          lintStore.setGloballyIgnoredLints(
            lints
              .filter((x) => !recommendedNonIgnoredLints.has(x.id))
              .map((x) => x.id)
          )}
      >
        Take recommended list
      </button>
    </div>
    <div class="flex flex-col">
      {#each Object.entries(lintsByGroup) as [group, lints]}
        <div class="font-bold mt-2">{group}</div>
        {#each lints as lint}
          <label class="flex text-sm">
            <input
              type="checkbox"
              checked={ignoredSet.has(lint.id)}
              class="mr-2"
              on:change={() => {
                let newLints = [...ignoreList];
                if (ignoredSet.has(lint.id)) {
                  newLints = newLints.filter((l) => l !== lint.id);
                } else {
                  newLints.push(lint.id);
                }
                lintStore.setGloballyIgnoredLints(newLints);
              }}
            />
            <div class="whitespace-nowrap mr-2">
              {lint.name}
              {#if lint.taskTypes.length && lint.taskTypes.length !== 3}
                ({lint.taskTypes.join(", ")})
              {/if}
            </div>
          </label>
        {/each}
      {/each}
    </div>
  </div>
  <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
    SETTINGS
  </button>
</Tooltip>

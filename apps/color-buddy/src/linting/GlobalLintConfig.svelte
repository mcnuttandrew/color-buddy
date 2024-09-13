<script lang="ts">
  import lintStore from "../stores/lint-store";
  import colorStore from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";
  import { lintPacks } from "../lib/pre-built-lint-configs";

  $: lints = [...$lintStore.lints].sort((a, b) => a.name.localeCompare(b.name));
  $: ignoreList = $colorStore.globallyIgnoredLints;
  $: ignoredSet = new Set(ignoreList);

  $: lintsByGroup = lints.reduce(
    (acc, lint) => {
      acc[lint.group] = acc[lint.group] || [];
      acc[lint.group].push(lint);
      return acc;
    },
    {} as Record<string, (typeof lints)[number][]>
  );

  // note: its still an ignore list under the hood because we don't want to have to include every new lint
</script>

<Tooltip positionAlongRightEdge={true}>
  <div slot="content" class="flex flex-col">
    <div class="flex justify-between">
      <div>
        <div class="font-bold">Which lints should be included?</div>
      </div>
      <div>
        <button
          class={buttonStyle}
          on:click={() =>
            colorStore.setGloballyIgnoredLints(lints.map((x) => x.id))}
        >
          Use none
        </button>
        <button
          class={buttonStyle}
          on:click={() => colorStore.setGloballyIgnoredLints([])}
        >
          Use all
        </button>
      </div>
    </div>
    <div class="flex flex-col max-h-96 overflow-scroll">
      {#each Object.entries(lintsByGroup) as [group, lints]}
        <div class="font-bold mt-2">{group}</div>
        {#each lints as lint}
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
              {lint.name}
              {#if lint.taskTypes.length && lint.taskTypes.length !== 3}
                ({lint.taskTypes.join(", ")})
              {/if}
            </div>
          </label>
        {/each}
      {/each}
    </div>
    <div class="italic text-sm mt-2">Suggested lint configurations</div>
    <div>
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
          <span class="text-sm">{pack.description}</span>
        </div>
      {/each}
    </div>
  </div>
  <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
    Settings
  </button>
</Tooltip>

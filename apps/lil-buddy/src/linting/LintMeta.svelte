<script lang="ts">
  import store from "../stores/store";
  import type { LintProgram } from "color-buddy-palette-lint";
  import Tooltip from "../components/Tooltip.svelte";
  import { buttonStyle } from "../lib/styles";

  export let lint: LintProgram;
  const taskTypes = ["sequential", "diverging", "categorical"] as const;
  $: currentTaskTypes = lint?.taskTypes || ([] as string[]);
  let requiredTagAdd = "";
</script>

<div class="">
  <div class="flex flex-col">
    <div class="font-bold">Name</div>
    <input
      class="ml-2 border border-gray-300 rounded px-2 py-1"
      type="text"
      value={lint.name}
      on:change={(e) => {
        // @ts-ignore
        const name = e.target.value;
        store.setCurrentLintName(name);
      }}
    />
  </div>
  <div class="flex flex-wrap">
    <div class="mx-2">
      <div class="font-bold">Group</div>
      <select value={lint.group} class="px-2">
        {#each ["usability", "color-accessibility", "contrast-accessibility", "design", "custom"] as group}
          <option
            value={group}
            on:change={(e) => {
              // @ts-ignore
              store.setCurrentLintGroup(e.currentTarget.value);
            }}
          >
            {group}
          </option>
        {/each}
      </select>
    </div>
    <!-- TASK TYPES -->
    <div class="flex flex-col">
      <div class="mr-2 font-bold">Task Types</div>
      <div class="flex flex-wrap">
        {#each taskTypes as taskType}
          <div class="flex items-center mr-4">
            <label>
              <input
                type="checkbox"
                checked={currentTaskTypes.includes(taskType)}
                on:change={(e) => {
                  const newTasks = currentTaskTypes.includes(taskType)
                    ? currentTaskTypes.filter((x) => x !== taskType)
                    : [...currentTaskTypes, taskType];
                  store.setCurrentLintTaskTypes(newTasks);
                }}
              />
              {taskType}
            </label>
          </div>
        {/each}
      </div>
    </div>
    <!-- TAGS -->
    <div class="flex flex-col">
      <div class="flex">
        <div class="mr-2 font-bold">Required Tags</div>
        <Tooltip positionAlongRightEdge={true}>
          <button class={""} slot="target" let:toggle on:click={toggle}>
            (Add tag)
          </button>

          <div class={buttonStyle} slot="content">
            <form
              on:submit|preventDefault|stopPropagation={() => {
                store.setCurrentTags([...lint.requiredTags, requiredTagAdd]);
                requiredTagAdd = "";
              }}
            >
              <input
                class="border-2 border-gray-300 rounded px-2 py-1"
                type="text"
                bind:value={requiredTagAdd}
              />
            </form>
          </div>
        </Tooltip>
      </div>
      <div class="flex flex-wrap">
        {#each lint.requiredTags as tag}
          <div class="mr-2 border rounded px-2 py-1">
            {tag}
            <button
              class={""}
              on:click={() => {
                const newTags = lint.requiredTags.filter((x) => x !== tag);
                store.setCurrentTags(newTags);
              }}
            >
              X
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
<div>
  <div>Description</div>
  <textarea
    class="ml-2 border-2 border-gray-300 rounded px-2 py-1 w-full"
    value={lint.description}
    on:change={(e) => {
      // @ts-ignore
      const description = e.target.value;
      store.setCurrentLintDescription(description);
    }}
  />
</div>

<div>
  <div class="flex">
    <div class="">Error message</div>
    <div class="text-sm italic ml-4">
      {"If lint failures caused by specific color can mark them via {{blame}}"}
    </div>
  </div>
  <textarea
    class="ml-2 border-2 border-gray-300 rounded px-2 py-1 w-full"
    value={lint.failMessage}
    on:change={(e) => {
      // @ts-ignore
      const errorMessage = e.target.value;
      store.setCurrentLintFailMessage(errorMessage);
    }}
  />
</div>

<script lang="ts">
  import { titleCase } from "../lib/utils";
  export let tabs: string[];
  export let isTabSelected: (tab: string) => boolean;
  export let selectTab: (tab: any) => void;
  export let className: string = "justify-center";
  export let formatter: (x: string) => string = titleCase;
</script>

<nav aria-label="Page navigation" class="{className} flex">
  <ul class="inline-flex">
    {#each tabs as tab}
      <li class="">
        <button
          class="flex px-2 items-center hover:border-stone-700 whitespace-nowrap"
          class:border-black={isTabSelected(tab)}
          class:border-b-2={isTabSelected(tab)}
          class:font-bold={isTabSelected(tab)}
          on:click={() => selectTab(tab)}
        >
          {formatter(tab)}
          <slot name="menu" {tab} />
        </button>
      </li>
    {/each}
  </ul>
</nav>

<script lang="ts">
  import { buttonStyle } from "../lib/styles";
  export let tabs: string[];
  export let isTabSelected: (tab: string) => boolean;
  export let selectTab: (tab: string) => void;
  export let className: string = "";
</script>

<nav aria-label="Page navigation" class="{className} flex justify-center">
  <ul class="inline-flex">
    {#each tabs as tab}
      <li class="">
        <button
          class="h-6 px-2 {buttonStyle} uppercase"
          class:opacity-50={!isTabSelected(tab)}
          class:opacity-100={isTabSelected(tab)}
          on:click={() => selectTab(tab)}
        >
          {tab}
        </button>
      </li>
    {/each}
  </ul>
</nav>

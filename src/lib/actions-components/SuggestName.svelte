<script lang="ts">
  import { store } from "./../store";

  import { suggestNameForPalette } from "../../api-calls";

  let nameSuggestions: string[] = [];
  let requestState: "idle" | "loading" = "idle";
</script>

<button
  class="underline"
  on:click={() => {
    requestState = "loading";
    suggestNameForPalette($store.currentPal)
      .then((x) => {
        nameSuggestions = x;
        requestState = "idle";
      })
      .catch((e) => {
        console.log(e);
        requestState = "idle";
      });
  }}
>
  Suggest a name {#if requestState === "loading"}(loading){/if}
</button>
<div class="flex flex-wrap items-start">
  {#each nameSuggestions as name}
    <button
      class="ml-2 border-2 rounded border-black p-2"
      on:click={() => store.setMostRecentPal(name)}
    >
      ۞{name}
    </button>
  {/each}
</div>
<!-- <button
  on:click={() => {
    nameSuggestions = ["red", "blue", "green"];
  }}
>
  fake it
</button> -->

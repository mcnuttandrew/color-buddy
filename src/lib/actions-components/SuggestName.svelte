<script lang="ts">
  import { store } from "./../store";

  import { suggestNameForPalette } from "../../api-calls";

  let nameSuggestions: string[] = [];
  let requestState: "idle" | "loading" = "idle";
</script>

<div class="border-2 border-white rounded p-2">
  <button
    class="bg-amber-400 text-white rounded p-2"
    on:click={() => {
      if (requestState === "loading") return;
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
    Suggest a name
    {#if requestState === "loading"}(loading)
    {/if}
  </button>

  <div class="flex flex-wrap items-start">
    {#each nameSuggestions as name}
      <div class="ml-2 rounded bg-green-800 text-white">
        <button
          class="rounded p-2"
          on:click={() => store.setMostRecentPal(name)}
        >
          {name}
        </button>
        <button
          on:click={() => {
            nameSuggestions = nameSuggestions.filter((x) => x !== name);
          }}
          class="rounded p-2 bg-amber-700"
        >
          X
        </button>
      </div>
    {/each}
  </div>
  <!-- <button
  on:click={() => {
    nameSuggestions = ["red", "blue", "green"];
  }}
>
  fake it
</button> -->
</div>

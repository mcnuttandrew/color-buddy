<script lang="ts">
  import { buttonStyle } from "../lib/styles";
  export let placeholder = "Search";
  export let searchOptions: string[] = [];
  export let runSearch: (x: string) => void;
  export let setValue: (x: string) => void;
  export let optionsAreColors: boolean = false;
  import { colorCentersFromStoneHeer } from "color-buddy-color-lists";
  let value = "";
  let selectedIndex: number = -1;

  $: currentOptions = value.length
    ? searchOptions.filter((x) => x.toLowerCase().includes(value.toLowerCase()))
    : [];
  $: {
    if (currentOptions.length < selectedIndex) {
      selectedIndex = 0;
    }
  }
</script>

<div class="relative">
  <form on:submit|preventDefault={() => runSearch(value)}>
    <input
      {placeholder}
      bind:value
      type="text"
      class="indent-2 text-sm leading-6"
      on:blur={() => {
        setTimeout(() => {
          currentOptions = [];
        }, 500);
      }}
      on:keydown={(e) => {
        if (e.key === "Escape") {
          e.currentTarget.blur();
          selectedIndex = -1;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          selectedIndex =
            selectedIndex === currentOptions.length - 1 ? 0 : selectedIndex + 1;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          selectedIndex =
            selectedIndex === -1 || selectedIndex === 0
              ? currentOptions.length - 1
              : Math.max(selectedIndex - 1, 0);
        }
        if (e.key === "Enter" && selectedIndex !== -1) {
          setValue(currentOptions[selectedIndex]);
          value = "";
          selectedIndex = -1;
          e.currentTarget.blur();
        }
        const exactOption = currentOptions.find(
          (x) => x.toLowerCase() === value.toLowerCase()
        );
        if (e.key === "Enter" && selectedIndex === -1 && exactOption) {
          setValue(exactOption);
          value = "";
          e.currentTarget.blur();
        }
        if (e.key === "Enter" && selectedIndex === -1) {
          runSearch(value);
          e.currentTarget.blur();
        }
      }}
    />
    <button class={buttonStyle}>Search</button>
  </form>
  {#if currentOptions.length > 0}
    <div class="absolute z-10">
      <div class="bg-white rounded-md shadow-lg">
        {#each currentOptions as option, idx}
          <button
            on:click|preventDefault|stopPropagation={() => {
              console.log("option", option);
              setValue(option);
              value = "";
            }}
            class="p-2 border-2 flex items-center hover:border-blue-900 w-full text-left text-sm"
            class:border-blue-900={selectedIndex === idx}
            class:border-white={selectedIndex !== idx}
          >
            {#if optionsAreColors}
              <div
                class="w-3 h-3 rounded-full mr-2"
                style="background-color: {colorCentersFromStoneHeer[option] ||
                  option}"
              ></div>
            {/if}

            {option.split(value)[0]}
            <b>{value}</b>
            {option.split(value)[1]}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<script lang="ts">
  import colorStore from "../stores/color-store";
  import Tooltip from "../components/Tooltip.svelte";
  import Pencil from "virtual:icons/fa6-solid/pen-to-square";
  import PalTypeConfig from "../controls/PalTypeConfig.svelte";
  import PalTags from "../controls/PalTags.svelte";

  import { oxfordJoin } from "../lib/utils";
  import { buttonStyle } from "../lib/styles";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];

  $: tagsString = oxfordJoin(currentPal.tags);
  let nameBind = currentPal?.name || "";
</script>

<div class="flex text-2xl py-2 px-4 border-b border-l border-stone-200">
  <div class="flex flex-col">
    <div class="flex">
      {currentPal.name}
      <Tooltip>
        <div slot="content">
          <PalTypeConfig />
          <PalTags />
          <div class="flex flex-col">
            <div class="text-xs">Name</div>
            <form
              on:submit|preventDefault={() =>
                colorStore.setCurrentPalName(nameBind)}
            >
              <input
                type="text"
                class={buttonStyle}
                bind:value={nameBind}
                on:blur={colorStore.setCurrentPalName(nameBind)}
              />
            </form>
          </div>
        </div>
        <button
          slot="target"
          let:toggle
          on:click={(x) => {
            toggle();
            nameBind = currentPal.name;
          }}
        >
          <Pencil class="text-sm mx-1" />
        </button>
      </Tooltip>
    </div>
    <div class="text-xs">
      A {currentPal.type} palette{tagsString.length
        ? ` for  ${tagsString} contexts`
        : ""}
    </div>
  </div>
</div>

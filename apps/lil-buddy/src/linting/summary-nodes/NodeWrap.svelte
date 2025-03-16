<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import { Color } from "color-buddy-palette";
  import ColorChannelPicker from "../../components/ColorChannelPicker.svelte";
  export let node: any | null;
  export let options:
    | string[]
    | "number"
    | "boolean"
    | "color"
    | "string"
    | null;
  export let modifyLint: (path: (number | string)[], newValue: any) => void;
  export let classes: string = "";
  export let comment: string = "";
  export let specificValue: any = null;
  export let path: (number | string)[] | null;

  function displayValue(node: any) {
    if (typeof node === "boolean") {
      return node ? "true" : "false";
    }
    if (node.constructorString) {
      return `${node.value} (${node.constructorString})`;
    }
    return node.value || node.type;
  }
  $: value = specificValue || node?.value || null;
  let localSpace = "lab" as any;
  $: isCalculated = !path || path.length < 1;
</script>

<Tooltip>
  <div slot="content" class="max-w-96">
    {#if node}
      {`${node.nodeType}: ${displayValue(node)}`}

      <!-- {#if path && path.length > 1}
        <div class="text-xs text-gray-500">
          {path.map((p) => p).join(".")}
        </div>
      {/if} -->
    {/if}
    {#if !isCalculated}
      {#if options === "number"}
        <input
          {value}
          class="border"
          on:blur={(e) => {
            // @ts-ignore
            modifyLint(path, parseFloat(e.target.value));
          }}
        />
      {:else if options === "color"}
        <ColorChannelPicker
          onSpaceChange={(x) => {
            localSpace = x;
          }}
          colorMode={localSpace}
          color={Color.colorFromHex(
            value?.toHex ? value.toHex() : value,
            localSpace
          )}
          onColorChange={(x) => {
            // @ts-ignore
            modifyLint(path, x.toHex());
          }}
        />
      {:else if options === "string"}
        <input
          {value}
          class="border"
          on:blur={(e) => {
            // @ts-ignore
            modifyLint(path, e.target.value);
          }}
        />
      {:else if options === "boolean"}
        <select
          {value}
          on:change={(e) => {
            // @ts-ignore
            modifyLint(path, e.target.value === "true");
          }}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      {:else if options && Array.isArray(options)}
        <select
          {value}
          on:change={(e) => {
            // @ts-ignore
            modifyLint(path, e.target.value);
          }}
        >
          {#each options as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      {/if}
    {:else if options}
      <div class="text-xs">
        This value is <span class="italic">calculated,</span>
        meaning that it can not be altered directly. To modify it, try changing something
        upstream.
      </div>
    {/if}
    <div>
      {comment}
    </div>
  </div>
  <button class={classes} slot="target" let:toggle on:click={toggle}>
    <slot />
  </button>
</Tooltip>

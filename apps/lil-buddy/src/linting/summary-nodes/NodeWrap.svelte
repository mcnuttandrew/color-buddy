<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  export let node: any | null;
  export let options:
    | string[]
    | "number"
    | "boolean"
    | "color"
    | "string"
    | null;
  export let modifyLint: (path: (number | string)[], newValue: any) => void;
  export let label: string;
  export let classes: string = "";
  export let comment: string = "";
  export let specificValue: any = null;

  $: path = (node?.path || []) as (number | string)[];
  function displayValue(node: any) {
    console.log(node);
    if (typeof node === "boolean") {
      return node ? "true" : "false";
    }
    if (node.constructorString) {
      return `${node.value} (${node.constructorString})`;
    }
    return node.value || node.type;
  }
  $: value = specificValue || node?.value || null;
  $: console.log(node);
</script>

<Tooltip>
  <div slot="content" class="max-w-96">
    {#if node}
      {`${node.nodeType}: ${displayValue(node)}`}

      {#if node && path.length > 1}
        <div class="text-xs text-gray-500">
          {path.map((p) => p).join(".")}
        </div>
      {:else}
        <div class="text-xs">
          This value is <span class="italic">calculated,</span>
          meaning that it can not be altered directly. To modify it, try changing
          something upstream.
        </div>
      {/if}
    {/if}
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
      <input
        type="color"
        value={value?.toHex ? value.toHex() : value}
        on:change={(e) => {
          // @ts-ignore
          modifyLint(path, e.target.value);
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
    <div>
      {comment}
    </div>
  </div>
  <button class={classes} slot="target" let:toggle on:click={toggle}>
    {#if label}
      {label}
    {:else}
      <slot />
    {/if}
  </button>
</Tooltip>

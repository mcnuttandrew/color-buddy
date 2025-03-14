<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  export let node: any;
  export let options: string[] | "number" | "boolean";
  export let modifyLint: (path: (number | string)[], newValue: any) => void;
  export let label: string;
  export let classes: string = "";
</script>

<Tooltip>
  <div slot="content">
    {`${node.nodeType}: ${node.value || node.type}`}
    {#if node.path?.length > 1}
      <div class="text-xs text-gray-500">
        {node.path.map((p) => p).join(".")}
      </div>
      {#if options === "number"}
        <input
          value={node.value}
          class="border"
          on:blur={(e) => {
            // @ts-ignore
            modifyLint(node.path, parseFloat(e.target.value));
          }}
        />
      {:else if options === "boolean"}
        <select
          value={node.value}
          on:change={(e) => {
            // @ts-ignore
            modifyLint(node.path, e.target.value === "true");
          }}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      {:else if options && Array.isArray(options)}
        <select
          value={node.value}
          on:change={(e) => {
            // @ts-ignore
            modifyLint(node.path, e.target.value);
          }}
        >
          {#each options as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      {/if}
    {:else}
      <div class="text-xs">
        This value is <span class="italic">calculated,</span>
        meaning that it can not be altered directly. To modify it, try changing something
        upstream.
      </div>
    {/if}
  </div>
  <button class={classes} slot="target" let:toggle on:click={toggle}>
    {label}
  </button>
</Tooltip>

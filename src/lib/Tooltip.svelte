<script lang="ts">
  let tooltipOpen: boolean = false;
  export let top: string = "4rem";
  export let onClose: () => void = () => {};
  function onClick() {
    tooltipOpen = false;
    onClose();
  }
  function toggle() {
    if (tooltipOpen) {
      onClose();
    }
    tooltipOpen = !tooltipOpen;
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if tooltipOpen}
  <div
    class="hidden-background"
    on:click={() => {
      tooltipOpen = false;
      onClose();
    }}
  ></div>
{/if}

<div class="relative">
  <slot name="target" {toggle}>
    <span class="missing">No content</span>
  </slot>

  <span
    class="tooltip rounded shadow-lg p-4 bg-slate-100 text-black -mt-8 max-w-lg flex-wrap flex"
    class:visibleTooltip={tooltipOpen}
    style={`top: ${top}`}
  >
    <span>
      <slot name="content" {onClick}>
        <span class="missing">No content</span>
      </slot>
    </span>
  </span>
</div>

<style>
  .tooltip {
    @apply invisible absolute;
  }

  .tooltip span:before {
    border-bottom: 10px solid rgb(241 245 249 / var(--tw-bg-opacity));
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    content: "";
    display: block;
    height: 0;
    left: 2px;
    position: absolute;
    top: -10px;
    width: 0;
  }

  .visibleTooltip {
    @apply visible z-50;
  }

  .hidden-background {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background-color: red;
    opacity: 0;
  }
</style>

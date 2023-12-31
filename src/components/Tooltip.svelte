<script lang="ts">
  import Portal from "svelte-portal";
  export let top: string = "4rem";
  export let onClose: () => void = () => {};
  export let initiallyOpen: boolean = false;
  let tooltipOpen: boolean = initiallyOpen;
  const query = "main *";
  function onClick() {
    tooltipOpen = false;
    onClose();
    document.querySelectorAll(query).forEach((x) => {
      x.removeEventListener("click", onClick);
    });
  }
  function toggle() {
    tooltipOpen = !tooltipOpen;
  }
  let target: HTMLElement;
  $: boundingBox =
    tooltipOpen &&
    ((target?.getBoundingClientRect() || {
      x: undefined,
      y: undefined,
    }) as { x?: number; y?: number });

  $: tooltipOpen === true && attachListeners();
  async function attachListeners() {
    await new Promise((resolve) => setTimeout(resolve, 10));

    document.querySelectorAll(query).forEach((x) => {
      x.addEventListener("click", onClick);
    });
  }
</script>

{#if tooltipOpen}
  <Portal target="body">
    <div
      class="absolute min-w-10"
      style={`left: ${boundingBox.x}px; top: calc(${boundingBox.y}px + ${top}); z-index: 1000`}
    >
      <div class="relative">
        <span
          class="tooltip rounded shadow-lg p-4 bg-slate-100 text-black -mt-8 max-w-lg flex-wrap flex"
          style={`top: ${top}`}
        >
          {#if tooltipOpen}
            <span>
              <slot name="content" {onClick}>
                <span class="missing">No content</span>
              </slot>
            </span>
          {/if}
        </span>
      </div>
    </div>
  </Portal>
{/if}
<div bind:this={target}>
  <slot name="target" {toggle} />
</div>

<style>
  .tooltip span:before {
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    display: block;
    top: -10px;
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

<script lang="ts">
  import Portal from "svelte-portal";
  export let top: string = "4rem";
  export let onClose: () => void = () => {};
  export let initiallyOpen: boolean = false;
  export let positionAlongRightEdge: boolean = false;
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

{#if tooltipOpen && boundingBox}
  <Portal target="body">
    <div
      class="absolute min-w-10"
      style={`left: ${boundingBox.x}px; top: calc(${boundingBox.y}px + ${
        top === "top" ? "1px" : top
      }); z-index: 1000`}
    >
      <div class="relative" class:right-edge={positionAlongRightEdge}>
        <span
          class="tooltip rounded shadow-lg p-4 bg-slate-100 text-black max-w-lg flex-wrap flex"
        >
          {#if tooltipOpen}
            <slot name="content" {onClick} />
          {/if}
        </span>
      </div>
    </div>
  </Portal>
{/if}
<div bind:this={target}>
  <slot name="target" {toggle} {tooltipOpen} />
</div>

<style>
  .right-edge {
    right: 100%;
  }
</style>

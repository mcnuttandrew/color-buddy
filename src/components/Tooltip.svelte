<script lang="ts">
  // @ts-nocheck
  import Portal from "svelte-portal";
  import configStore from "../stores/config-store";
  export let top: string = "2rem";
  export let onClose: () => void = () => {};
  export let initiallyOpen: boolean = false;
  export let positionAlongRightEdge: boolean = false;
  export let allowDrag: boolean = false;
  import { draggable } from "../lib/utils";
  export let customClass: string = "";
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
  $: topString = boundingBox
    ? top
      ? `calc(${boundingBox.y}px + ${top})`
      : `${boundingBox.y}px`
    : "0";
  $: leftString = boundingBox ? `${boundingBox.x}px` : "0";
  $: {
    if (boundingBox.y + 300 > window.screen.height) {
      topString = `${window.screen.height - 300}px`;
    }
  }
  $: {
    if (allowDrag && $configStore.tooltipXY) {
      topString = $configStore.tooltipXY[1];
      leftString = $configStore.tooltipXY[0];
    }
  }
</script>

{#if tooltipOpen && boundingBox}
  <Portal target="body">
    <div
      class="absolute min-w-10"
      style={`left: ${leftString}; top: ${topString}; z-index: 1000`}
    >
      <div class="relative" class:right-edge={positionAlongRightEdge}>
        <span
          class="tooltip rounded shadow-lg p-4 bg-slate-100 text-black flex-wrap flex {customClass}"
          class:p-4={true}
        >
          {#if allowDrag}
            <div
              class="absolute cursor-move w-12 h-12 bg-slate-100 rounded-full grab-handle"
              use:draggable
              on:dragmove|preventDefault={(e) => {
                e.preventDefault();
                e.stopPropagation();
                leftString = `${e.detail.x - 20}px`;
                topString = `${e.detail.y - 20}px`;
                configStore.setTooltipXY([leftString, topString]);
              }}
            ></div>
          {/if}
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
    right: calc(100% - 2rem);
  }

  .grab-handle {
    cursor: grab;
    left: -30px;
    top: -30px;
  }
</style>

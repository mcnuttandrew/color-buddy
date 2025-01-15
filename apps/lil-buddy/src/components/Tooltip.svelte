<script lang="ts">
  // @ts-nocheck
  import Portal from "svelte-portal";
  import store from "../stores/store";
  export let top: string | number = "2rem";
  export let onClose: () => void = () => {};
  export let initiallyOpen: boolean = false;
  export let positionAlongRightEdge: boolean = false;
  export let allowDrag: boolean = false;
  import { draggable } from "../lib/utils";
  export let customClass: string = "";
  export let buttonName: string = "";
  export let targetBody: boolean = true;
  export let bg: string = "bg-white";
  let tooltipOpen: boolean = initiallyOpen;

  const query = "main *";
  function onClick(e?: any) {
    if (!targetBody) {
      const tip = document.getElementById("tooltip");
      if (tip && tip.contains(e.target)) {
        return;
      }
    }
    e?.preventDefault();
    e?.stopPropagation();

    tooltipOpen = false;
    onClose();
    document.querySelectorAll(query).forEach((x) => {
      x.removeEventListener("click", onClick);
      // remove select-none class
      const newClass = x?.getAttribute("class")?.replace("select-none", "");
      x.setAttribute("class", newClass);
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
    await new Promise((resolve) => setTimeout(resolve, 100));

    document.querySelectorAll(query).forEach((x) => {
      x.addEventListener("click", onClick);
      const newClass = x.getAttribute("class") + " select-none";
      x.setAttribute("class", newClass);
    });
  }
  function getLeftOffset(): number {
    if (targetBody) {
      return 0;
    }
    const dialog = document.querySelector("dialog");
    if (!dialog) {
      return 0;
    }
    return dialog.getBoundingClientRect().x;
  }

  $: leftOffset = tooltipOpen && getLeftOffset();

  $: topString = boundingBox
    ? top
      ? `calc(${boundingBox.y}px + ${top})`
      : `${boundingBox.y}px`
    : "0";
  $: leftString = boundingBox
    ? `${boundingBox.x - leftOffset}px`
    : `${-leftOffset}`;
  $: {
    if (boundingBox.y + 500 > window.screen.height) {
      topString = `${window.screen.height - 500}px`;
    }
  }
  $: {
    if (tooltipOpen && allowDrag && $store.tooltipXY?.length) {
      const [x, y] = $store.tooltipXY;
      topString = y;
      leftString = x;
    }
  }
</script>

{#if tooltipOpen && boundingBox}
  <Portal target={targetBody ? "body" : "dialog"}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="absolute min-w-10"
      id="tooltip"
      style={`left: ${leftString}; top: ${topString}; z-index: 1000;`}
      on:click|stopPropagation={(e) => {
        const id = e.target.id;
        if (id === "tooltip") {
          onClick(e);
        }
      }}
    >
      <div
        class="relative"
        class:right-edge={positionAlongRightEdge}
        class:border-bg-stone={true}
        class:border-2={true}
      >
        <span
          class="tooltip rounded shadow-lg p-4 {bg} text-black flex-wrap flex {customClass}"
          class:p-4={true}
        >
          {#if allowDrag}
            <div
              class="absolute cursor-move w-12 h-12 bg-stone-300 rounded-full grab-handle"
              use:draggable
              on:dragmove|preventDefault={(e) => {
                e.preventDefault();
                e.stopPropagation();
                leftString = `${e.detail.x - 20}px`;
                topString = `${e.detail.y - 20}px`;
                store.setTooltipXY([leftString, topString]);
              }}
            ></div>
          {/if}
          <slot name="content" {onClick} open={tooltipOpen} />
        </span>
      </div>
    </div>
  </Portal>
{/if}

<div bind:this={target} class:text-cyan-800={tooltipOpen}>
  <slot name="target" {toggle} {tooltipOpen}>
    {#if buttonName}
      <button class={""} on:click={toggle}>{buttonName}</button>
    {/if}
  </slot>
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

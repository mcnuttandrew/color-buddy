<script lang="ts">
  // from https://github.com/mhkeller/svelte-double-range-slider/tree/master
  export let start = 0;
  export let end = 1;
  const clamp = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);
  let topHandle: HTMLDivElement;
  let body: HTMLDivElement;
  let slider: HTMLDivElement;
  function draggable(node: any) {
    let x: number;
    let y: number;
    function handleMousedown(event: {
      type: string;
      touches: any[];
      clientX: any;
      clientY: any;
    }) {
      if (event.type === "touchstart") {
        event = event.touches[0];
      }
      x = event.clientX;
      y = event.clientY;
      node.dispatchEvent(new CustomEvent("dragstart", { detail: { x, y } }));
      window.addEventListener("mousemove", handleMousemove);
      window.addEventListener("mouseup", handleMouseup);
      window.addEventListener("touchmove", handleMousemove);
      window.addEventListener("touchend", handleMouseup);
    }
    function handleMousemove(event: {
      type: string;
      changedTouches: any[];
      clientX: number;
      clientY: number;
    }) {
      if (event.type === "touchmove") {
        event = event.changedTouches[0];
      }
      const dx = event.clientX - x;
      const dy = event.clientY - y;
      x = event.clientX;
      y = event.clientY;
      node.dispatchEvent(
        new CustomEvent("dragmove", { detail: { x, y, dx, dy } })
      );
    }
    function handleMouseup(event: { clientX: any; clientY: any }) {
      x = event.clientX;
      y = event.clientY;
      node.dispatchEvent(new CustomEvent("dragend", { detail: { x, y } }));
      window.removeEventListener("mousemove", handleMousemove);
      window.removeEventListener("mouseup", handleMouseup);
      window.removeEventListener("touchmove", handleMousemove);
      window.removeEventListener("touchend", handleMouseup);
    }
    node.addEventListener("mousedown", handleMousedown);
    node.addEventListener("touchstart", handleMousedown);
    return {
      destroy() {
        node.removeEventListener("mousedown", handleMousedown);
        node.removeEventListener("touchstart", handleMousedown);
      },
    };
  }
  function setHandlePosition(which: string) {
    return function (evt: { detail: { y: number } }) {
      const { top, bottom } = slider.getBoundingClientRect();
      const parentHeight = bottom - top;
      const p = Math.min(Math.max((evt.detail.y - top) / parentHeight, 0), 1);
      if (which === "start") {
        start = p;
        end = Math.max(end, p);
      } else {
        start = Math.min(p, start);
        end = p;
      }
    };
  }
  function setHandlesFromBody(evt: any) {
    const { height } = body.getBoundingClientRect();
    const { top, bottom } = slider.getBoundingClientRect();
    const parentHeight = bottom - top;
    const topHandleTop = topHandle.getBoundingClientRect().top;
    const pyStart = clamp(
      topHandleTop + event.detail.dy - top,
      0,
      parentHeight - height
    );
    const pyEnd = clamp(pyStart + height, height, parentHeight);
    const pStart = pyStart / parentHeight;
    const pEnd = pyEnd / parentHeight;
    start = pStart;
    end = pEnd;
  }
</script>

<div class="double-range-container">
  <div class="slider" bind:this={slider}>
    <div
      class="body"
      bind:this={body}
      use:draggable
      on:dragmove|preventDefault|stopPropagation={setHandlesFromBody}
      style="top: {100 * start}%; bottom: {100 * (1 - end)}%;"
    ></div>
    <div
      class="handle"
      bind:this={topHandle}
      data-which="start"
      use:draggable
      on:dragmove|preventDefault|stopPropagation={setHandlePosition("start")}
      style="top: {100 * start}%"
    ></div>
    <div
      class="handle"
      data-which="end"
      use:draggable
      on:dragmove|preventDefault|stopPropagation={setHandlePosition("end")}
      style="top: {100 * end}%"
    ></div>
  </div>
</div>

<style>
  .double-range-container {
    height: 100%;
    width: 20px;
    user-select: none;
    box-sizing: border-box;
    white-space: nowrap;
  }
  .slider {
    position: relative;
    height: 100%;
    width: 6px;
    left: 50%;
    transform: translate(-50%, 0);
    background-color: #e2e2e2;
    box-shadow:
      inset 0 7px 10px -5px #4a4a4a,
      inset 0 -1px 0px 0px #9c9c9c;
    border-radius: 1px;
  }
  .handle {
    position: absolute;
    left: 50%;
    width: 0;
    height: 0;
  }
  .handle:after {
    content: " ";
    box-sizing: border-box;
    position: absolute;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    background-color: #fdfdfd;
    border: 1px solid #7b7b7b;
    transform: translate(-50%, -50%);
  }
  /* .handle[data-which="end"]:after{
		transform: translate(-100%, -50%);
	} */
  .handle:active:after {
    background-color: #ddd;
    z-index: 9;
  }
  .body {
    left: 0;
    position: absolute;
    background-color: #34a1ff;
    right: 0;
  }
</style>

<script lang="ts">
  import { toColorSpace, colorFromChannels, Color } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { avgColors } from "../../lib/utils";
  import { buttonStyle } from "../../lib/styles";

  let isOpen = false;
  $: focusedColors = $focusStore.focusedColors;
  $: colors = $colorStore.currentPal.colors;
  $: angle = 0;

  $: colorSpace = $colorStore.currentPal.colors[0].spaceName;
  $: angle, rotatePoints();
  $: memorizedColors = false as false | Color[];
  let rotationPoint = "avg" as number | "avg" | "zero";
  function rotatePoints() {
    if (!isOpen) {
      return;
    }
    if (!memorizedColors) {
      memorizedColors = [...colors];
      angle = 0;
    }
    let localColors = memorizedColors;

    let centerChannels = [0, 0, 0];
    if (rotationPoint === "avg") {
      const clrs = focusedColors.map((x) => localColors[x]);
      // @ts-ignore
      let center = avgColors(clrs, colorSpace);
      centerChannels = center.toChannels();
    } else if (rotationPoint === "zero") {
      centerChannels = [0, 0, 0];
    } else {
      centerChannels = localColors[rotationPoint].toChannels();
    }

    const rotated = Object.fromEntries(
      focusedColors
        .map((x) => localColors[x])
        .map((localColor) => {
          const color = toColorSpace(localColor, colorSpace);
          const channels = color.toChannels();
          //   https://math.stackexchange.com/questions/4354438/how-to-rotate-a-point-on-a-cartesian-plane-around-something-other-than-the-origi
          const x1 = channels[1];
          const y1 = channels[2];
          const xc = centerChannels[1];
          const yc = centerChannels[2];
          const radAngle = (angle / 360) * Math.PI * 2;
          const x3 =
            Math.cos(radAngle) * (x1 - xc) -
            Math.sin(radAngle) * (y1 - yc) +
            xc;
          const y3 =
            Math.sin(radAngle) * (x1 - xc) +
            Math.cos(radAngle) * (y1 - yc) +
            yc;
          return colorFromChannels([channels[0], x3, y3], colorSpace);
        })
        .map((x, y) => [y, x])
    );
    const newColors = localColors.map((x, idx) =>
      focusedColors.includes(idx) ? rotated[focusedColors.indexOf(idx)] : x
    );
    colorStore.setCurrentPalColors(newColors);
  }

  function setRotatePoint(point: typeof rotationPoint) {
    rotationPoint = point;
  }
</script>

{#if focusedColors.length > 1}
  <Tooltip
    onClose={() => {
      isOpen = false;
      memorizedColors = false;
      angle = 0;
    }}
  >
    <div slot="content" class="flex flex-col">
      Rotate: {angle}
      <input min={0} max={360} step={1} type="range" bind:value={angle} />
      <span class="text-sm">
        Rotates about an average point of the selected colors.
      </span>
      <div>Around which point?</div>
      <div class="flex flex-wrap">
        <button
          on:click={() => setRotatePoint("avg")}
          class={`${buttonStyle} mb-2`}
          class:border-black={rotationPoint === "avg"}
          class:border-2={rotationPoint === "avg"}
        >
          An average of the selected colors
        </button>
        <button
          on:click={() => setRotatePoint("zero")}
          class={`${buttonStyle} mb-2`}
          class:border-black={rotationPoint === "zero"}
          class:border-2={rotationPoint === "zero"}
        >
          Around zero
        </button>
        <div class="flex flex-wrap">
          {#each focusedColors as colorIdx}
            <button
              class={`${buttonStyle} flex justify-center items-center`}
              class:border-black={rotationPoint === colorIdx}
              class:border-2={rotationPoint === colorIdx}
              on:click={() => setRotatePoint(colorIdx)}
            >
              {colors[colorIdx].toHex()}
              <span
                style={`background-color: ${colors[colorIdx].toHex()}`}
                class="rounded-full w-3 h-3 ml-2"
              ></span>
            </button>
          {/each}
        </div>
      </div>
    </div>
    <span slot="target" let:toggle>
      <button
        class={buttonStyle}
        on:click={() => {
          isOpen = true;
          toggle();
        }}
      >
        Rotate
      </button>
    </span>
  </Tooltip>
{/if}

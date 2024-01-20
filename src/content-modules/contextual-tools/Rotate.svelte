<script lang="ts">
  import { Color } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import Tooltip from "../../components/Tooltip.svelte";
  import { avgColors } from "../../lib/utils";
  import { buttonStyle } from "../../lib/styles";

  let axis = "z" as "x" | "y" | "z";
  let isOpen = false;
  $: focusedColors = $focusStore.focusedColors;
  $: colors = $colorStore.currentPal.colors;
  $: angle = 0;

  $: colorSpace = $colorStore.currentPal.colorSpace;
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
          const color = Color.toColorSpace(localColor, colorSpace);
          const channels = color.toChannels();
          //   https://math.stackexchange.com/questions/4354438/how-to-rotate-a-point-on-a-cartesian-plane-around-something-other-than-the-origi
          const channelMap = {
            x: [0, 2],
            y: [0, 1],
            z: [1, 2],
          };
          const channelA = channelMap[axis][0];
          const channelB = channelMap[axis][1];

          const x1 = channels[channelA];
          const y1 = channels[channelB];
          const xc = centerChannels[channelA];
          const yc = centerChannels[channelB];
          const radAngle = (angle / 360) * Math.PI * 2;
          const x3 =
            Math.cos(radAngle) * (x1 - xc) -
            Math.sin(radAngle) * (y1 - yc) +
            xc;
          const y3 =
            Math.sin(radAngle) * (x1 - xc) +
            Math.cos(radAngle) * (y1 - yc) +
            yc;
          let newChannels = [0, 0, 0] as [number, number, number];
          switch (axis) {
            case "x":
              newChannels = [x3, channels[1], y3];
              break;
            case "y":
              newChannels = [x3, y3, channels[2]];
              break;
            case "z":
              newChannels = [channels[0], x3, y3];
              break;
          }
          return Color.colorFromChannels(newChannels, colorSpace);
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
    customClass="w-96"
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
        <div class="flex">
          Rotate about the
          <select bind:value={axis} class="mx-1">
            {#each ["x", "y", "z"] as axis}
              <option value={axis}>{axis}</option>
            {/each}
          </select>
          Axis
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

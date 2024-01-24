<script lang="ts">
  import { Color } from "../../lib/Color";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import { avgColors } from "../../lib/utils";
  import { buttonStyle, buttonStyleSelected } from "../../lib/styles";
  import Tooltip from "../../components/Tooltip.svelte";

  let axis = "z" as "x" | "y" | "z";
  $: focusedColors = $focusStore.focusedColors;
  $: colors = $colorStore.currentPal.colors;
  $: angle = 0;

  $: colorSpace = $colorStore.currentPal.colorSpace;
  $: angle, rotatePoints();
  $: memorizedColors = false as false | Color[];
  let rotationPoint = "zero " as number | "avg" | "zero";
  function rotatePoints() {
    if (focusedColors.length === 0) {
      // memorizedColors = false;
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
    } else if (localColors[rotationPoint]) {
      centerChannels = localColors[rotationPoint].toChannels();
    } else {
      centerChannels = [0, 0, 0];
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

{#if focusedColors.length > 0}
  <div class="w-full border-t-2 border-black my-2"></div>
  <div class="flex justify-between w-full">
    <div class="font-bold">Rotate</div>
    <Tooltip>
      <button slot="target" let:toggle on:click={toggle}>⚙</button>
      <div slot="content">
        <div class="flex flex-col">
          <div>Around which point?</div>
          <div class="flex flex-wrap">
            <button
              on:click={() => setRotatePoint("avg")}
              class={`${buttonStyle} mb-2 ${
                rotationPoint === "avg" ? buttonStyleSelected : ""
              }`}
            >
              An average of the selected colors
            </button>
            <button
              on:click={() => setRotatePoint("zero")}
              class={`${buttonStyle} mb-2 ${
                rotationPoint === "zero" ? buttonStyleSelected : ""
              }`}
            >
              Around zero
            </button>

            {#each focusedColors as colorIdx}
              <button
                class={`${buttonStyle} flex justify-center items-center ${
                  rotationPoint === colorIdx ? buttonStyleSelected : ""
                }`}
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
    </Tooltip>
  </div>
  <div class="flex flex-col">
    <div class="w-full flex justify-between">
      <input min={0} max={360} step={1} type="range" bind:value={angle} />
      <input
        min={0}
        max={360}
        step={1}
        type="number"
        bind:value={angle}
        class="w-16 text-sm"
      />
    </div>
  </div>
{/if}

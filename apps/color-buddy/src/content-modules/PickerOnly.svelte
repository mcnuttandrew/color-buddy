<script lang="ts">
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import { colorPickerConfig } from "../lib/utils";
  import { nameColor } from "color-buddy-color-namer";
  import Background from "../components/Background.svelte";
  import SetSimulation from "../controls/SetSimulation.svelte";
  import { buttonStyle, controlButtonStyle } from "../lib/styles";
  import focusStore from "../stores/focus-store";
  import DownChev from "virtual:icons/fa6-solid/angle-down";
  import DupAndDelete from "../controls/DupAndDelete.svelte";
  import Tooltip from "../components/Tooltip.svelte";
  import { Color, makePalFromString } from "color-buddy-palette";
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: colors = currentPal.colors;
  $: colorNames = colors.map((x) => nameColor(x)[0]);
  $: bgLum = currentPal.background.luminance();
</script>

<div class="flex flex-col pb-2 min-w-[600px]">
  <div class="text-center flex py-2 px-4 bg-stone-100">
    <Background
      onSpaceChange={(space) => {
        // @ts-ignore
        configStore.setChannelPickerSpaceBackground(space);
      }}
      onChange={(bg) =>
        colorStore.setBackground(bg.toColorSpace(currentPal.colorSpace))}
      bg={currentPal.background}
      colorSpace={$configStore.channelPickerSpaceBackground}
    />
    <SetSimulation />
    <button
      class={buttonStyle}
      on:click|stopPropagation|preventDefault={() => {
        const newColorChannels = [
          Math.random(),
          Math.random(),
          Math.random(),
        ].map((x) => Math.floor(x * 255));
        const preColor = makePalFromString([
          `rgb(${newColorChannels.join(",")})`,
        ]).colors;
        const newColor = Color.toColorSpace(preColor[0], currentPal.colorSpace);
        const newColors = [...colors, newColor];
        colorStore.setCurrentPalColors(newColors);
      }}
    >
      Add Color
    </button>
  </div>
  <div class="flex justify-center flex-wrap py-4">
    {#each currentPal?.colors || [] as color, idx}
      <div class="mx-2 border border-stone-300 rounded my-2 min-w-48">
        <!-- header with controls -->
        <div class="bg-stone-100 flex justify-between items-center px-2 py-2">
          <div>{colorNames[idx]}</div>
          <Tooltip
            positionAlongRightEdge={false}
            top={"20px"}
            bg="bg-white"
            onClose={() => {
              focusStore.clearColors();
            }}
          >
            <button
              slot="target"
              let:toggle
              on:click={() => {
                focusStore.setColors([idx]);
                toggle();
              }}
            >
              <DownChev />
            </button>
            <div slot="content" class="flex flex-col items-start w-64">
              <DupAndDelete />
              <button
                class={`${buttonStyle} `}
                on:click|stopPropagation|preventDefault={() => {
                  // move every element to the left
                  const newColors = [...colors];

                  newColors[idx] = colors[idx - 1];
                  newColors[idx - 1] = colors[idx];
                  colorStore.setSort(newColors);
                }}
              >
                Move Up
              </button>
              <button
                class={buttonStyle}
                on:click|stopPropagation|preventDefault={() => {
                  // move every element to the right
                  const newColors = [...colors];

                  newColors[idx] = colors[idx + 1];
                  newColors[idx + 1] = colors[idx];
                  colorStore.setSort(newColors);
                }}
              >
                Move down
              </button>
            </div>
          </Tooltip>
        </div>
        <!-- input -->
        <div
          class="flex flex-col w-full items-center p-4"
          style={`background: ${currentPal.background.toHex()}`}
        >
          <input
            type="color"
            value={color.toString()}
            on:input={(e) => {
              // @ts-ignore
              const newVal = e?.target?.value;
              const newColors = [...colors];
              newColors[idx] = color
                .fromString(newVal)
                .toColorSpace(currentPal.colorSpace);
              colorStore.setCurrentPalColors(newColors);
            }}
            class="w-20 h-20 border border-stone-300 rounded cursor-pointer"
          />
          <span
            class="text-sm italic"
            class:text-black={bgLum > 0.5}
            class:text-white={bgLum <= 0.5}
          >
            Click to edit
          </span>
        </div>
      </div>
    {/each}
  </div>
</div>

<script lang="ts">
  import { Color } from "color-buddy-palette";
  import { colorPickerConfig } from "../lib/utils";
  import ColorIO from "colorjs.io";
  import { buttonStyle } from "../lib/styles";

  export let color: Color;
  export let onColorChange: (color: Color) => void;
  export let onSpaceChange: (space: string) => void;
  export let colorMode: any = "lab";
  $: measuredColorMode = color.spaceName;
  type Channel = {
    name: string;
    min: number;
    max: number;
    step: number;
    value?: number;
  };

  $: colorConfigs =
    color &&
    ({
      rgb: [
        { name: "Red", min: 0, max: 255, step: 1 },
        { name: "Green", min: 0, max: 255, step: 1 },
        { name: "Blue", min: 0, max: 255, step: 1 },
      ],
      // srgb: [
      //   { name: "Red", min: 0, max: 1, step: 0.01 },
      //   { name: "Green", min: 0, max: 1, step: 0.01 },
      //   { name: "Blue", min: 0, max: 1, step: 0.01 },
      // ],
      hsl: [
        { name: "Hue", min: 0, max: 360, step: 1 },
        { name: "Saturation", min: 0, max: 100, step: 1 },
        { name: "Lightness", min: 0, max: 100, step: 1 },
      ],
      lab: [
        { name: "L", min: 0, max: 100, step: 1 },
        { name: "a", min: -125, max: 125, step: 1 },
        { name: "b", min: -125, max: 125, step: 1 },
      ],
      // oklab: [
      //   { name: "L", min: 0, max: 1, step: 0.01 },
      //   { name: "a", min: -0.4, max: 0.4, step: 0.01 },
      //   { name: "b", min: -0.4, max: 0.4, step: 0.01 },
      // ],
      hsv: [
        { name: "h", min: 0, max: 360, step: 1 },
        { name: "s", min: 0, max: 100, step: 1 },
        { name: "v", min: 0, max: 100, step: 1 },
      ],
      lch: [
        { name: "L", min: 0, max: 100, step: 1 },
        { name: "c", min: 0, max: 150, step: 1 },
        { name: "h", min: 0, max: 360, step: 1 },
      ],
      // hct: [
      //   { name: "h", min: 0, max: 360, step: 1 },
      //   { name: "c", min: 0, max: 145, step: 1 },
      //   { name: "t", min: 0, max: 100, step: 1 },
      // ],
      // "cam16-jmh": [
      //   { name: "j", min: 0, max: 100, step: 1 },
      //   { name: "m", min: 0, max: 105, step: 1 },
      //   { name: "h", min: 0, max: 360, step: 1 },
      // ],
      // jzazbz: [
      //   { name: "jz", min: 0, max: 1, step: 0.01 },
      //   { name: "az", min: -0.5, max: 0.5, step: 0.01 },
      //   { name: "bz", min: -0.5, max: 0.5, step: 0.01 },
      // ],
    } as Record<string, Channel[]>);
  const colorModeMap: any = { rgb: "srgb" };
  function toColorIO() {
    try {
      return new ColorIO(color.toString());
    } catch (e) {
      return new ColorIO(color.toHex());
    }
  }
  $: color &&
    colorMode &&
    colorConfigs[colorMode] &&
    toColorIO()
      .to(colorModeMap[colorMode] || colorMode)
      .coords.forEach((val, idx) => {
        // @ts-ignore
        let newVal = typeof val === "object" ? val.valueOf() : val;
        if (colorMode === "rgb") newVal *= 255;
        colorConfigs[colorMode][idx].value = newVal;
      });

  // adapted from https://colorjs.io/apps/picker/lab, https://github.dev/color-js/color.js
  function buildSliderSteps() {
    const coord_meta = colorConfigs[colorMode];

    let spaceId = colorModeMap[colorMode] || colorMode;
    const coords = new ColorIO(color.toHex()).to(spaceId).coords;
    let ret = [];

    for (let i = 0; i < coord_meta.length; i++) {
      let { min, max } = coord_meta[i];
      let steps = [] as string[];
      const NUM_STEP = 10;
      for (let jdx = 0; jdx <= NUM_STEP; jdx++) {
        const newChannels = [...coords] as [number, number, number];
        newChannels[i] = min + (max - min) * (jdx / NUM_STEP);
        if (colorMode === "rgb") {
          newChannels[i] /= 255;
        }
        const newColor = Color.colorFromChannels(newChannels, spaceId);
        steps.push(newColor.toDisplay());
      }
      ret.push(steps.join(", "));
    }
    return ret;
  }
  $: sliderSteps = color && colorMode && buildSliderSteps();

  function colorUpdate(e: any, idx: number) {
    let values = [...colorConfigs[colorMode].map((x) => x.value)] as number[];
    values[idx] = Number(e.target.value);
    if (colorMode.includes("rgb")) {
      values = values.map((x) => x / 255);
    }
    const newColor = Color.colorFromChannels(
      values as [number, number, number],
      colorModeMap[colorMode] || colorMode
    );
    const outColor = Color.toColorSpace(newColor, measuredColorMode);
    onColorChange(outColor);
  }

  $: formatter = (x: any) => Number(colorPickerConfig[colorMode].axisLabel(x));
</script>

<div class="flex flex-col">
  <div class="flex h-full items-center justify-between">
    <div>Color Space</div>
    <select
      class="h-full {buttonStyle}"
      value={colorMode}
      on:change={(e) => onSpaceChange(e.currentTarget.value)}
    >
      {#each [...Object.keys(colorConfigs)] as colorMode}
        <option value={colorMode}>{colorMode}</option>
      {/each}
    </select>
  </div>
  <div class="flex h-full mr-2">
    <div class="flex flex-col">
      <div class="flex flex-col">
        <div class="w-full">
          {#each colorConfigs[colorMode] as channel, idx}
            <div class="flex items-start flex-col mb-2">
              <div class="flex">
                <label class="block uppercase text-sm mt-2">
                  <div class="flex w-full justify-between items-center">
                    <span class="whitespace-nowrap mr-2">
                      {channel.name} ({channel.min}-{channel.max})
                    </span>
                    <input
                      class="h-6 text-right w-16 border-2"
                      type="number"
                      value={formatter(channel.value)}
                      min={channel.min}
                      max={channel.max}
                      step={channel.step}
                      on:input={(e) => colorUpdate(e, idx)}
                    />
                  </div>
                  <input
                    class="color-slider"
                    type="range"
                    style={`--stops: ${sliderSteps[idx]}`}
                    value={channel.value}
                    min={channel.min}
                    max={channel.max}
                    step={channel.step}
                    on:input={(e) => colorUpdate(e, idx)}
                    on:input={(e) => colorUpdate(e, idx)}
                  />
                </label>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :root {
    --transparency: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill-opacity=".05"><rect width="50" height="50" /><rect x="50" y="50" width="50" height="50" /></svg>')
      0 0 / 20px 20px #f8f8f8;
  }

  .color-slider {
    display: block;
    margin: 0 1em auto 0;
    width: 100%;
    -moz-appearance: none;
    appearance: none;
    -webkit-appearance: none;
    background: linear-gradient(to right, var(--stops)), var(--transparency);
    height: 2.2em;
    border-radius: 0.3em;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
    /* min-width: 285px; */
    min-width: 225px;
  }

  .color-slider::-webkit-slider-thumb {
    width: 1em;
    height: 2.3em;
    -webkit-appearance: none;
    border-radius: 0.15em;
    border: 1px solid black;
    box-shadow: 0 0 0 1px white;
  }

  .color-slider::-moz-range-thumb {
    width: 1em;
    height: 2.3em;
    border-radius: 0.15em;
    border: 1px solid black;
    box-shadow: 0 0 0 1px white;
    background: transparent;
  }

  .color-slider::-moz-range-track {
    background: none;
  }
</style>

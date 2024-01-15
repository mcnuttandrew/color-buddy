<script lang="ts">
  import {
    Color,
    colorFromChannels,
    toColorSpace,
    colorPickerConfig,
  } from "../lib/Color";
  import ColorIO from "colorjs.io";
  export let color: Color;
  export let onColorChange: (color: Color) => void;
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
      srgb: [
        { name: "Red", min: 0, max: 1, step: 0.01 },
        { name: "Green", min: 0, max: 1, step: 0.01 },
        { name: "Blue", min: 0, max: 1, step: 0.01 },
      ],
      hsl: [
        { name: "Hue", min: 0, max: 360, step: 1 },
        { name: "Saturation", min: 0, max: 100, step: 1 },
        { name: "Lightness", min: 0, max: 100, step: 1 },
      ],
      lab: [
        { name: "L", min: 0, max: 100, step: 1 },
        { name: "a", min: -110, max: 110, step: 1 },
        { name: "b", min: -110, max: 110, step: 1 },
      ],
      oklab: [
        { name: "L", min: 0, max: 1, step: 0.01 },
        { name: "a", min: -0.4, max: 0.4, step: 0.01 },
        { name: "b", min: -0.4, max: 0.4, step: 0.01 },
      ],
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
      jzazbz: [
        { name: "jz", min: 0, max: 1, step: 0.01 },
        { name: "az", min: -0.5, max: 0.5, step: 0.01 },
        { name: "bz", min: -0.5, max: 0.5, step: 0.01 },
      ],
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
    toColorIO()
      .to(colorModeMap[colorMode] || colorMode)
      .coords.forEach((val, idx) => {
        // @ts-ignore
        const newVal = typeof val === "object" ? val.valueOf() : val;
        colorConfigs[colorMode][idx].value = newVal;
      });

  // largely copped from https://colorjs.io/apps/picker/lab, https://github.dev/color-js/color.js
  function buildSliderSteps() {
    const coord_meta = colorConfigs[colorMode];

    let spaceId = colorModeMap[colorMode] || colorMode;
    const coords = new ColorIO(color.toHex()).to(spaceId).coords;
    const alpha = 1;

    let ret = [];

    for (let i = 0; i < coord_meta.length; i++) {
      let { name, min, max } = coord_meta[i];

      let start = coords.slice() as [number, number, number];
      start[i] = min;
      let color1 = new ColorIO(spaceId, start, alpha);

      let end = coords.slice() as [number, number, number];
      end[i] = max;
      let color2 = new ColorIO(spaceId, end, alpha);

      let interpolationOptions = { space: spaceId, steps: 10 };

      if (name[0].toLowerCase() === "h") {
        // @ts-ignore
        interpolationOptions.hue = "raw";
      }

      let steps = ColorIO.steps(color1, color2, interpolationOptions);
      // @ts-ignore
      ret.push(steps.map((c) => c.display()).join(", "));
    }

    // Push alpha too
    let color1 = new ColorIO(spaceId, coords, 0);
    let color2 = new ColorIO(spaceId, coords, 1);
    let steps = ColorIO.steps(color1, color2, { steps: 10 })
      // @ts-ignore
      .map((c) => c.display())
      .join(", ");
    ret.push(steps);
    return ret;
  }
  $: sliderSteps = color && (buildSliderSteps() as any);

  function colorUpdate(e: any, idx: number) {
    let values = [...colorConfigs[colorMode].map((x) => x.value)] as number[];
    values[idx] = Number(e.target.value);
    if (colorMode.includes("rgb")) {
      values = values.map((x) => x * 255);
    }
    const newColor = colorFromChannels(
      values as [number, number, number],
      colorMode
    );
    const outColor = toColorSpace(newColor, measuredColorMode);
    onColorChange(outColor);
  }

  $: formatter = (x: any) => Number(colorPickerConfig[colorMode].axisLabel(x));
</script>

<div class="flex flex-col">
  <select bind:value={colorMode}>
    {#each [...Object.keys(colorConfigs), "hex"] as colorMode}
      <option value={colorMode}>{colorMode}</option>
    {/each}
  </select>
  <div class="flex h-full pl-2 mr-2">
    <div class="flex flex-col">
      <div class="flex flex-col">
        <div class="w-full">
          {#each colorConfigs[colorMode] as channel, idx}
            <div class="flex items-start flex-col mb-2">
              <div class="flex">
                <label class="block uppercase text-sm mt-2">
                  <div class="flex w-full justify-between">
                    <span>{channel.name} ({channel.min}-{channel.max})</span>
                    <input
                      class="w-full h-4 text-right"
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
    min-width: 300px;
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

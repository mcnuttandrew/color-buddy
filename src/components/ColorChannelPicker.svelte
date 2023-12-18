<script lang="ts">
  import chroma from "chroma-js";
  import { Color } from "../lib/Color";
  export let color: Color;
  export let onColorChange: (color: Color) => void;
  // type ColorMode = "hsl" | "rgb" | "lab" | "hsv";
  type ColorMode = "lab";
  export let colorMode: string = "lab";
  // let colorMode: ColorMode = "lab";
  type Channel = {
    name: string;
    min: number;
    max: number;
    step: number;
    value?: number;
  };
  $: colorConfigs = {
    // rgb: [
    //   { name: "Red", min: 0, max: 255, step: 1 },
    //   { name: "Green", min: 0, max: 255, step: 1 },
    //   { name: "Blue", min: 0, max: 255, step: 1 },
    // ],
    // hsl: [
    //   { name: "Hue", min: 0, max: 360, step: 1 },
    //   { name: "Saturation", min: 0, max: 1, step: 0.01 },
    //   { name: "Lightness", min: 0, max: 1, step: 0.01 },
    // ],
    lab: [
      { name: "l", min: 0, max: 100, step: 1 },
      { name: "a", min: -110, max: 110, step: 1 },
      { name: "b", min: -110, max: 110, step: 1 },
    ],
    // hsv: [
    //   { name: "Hue", min: 0, max: 360, step: 1 },
    //   { name: "Saturation", min: 0, max: 1, step: 0.01 },
    //   { name: "Value", min: 0, max: 1, step: 0.01 },
    // ],
  } as Record<string, Channel[]>;
  $: {
    if (color) {
      (Object.keys(colorConfigs) as ColorMode[]).forEach((key) => {
        colorConfigs[key].forEach((channel, idx) => {
          // colorConfigs[key][idx].value = (color as any)[key]()[idx];
          console.log(color.channels[key]);
          colorConfigs[key][idx].value = color.channels[key];
        });
      });
    }
  }
  const toColor = {
    // rgb: (colors: number[]) => chroma.rgb(colors[0], colors[1], colors[2]),
    // hsl: (colors: number[]) => chroma.hsl(colors[0], colors[1], colors[2]),
    lab: (colors: number[]) => chroma.lab(colors[0], colors[1], colors[2]),
    // hsv: (colors: number[]) => chroma.hsv(colors[0], colors[1], colors[2]),
  };

  $: console.log(colorConfigs.lab);
  let dragging = false;
</script>

<div>
  <div class="flex h-full pl-2">
    <div class="flex flex-col">
      <!-- <select bind:value={colorMode}>
        {#each Object.keys(colorConfigs) as mode}
          <option value={mode}>{mode}</option>
        {/each}
      </select> -->
      <div class="flex flex-col">
        <div>
          {#each colorConfigs[colorMode] as channel, idx}
            <div class="flex items-start flex-col">
              <div class="flex">
                <span>{channel.name}</span>
                <input
                  type="number"
                  class="w-full ml-2"
                  min={channel.min}
                  max={channel.max}
                  step={channel.step}
                  value={(channel.value || 0).toFixed(6)}
                  on:click={(e) => {
                    const values = [
                      ...colorConfigs[colorMode].map((x) => x.value),
                    ];
                    // @ts-ignore
                    values[idx] = Number(e.target.value);
                    // @ts-ignore
                    onColorChange(toColor[colorMode](values));
                  }}
                />
              </div>
              <input
                type="range"
                min={channel.min}
                max={channel.max}
                step={channel.step}
                value={channel.value || 0}
                on:mousedown={() => {
                  dragging = true;
                }}
                on:click={(e) => {
                  const values = [
                    ...colorConfigs[colorMode].map((x) => x.value),
                  ];
                  // @ts-ignore
                  values[idx] = Number(e.target.value);
                  // @ts-ignore
                  onColorChange(toColor[colorMode](values));
                }}
                on:mousemove={(e) => {
                  if (!dragging) return;
                  const values = [
                    ...colorConfigs[colorMode].map((x) => x.value),
                  ];
                  // @ts-ignore
                  values[idx] = Number(e.target.value);
                  // @ts-ignore
                  onColorChange(toColor[colorMode](values));
                }}
                on:mouseup={() => {
                  dragging = false;
                }}
              />
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

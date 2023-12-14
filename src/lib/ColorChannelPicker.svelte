<script lang="ts">
  import chroma from "chroma-js";
  export let color: string;
  export let onColorChange: (color: string) => void;
  export let heading: string;

  $: chromaColor = chroma(color);

  type ColorMode = "hsl" | "rgb";
  let colorMode: ColorMode = "rgb";
  type Channel = {
    name: string;
    min: number;
    max: number;
    step: number;
    value?: number;
  };
  $: colorConfigs = {
    rgb: [
      { name: "Red", min: 0, max: 255, step: 1 },
      { name: "Green", min: 0, max: 255, step: 1 },
      { name: "Blue", min: 0, max: 255, step: 1 },
    ],
    // ranges might be wrong
    hsl: [
      { name: "Hue", min: 0, max: 360, step: 1 },
      { name: "Saturation", min: 0, max: 1, step: 0.01 },
      { name: "Lightness", min: 0, max: 1, step: 0.01 },
    ],
  } as Record<ColorMode, Channel[]>;
  $: {
    if (chromaColor) {
      (Object.keys(colorConfigs) as ColorMode[]).forEach((key) => {
        colorConfigs[key].forEach((channel, idx) => {
          colorConfigs[key][idx].value = (chromaColor as any)[key]()[idx];
        });
      });
    }
  }
  const toColor = {
    rgb: (colors: number[]) => chroma.rgb(colors[0], colors[1], colors[2]),
    hsl: (colors: number[]) => chroma.hsl(colors[0], colors[1], colors[2]),
  };

  let dragging = false;
</script>

<div>
  <div class="flex justify-between">
    <span>{heading}</span>
    <div
      contenteditable="true"
      on:blur={(e) => {
        const newColor = e.target.textContent;
        try {
          onColorChange(chroma(newColor).hex());
        } catch (e) {
          console.log(e);
        }
      }}
    >
      {color}
    </div>
  </div>
  <div class="flex h-full pl-2" style="border-left: 20px solid {color};">
    <div class="flex flex-col">
      <select bind:value={colorMode}>
        {#each Object.keys(colorConfigs) as mode}
          <option value={mode}>{mode}</option>
        {/each}
      </select>
      <div class="flex flex-col">
        <div>
          {#each colorConfigs[colorMode] as channel, idx}
            <div class="flex items-start flex-col">
              <div class="w-8">{channel.name}</div>
              <input
                type="range"
                min={channel.min}
                max={channel.max}
                step={channel.step}
                value={channel.value}
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
                  const newVal = toColor[colorMode](values).hex();
                  onColorChange(newVal);
                }}
                on:mousemove={(e) => {
                  if (!dragging) return;
                  const values = [
                    ...colorConfigs[colorMode].map((x) => x.value),
                  ];
                  // @ts-ignore
                  values[idx] = Number(e.target.value);
                  // @ts-ignore
                  const newVal = toColor[colorMode](values).hex();
                  onColorChange(newVal);
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

<script lang="ts">
  import type { Palette } from "@color-buddy/palette-check";
  export let beforePal: Palette;
  export let afterPal: Palette;
  const xStep = 30;
  const xMargin = 30;
  $: width =
    Math.max(beforePal.colors.length, afterPal.colors.length) * xStep + xMargin;
  const rowHeight = 40;
  const height = rowHeight * 2;
  const radius = 12;
  $: arrows = beforePal.colors.reduce(
    (acc, x, idx) => {
      const afterIdx = afterPal.colors.findIndex(
        (y) => y.color.toHex() === x.color.toHex()
      );
      if (afterIdx === -1) return acc;
      acc.push({
        x1: idx * xStep + xMargin,
        y1: rowHeight / 2,
        x2: afterIdx * xStep + xMargin,
        y2: rowHeight * 1.5,
      });
      return acc;
    },
    [] as { x1: number; y1: number; x2: number; y2: number }[]
  );
</script>

<svg {width} {height}>
  <!-- backgrounds -->
  <rect {width} height={height / 2} fill={beforePal.background.toHex()} />

  <rect
    y={height / 2}
    {width}
    height={height / 2}
    fill={beforePal.background.toHex()}
  />

  <!-- lines -->
  {#each arrows as arrow}
    <line
      x1={arrow.x1}
      y1={arrow.y1}
      x2={arrow.x2}
      y2={arrow.y2}
      stroke="black"
      stroke-width="2"
    />
  {/each}

  <!-- points -->
  {#each beforePal.colors as color, idx}
    <circle
      cx={idx * xStep + xMargin}
      cy={rowHeight / 2}
      r={radius}
      fill={color.color.toHex()}
    />
  {/each}

  {#each afterPal.colors as color, idx}
    <circle
      cx={idx * xStep + xMargin}
      cy={rowHeight * 1.5}
      r={radius}
      fill={color.color.toHex()}
    />
  {/each}
  <text
    transform="translate({rowHeight / 2 - 5} 75) rotate(-90)"
    font-size={10}
  >
    After
  </text>
  <text
    transform="translate({rowHeight / 2 - 5} 35) rotate(-90)"
    font-size={10}
  >
    Before
  </text>
</svg>

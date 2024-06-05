<script lang="ts">
  export let xPos: number;
  export let yPos: number;
  export let lum: number;
  export let selected: boolean;
  $: markColor = lum > 0.4 ? "#00000022" : "#ffffff55";
  $: size = selected ? 7 : 3;
</script>

<g pointer-events="none" transform={`translate(${xPos}, ${yPos})`}>
  <line
    pointer-events="none"
    stroke={markColor}
    stroke-width="2"
    x1={-size}
    y1={-size}
    x2={size}
    y2={size}
  ></line>
  <line
    pointer-events="none"
    stroke={markColor}
    stroke-width="2"
    x1={-size}
    y1={size}
    x2={size}
    y2={-size}
  ></line>
</g>

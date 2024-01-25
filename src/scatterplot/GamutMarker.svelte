<script lang="ts">
  export let xPos: number;
  export let yPos: number;
</script>

<g pointer-events="none" transform={`translate(${xPos}, ${yPos})`}>
  <line
    pointer-events="none"
    stroke="black"
    x1={-7}
    y1={-7}
    x2={7}
    y2={7}
  ></line>
  <line
    pointer-events="none"
    stroke="black"
    x1={-7}
    y1={7}
    x2={7}
    y2={-7}
  ></line>
</g>

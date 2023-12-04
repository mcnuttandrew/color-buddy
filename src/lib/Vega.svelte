<script lang="ts">
  import vegaEmbed from "vega-embed";

  let actions = false;
  export let spec: any;
  export let theme: any;
  let container: any;
  $: spec &&
    vegaEmbed(container, JSON.parse(JSON.stringify(spec)), {
      actions,
      config: theme,
    }).catch((e) => {
      console.log("chart error", e);
    });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  bind:this={container}
  on:click={(e) => {
    if (e.vegaType) {
      actions = !actions;
    }
  }}
/>

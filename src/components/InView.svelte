<script lang="ts">
  import { onMount } from "svelte";

  export let root = undefined as any;
  export let isInViewProp = false;

  let isInView = false;
  let observer;
  let element: HTMLElement;

  $: isInView, (isInViewProp = isInView);

  const onChangeVisibility = (e: any) => {
    isInView = e[0].isIntersecting;
  };

  onMount(() => {
    let options = {
      root: root,
    };

    observer = new IntersectionObserver(onChangeVisibility, options);
    observer.observe(element);
  });
</script>

<div class="c" bind:this={element}>
  {#if isInView}
    <slot />
  {/if}
</div>

<script lang="ts">
  import Tooltip from "./Tooltip.svelte";
  import configStore from "../stores/config-store";
  import Config from "../controls/Config.svelte";
</script>

<div class="flex">
  <Config />
  <div>
    <button class={"text-white"} on:click={() => configStore.setTour(true)}>
      Tour
    </button>
  </div>
  <Tooltip positionAlongRightEdge>
    <button slot="target" let:toggle on:click={toggle} class="text-white px-4">
      About
    </button>
    <div slot="content" class="w-52 text-sm">
      Color buddy is an application that helps you build excellent color
      palettes. It was originally written at the

      <a
        class="underline text-cyan-800"
        href="https://uwdata.github.io/"
        target="_blank"
      >
        UW IDL.
      </a>
      You can learn more about it at the{" "}
      <a
        class="underline text-cyan-800"
        href="https://color-buddy-docs.netlify.app/"
        target="_blank"
      >
        docs.
      </a>
      You can also find the source code on{" "}
      <a
        class="underline text-cyan-800"
        href="      https://github.com/mcnuttandrew/color-buddy"
        target="_blank"
      >
        GitHub.
      </a>
      If you have any feedback or questions, please feel free to reach out via the
      github issues page or via email. A small amount of non-identifiable usage data
      is collected to help improve the application.
    </div>
  </Tooltip>
</div>

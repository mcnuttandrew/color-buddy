<script lang="ts">
  import Tooltip from "../components/Tooltip.svelte";
  import store from "../stores/store";
  import type { Palette } from "color-buddy-palette";
  import { makePalFromString } from "color-buddy-palette";
  import { modifyPalette } from "../lib/api-calls";
  import { buttonStyle } from "../lib/styles";
  export let palette: Palette;
  export let updatePal: (newPal: Palette) => void;
  let prompt = "";
  let requestState = "idle" as "idle" | "loading" | "loaded" | "failed";

  function runPrompt(onFinish: () => void = () => {}) {
    requestState = "loading";
    modifyPalette(prompt, palette, $store.engine).then((newPals) => {
      const pal = newPals.at(0) as
        | { colors: string[]; background: string }
        | undefined;

      requestState = "idle";
      if (!pal) return;
      updatePal({
        ...palette,
        ...makePalFromString(pal.colors, pal.background),
      });
      onFinish();
    });
  }
</script>

<Tooltip>
  <div slot="content" let:onClick>
    <div class="text-xs">Call an AI to make modifications to the palette</div>
    <form
      on:submit|preventDefault={() => runPrompt(onClick)}
      class="flex flex-col"
    >
      <textarea
        bind:value={prompt}
        on:keypress={(e) => {
          if (e.key === "Enter") {
            // @ts-ignore
            e.target.blur();
            runPrompt(onClick);
          }
        }}
        id="pal-prompt"
        class="indent-2 text-sm leading-6 border-2"
        placeholder="Make it cool"
      />
      <button
        class={buttonStyle}
        class:pointer-events-none={requestState === "loading"}
      >
        {requestState === "loading" ? "loading..." : "Submit"}
      </button>
    </form>
  </div>
  <button slot="target" let:toggle on:click={toggle} class={buttonStyle}>
    Modify ✨
  </button>
</Tooltip>

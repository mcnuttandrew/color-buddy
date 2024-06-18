<script lang="ts">
  import configStore from "../stores/config-store";
  import { Color } from "@color-buddy/palette-lint";
  import type { Palette } from "@color-buddy/palette-lint";
  import Tooltip from "../components/Tooltip.svelte";
  import colorStore from "../stores/color-store";
  import { buttonStyle } from "../lib/styles";
  const aiModes = [
    // "google",
    "openai",
    "anthropic",
  ] as const;
  $: showBg = $configStore.showColorBackground;
  $: showOutOfGamut = $configStore.showGamutMarkers;

  const isMac = navigator.userAgent.indexOf("Mac OS X") !== -1;
  const metaKey = isMac ? "⌘" : "ctrl";
  const altKey = isMac ? "option" : "alt";
  const shortCuts = [
    { name: "Undo", shortcut: `${metaKey}+z` },
    { name: "Redo", shortcut: `${metaKey}+y` },
    { name: "Delete Selection", shortcut: "delete" },
    { name: "Copy", shortcut: `${metaKey}+c` },
    { name: "Paste", shortcut: `${metaKey}+v` },
    { name: "Move in x-y", shortcut: "arrow keys" },
    { name: "Move in z", shortcut: `${altKey}+up/down keys` },
  ];

  function importPals() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target as FileReader).result as string;
        const palettes = JSON.parse(text);
        if (Array.isArray(palettes)) {
          const pals: Palette[] = palettes
            .filter((x) => {
              const { colors, background, name, colorSpace, type } = x;
              return (
                Array.isArray(colors) &&
                colors.every((c: any) => typeof c === "string") &&
                typeof background === "string" &&
                typeof name === "string" &&
                typeof colorSpace === "string" &&
                typeof type === "string"
              );
            })
            .map((x) => {
              const { colors, background, name, colorSpace, type } = x;
              return {
                background: Color.colorFromString(background, colorSpace),
                colorSpace,
                colors: colors.map((c: string) =>
                  Color.colorFromString(c, colorSpace)
                ),
                colorSemantics: colors.map(() => ({
                  size: undefined,
                  markType: undefined,
                  tags: [],
                })),
                evalConfig: {},
                name,
                type,
                tags: [],
              };
            });
          colorStore.setPalettes(pals);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
</script>

<Tooltip>
  <button class={buttonStyle} slot="target" let:toggle on:click={toggle}>
    Config ⚙
  </button>
  <div slot="content">
    <div class="flex mb-4">
      <button
        class={buttonStyle}
        on:click={() => {
          const pals = $colorStore.palettes.map((x) => {
            const { colors, background, name, colorSpace, type } = x;
            return {
              background: background.toHex(),
              colorSpace,
              colors: colors.map((c) => c.color.toHex()),
              name,
              type,
            };
          });
          const blob = new Blob([JSON.stringify(pals)], {
            type: "application/json",
          });

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;

          // the filename you want
          a.download = "palettes-export.json";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }}
      >
        Export Palettes
      </button>
      <button class={buttonStyle} on:click={() => importPals()}>
        Import Palettes
      </button>
      <button
        class={buttonStyle}
        on:click={() => {
          colorStore.clearPalettes();
        }}
      >
        Clear Palettes
      </button>
    </div>
    <div class="font-bold">Configurations</div>
    <div>Pick AI Provider</div>
    <div>
      {#each aiModes as ai}
        <button
          class={buttonStyle}
          class:font-bold={ai === $configStore.engine}
          on:click={() => configStore.setEngine(ai)}
        >
          {ai}
        </button>
      {/each}
    </div>
    <div>Background on drag</div>
    {#each ["show", "hide"] as show}
      <button
        class={buttonStyle}
        class:font-bold={(show === "show" && showBg) ||
          (show == "hide" && !showBg)}
        on:click={() => configStore.setShowColorBackground(show === "show")}
      >
        {show}
      </button>
    {/each}
    <div>Show Out of Gamut Marker</div>
    {#each ["show", "hide"] as show}
      <button
        class={buttonStyle}
        class:font-bold={(show === "show" && showOutOfGamut) ||
          (show == "hide" && !showOutOfGamut)}
        on:click={() => configStore.setShowGamutMarkers(show === "show")}
      >
        {show}
      </button>
    {/each}

    <div class="font-bold mt-4">Short cuts</div>
    <div>
      {#each shortCuts as { name, shortcut }}
        <div class="flex justify-between">
          <div class="mr-4">{name}</div>
          <div>{shortcut}</div>
        </div>
      {/each}
    </div>
  </div>
</Tooltip>

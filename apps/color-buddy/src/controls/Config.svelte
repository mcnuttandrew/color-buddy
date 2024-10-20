<script lang="ts">
  import configStore from "../stores/config-store";
  import { Color } from "color-buddy-palette";
  import type { Palette } from "color-buddy-palette";
  import Tooltip from "../components/Tooltip.svelte";
  import colorStore from "../stores/color-store";
  import { buttonStyle } from "../lib/styles";
  import Nav from "../components/Nav.svelte";
  import QuestionIcon from "virtual:icons/fa6-solid/circle-question";
  import ChevDown from "virtual:icons/fa6-solid/chevron-down";
  const aiModes = [
    // "google",
    "openai",
    "anthropic",
    "none",
  ] as string[];

  const isMac = navigator.userAgent.indexOf("Mac OS X") !== -1;
  const metaKey = isMac ? "⌘" : "ctrl";
  const altKey = isMac ? "option" : "alt";
  const shortCuts = [
    { name: "Undo", shortcut: `${metaKey}+z` },
    { name: "Redo", shortcut: `${metaKey}+y` },
    { name: "Select All", shortcut: `${metaKey}+a` },
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
                folder: "",
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

<Tooltip positionAlongRightEdge={true}>
  <button
    class={"text-white flex items-center mr-10 "}
    slot="target"
    let:toggle
    on:click={toggle}
  >
    <QuestionIcon />
    <ChevDown class="ml-2" />
  </button>
  <div slot="content" class="w-96" let:onClick>
    <div class="font-bold">About</div>
    <div class="text-sm my-2">
      Color buddy is a tool for building color palettes.
      <!-- It was originally
      written at the

      <a
        class="underline text-cyan-800"
        href="https://uwdata.github.io/"
        target="_blank"
      >
        UW IDL
      </a>
      and is now a product of the

      <a
        class="underline text-cyan-800"
        href="https://www.sci.utah.edu/"
        target="_blank"
      >
        Scientific Computing and Imaging Institute.
      </a> -->
      You can learn more about it at the{" "}
      <a
        class="underline text-cyan-800"
        href="https://color-buddy-docs.netlify.app/"
        target="_blank"
      >
        docs.
      </a>

      Feedback (via github issues or email) is welcome.
    </div>
    <div class="font-bold">What is saved and where?</div>
    <div class="text-sm my-2">
      Palettes are saved in your browser's local storage. They are not shared!
      They are not available on other browsers or devices. A small amount of
      non-identifiable usage data is collected to help improve the application.
    </div>

    <div class="font-bold">Tools</div>
    <div class="flex">
      <button
        class={buttonStyle}
        on:click={() => {
          configStore.setTour(true);
          onClick();
        }}
      >
        Show Tour
      </button>
      <!-- <button class={buttonStyle} on:click={() => importPals()}>
        Import Palettes
      </button> -->
    </div>

    <div class="font-bold mt-4">Short cuts</div>
    <div class="text-sm">
      {#each shortCuts as { name, shortcut }}
        <div class="flex justify-between">
          <div class="mr-4">{name}</div>
          <div>{shortcut}</div>
        </div>
      {/each}
    </div>

    <div class="font-bold mt-4">Configurations</div>
    <div class="mt-2">AI Provider</div>

    <Nav
      tabs={aiModes}
      className="text-sm"
      isTabSelected={(x) => x === $configStore.engine}
      selectTab={(x) => configStore.setEngine(x)}
    />
  </div>
</Tooltip>

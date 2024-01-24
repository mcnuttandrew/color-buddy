<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import colorStore from "../../stores/color-store";
  import focusStore from "../../stores/focus-store";
  import configStore from "../../stores/config-store";
  import { ColorLint } from "../../lib/lints/ColorLint";
  import type { Palette } from "../../stores/color-store";
  import PalDiff from "../../components/PalDiff.svelte";

  import { buttonStyle } from "../../lib/styles";
  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";
  export let check: ColorLint<any, any>;

  $: suggestion = false as false | Palette;

  function proposeFix(useAi: boolean = false) {
    requestState = "loading";
    let hasRetried = false;
    const getFix = () => {
      if (useAi) {
        return check.suggestAIFix().then((x) => {
          suggestion = x;
          requestState = "loaded";
        });
      } else {
        return check.suggestFix().then((x) => {
          suggestion = x;
          requestState = "loaded";
        });
      }
    };

    getFix().catch((e) => {
      console.log(e);
      if (!hasRetried) {
        requestState = "failed";
      } else {
        hasRetried = true;
        return getFix();
      }
    });
  }
  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: evalConfig = currentPal.evalConfig;
  function updateEvalConfig(
    checkName: string,
    value: any,
    formatter: "number" | "string"
  ) {
    let val = value;
    if (val.target.value) {
      val =
        formatter === "number" ? Number(val.target.value) : val.target.value;
    }
    colorStore.setCurrentPalEvalConfig({
      ...evalConfig,
      [checkName]: { ...evalConfig[checkName], val },
    });
  }

  function activateCB() {
    const match = options.find((x) => check.name.includes(x));
    if (match) {
      configStore.setColorSim(match);
    }
  }
  const options = ["deuteranopia", "protanopia", "tritanopia"] as const;
  $: cbMatch = options.find((x) =>
    check.name.includes(x)
  ) as (typeof options)[number];
</script>

<Tooltip positionAlongRightEdge={true}>
  <div slot="content" let:onClick>
    {#if cbMatch}
      <button
        class={buttonStyle}
        on:click={() => configStore.setColorSim(cbMatch)}
      >
        Activate {cbMatch} simulator
      </button>
    {/if}
    <button class={buttonStyle} on:click={() => proposeFix(true)}>
      Try to fix (AI)
    </button>
    {#if check.hasHeuristicFix}
      <button class={buttonStyle} on:click={() => proposeFix(false)}>
        Try to fix (hueristics)
      </button>
    {/if}

    <button
      class={buttonStyle}
      on:click={() => {
        colorStore.setCurrentPalEvalConfig({
          ...evalConfig,
          [check.name]: { ignore: true },
        });
      }}
    >
      Ignore for this palette
    </button>
    {#if check.paramOptions.type !== "none"}
      <div>
        <div>Adjust check parameter</div>
        {#if check.paramOptions.type === "number"}
          <input
            min={check.paramOptions.min}
            max={check.paramOptions.max}
            type="number"
            step={check.paramOptions.step}
            value={check.config.val}
            on:change={(e) => updateEvalConfig(check.name, e, "number")}
          />
        {/if}
        {#if check.paramOptions.type === "enum"}
          <select
            value={check.config.val}
            on:change={(e) => updateEvalConfig(check.name, e, "string")}
          >
            {#each check.paramOptions.options as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        {/if}
      </div>
    {/if}

    {#if requestState === "loading"}
      <div>Loading...</div>
    {:else if requestState === "failed"}
      <div>Failed to generate suggestions</div>
    {:else if requestState === "loaded" && suggestion}
      <div class="flex flex-col">
        <PalDiff beforePal={currentPal} afterPal={suggestion} />
        <div class="flex justify-between">
          <button
            class={buttonStyle}
            on:click={() => {
              colorStore.setCurrentPal(suggestion);
              focusStore.clearColors();
              requestState = "idle";
              suggestion = false;
              onClick();
            }}
          >
            Use
          </button>
          <button
            class={buttonStyle}
            on:click={() => {
              requestState = "idle";
            }}
          >
            Reject
          </button>
        </div>
      </div>
    {/if}
  </div>
  <button slot="target" let:toggle class={` ml-4`} on:click={toggle}>🛠️</button>
</Tooltip>

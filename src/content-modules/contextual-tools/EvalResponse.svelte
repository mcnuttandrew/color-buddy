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

  function proposeFix() {
    requestState = "loading";
    let hasRetried = false;
    const getFix = () =>
      check.suggestFix($configStore.engine).then((x) => {
        suggestion = x;
        requestState = "loaded";
      });

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
  $: evalConfig = $colorStore.currentPal.evalConfig;
  function updateEvalConfig(
    checkName: string,
    value: any,
    formatter: any = (x) => x
  ) {
    let val = value;
    if (val.target.value) {
      val = formatter(val.target.value);
    }
    colorStore.setCurrentPalEvalConfig({
      ...evalConfig,
      [checkName]: { ...evalConfig[checkName], val },
    });
  }
</script>

<Tooltip positionAlongRightEdge={true}>
  <div slot="content" let:onClick>
    <button class={buttonStyle} on:click={() => proposeFix()}>
      Try to fix
    </button>
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
            on:change={(e) => updateEvalConfig(check.name, e, (x) => Number(x))}
          />
        {/if}
        {#if check.paramOptions.type === "enum"}
          <select
            value={check.config.val}
            on:change={(e) => updateEvalConfig(check.name, e)}
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
        <PalDiff beforePal={$colorStore.currentPal} afterPal={suggestion} />
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

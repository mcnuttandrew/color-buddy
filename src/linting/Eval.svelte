<script lang="ts">
  import colorStore from "../stores/color-store";
  import configStore from "../stores/config-store";
  import lintStore from "../stores/lint-store";
  import { ColorLint } from "../lib/lints/ColorLint";

  import { runLintChecks } from "../lib/linter";
  import { buttonStyle } from "../lib/styles";
  import LintDisplay from "./LintDisplay.svelte";
  import EvalColorColumn from "./EvalColorColumn.svelte";
  import LintCustomizationModal from "./LintCustomizationModal.svelte";
  import Nav from "../components/Nav.svelte";
  import NewLintSuggestion from "./NewLintSuggestion.svelte";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: palType = currentPal.type;
  $: evalConfig = currentPal.evalConfig;
  $: customLints = $lintStore.lints;
  $: checks = runLintChecks(currentPal, palType, customLints, evalConfig);

  $: checkGroups = checks.reduce(
    (acc, check) => {
      if (!acc[check.group]) {
        acc[check.group] = [];
      }
      acc[check.group].push(check);
      return acc;
    },
    {} as Record<string, ColorLint<any, any>[]>
  );

  const titleCase = (str: string) =>
    str
      .split(" ")
      .map((x) => x[0].toUpperCase() + x.slice(1))
      .join(" ");

  function setGroupTo(checks: ColorLint<any, any>[], ignore: boolean) {
    const newEvalConfig = { ...evalConfig };
    checks.forEach((check) => {
      newEvalConfig[check.name] = { ignore };
    });
    colorStore.setCurrentPalEvalConfig(newEvalConfig);
  }
  $: isCompact = $configStore.evalDisplayMode === "compact";
</script>

<div class="flex h-full">
  <EvalColorColumn {checks} />
  <div class="flex flex-col ml-2">
    <Nav
      tabs={["regular", "compact"]}
      isTabSelected={(x) => x === $configStore.evalDisplayMode}
      selectTab={(x) => {
        //@ts-ignore
        configStore.setEvalDisplayMode(x);
      }}
    />
    <div class="overflow-auto h-full max-w-lg">
      <div class="flex items-start justify-start">
        {#if Object.keys(currentPal.evalConfig)}
          <button
            class={`${buttonStyle} ml-0 pl-0 `}
            on:click={() => colorStore.setCurrentPalEvalConfig({})}
          >
            Restore Defaults
          </button>
        {/if}
        <NewLintSuggestion />
      </div>
      <div class="text-sm">
        This collection of checks validates whether or not your palette matches
        a number of commonly held beliefs about best practices. They will not
        fit every situation or task (so you should feel unashamed if you ignore
        some of them), but they are a good starting point for thinking about how
        to improve your palette.
      </div>
      {#each Object.entries(checkGroups) as checkGroup}
        <div class="flex mt-4">
          <div class="font-bold">{titleCase(checkGroup[0])} Checks</div>
          <button
            class={`${buttonStyle} `}
            on:click={() => setGroupTo(checkGroup[1], true)}
          >
            ignore all
          </button>
          {#if checkGroup[1].some((x) => evalConfig[x.name]?.ignore)}
            <button
              class={`${buttonStyle} `}
              on:click={() => setGroupTo(checkGroup[1], false)}
            >
              re-enable all
            </button>
          {/if}
        </div>
        <div class="flex">
          {#if isCompact}
            {#each checkGroup[1] as check}
              {#if check.passes}
                <LintDisplay {check} justSummary={true} />
              {/if}
            {/each}
          {/if}
        </div>
        {#each checkGroup[1] as check}
          {#if !isCompact || (isCompact && !check.passes)}
            <LintDisplay {check} />
          {/if}
        {/each}
      {/each}
    </div>
  </div>
  {#if $lintStore.focusedLint !== false}
    <LintCustomizationModal />
  {/if}
</div>

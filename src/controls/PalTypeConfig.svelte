<script>
  import colorStore from "../stores/color-store";
  import { affects, contexts } from "../types";

  $: currentPal = $colorStore.palettes[$colorStore.currentPal];
  $: palType = currentPal.type;

  import GetColorsFromString from "../controls/GetColorsFromString.svelte";
  const descriptions = {
    sequential:
      "Sequential palettes are used to represent a range of values. They are often used to represent quantitative data, such as temperature or elevation.",
    diverging:
      "Diverging palettes are used to represent a range of values around a central point. They are often used to represent quantitative data, such as temperature or elevation.",
    categorical:
      "Categorical palettes are used to represent a set of discrete values. They are often used to represent qualitative data, such as different types of land cover or different political parties.",
  };
</script>

<div class="max-w-lg">
  <GetColorsFromString
    allowSort={true}
    onChange={(colors) => colorStore.setCurrentPalColors(colors)}
    colorSpace={currentPal.colorSpace}
    colors={currentPal.colors}
  />

  <div class="font-bold">Config</div>
  <div class="max-w-lg text-sm italic">
    This is a <select
      value={palType}
      class="font-bold"
      on:change={(e) => {
        // @ts-ignore
        colorStore.setCurrentPalType(e.target.value);
      }}
    >
      {#each ["sequential", "diverging", "categorical"] as type}
        <option value={type}>{type}</option>
      {/each}
    </select>
    palette. {descriptions[palType]}
  </div>
  <div class="mt-4 text-sm">
    What types of affects do you intend to have on the palette?
  </div>
  <div class="flex flex-wrap">
    <label class="mr-3">
      <input
        type="checkbox"
        checked={currentPal.intendedAffects.length === 0}
        on:change={(e) => {
          if (currentPal.intendedAffects.length === 0) {
            colorStore.setCurrentAffects(affects);
          } else {
            colorStore.setCurrentAffects([]);
          }
        }}
      />
      None Specific
    </label>
    {#each affects as affect}
      <div class="flex items-center mr-2">
        <label class="mr-3">
          <input
            type="checkbox"
            checked={currentPal.intendedAffects.includes(affect)}
            on:change={(e) => {
              const newAffect = currentPal.intendedAffects.includes(affect)
                ? currentPal.intendedAffects.filter((x) => x !== affect)
                : [...currentPal.intendedAffects, affect];
              colorStore.setCurrentAffects(newAffect);
            }}
          />
          {affect}
        </label>
      </div>
    {/each}
  </div>

  <div class="mt-4 text-sm">What types of contexts do you intend to use?</div>
  <div class="flex flex-wrap">
    <label class="mr-3">
      <input
        type="checkbox"
        checked={currentPal.intendedContexts.length === 0}
        value={currentPal.intendedContexts.length === 0}
        on:change={(e) => {
          if (currentPal.intendedContexts.length === 0) {
            colorStore.setCurrentContexts(contexts);
          } else {
            colorStore.setCurrentContexts([]);
          }
        }}
      />
      None Specific
    </label>
    {#each contexts as context}
      <div class="flex items-center mr-2">
        <label>
          <input
            type="checkbox"
            checked={currentPal.intendedContexts.includes(context)}
            value={currentPal.intendedContexts.includes(context)}
            on:change={(e) => {
              const newContext = currentPal.intendedContexts.includes(context)
                ? currentPal.intendedContexts.filter((x) => x !== context)
                : [...currentPal.intendedContexts, context];
              colorStore.setCurrentContexts(newContext);
            }}
          />
          {context}
        </label>
      </div>
    {/each}
  </div>
</div>

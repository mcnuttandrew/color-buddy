<script lang="ts">
  import Tooltip from "../../components/Tooltip.svelte";
  import colorStore from "../../stores/color-store";
  import exampleStore from "../../stores/example-store";
  import { suggestSVGImage } from "../../lib/api-calls";
  import { buttonStyle, AIButtonStyle } from "../../lib/styles";

  let requestState: "idle" | "loading" | "loaded" | "failed" = "idle";

  let suggestedImage: string = "";
  let prompt: string = "";
</script>

<Tooltip>
  <span slot="target" let:toggle>
    <button class={AIButtonStyle} on:click={toggle}>Suggest Example</button>
  </span>
  <div slot="content" let:onClick>
    <div class="flex flex-col w-72">
      <label for="img-prompt">
        <div>Create an example based on a prompt</div>
        <div class="text-sm italic">(e.g. "Make a cool logo")</div>
      </label>
      {#if requestState === "loaded"}
        <div>
          {@html suggestedImage}
        </div>
        <div class="flex justify-between">
          <button
            class={buttonStyle}
            on:click={() => {
              exampleStore.addExample({
                svg: suggestedImage,
                numColors: 100,
              });
              onClick();
              requestState = "idle";
              prompt = "";
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
      {:else}
        <input bind:value={prompt} id="img-prompt" />
        <button
          class={buttonStyle}
          class:pointer-events-none={requestState === "loading"}
          on:click={() => {
            if (requestState === "loading") return;
            requestState = "loading";
            suggestSVGImage(prompt, $colorStore.engine)
              .then((suggestions) => {
                if (suggestions.length === 0) {
                  requestState = "idle";
                  return;
                }
                suggestedImage = suggestions[0];
                requestState = "loaded";
              })
              .catch((e) => {
                console.log(e);
                requestState = "idle";
              });
          }}
        >
          {#if requestState === "idle" || requestState === "failed"}
            Submit
          {:else}
            loading...
          {/if}
        </button>
      {/if}
      {#if requestState === "failed"}
        <div class="text-red-500">No suggestions found, please try again</div>
      {/if}
    </div>
  </div>
</Tooltip>

<script lang="ts">
  export let showModal: boolean;
  export let size: string = "80%";

  export let closeModal: () => void;
  let dialog: HTMLDialogElement;
  $: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={closeModal}
  on:click|self={() => dialog.close()}
  style="width: {size};"
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation class="p-0">
    <slot />
  </div>
</dialog>

<style>
  dialog {
    height: 100%;
    border: none;
    padding: 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>

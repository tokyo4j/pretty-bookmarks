<script lang="ts">
  export let x: number;
  export let y: number;
  export let target: Bookmark;

  import { createEventDispatcher } from "svelte";
  import type { Bookmark } from "../types";
  const dispatch = createEventDispatcher();

  let title = target.node.title;
  let url = target.node.url;
</script>

<div
  class="fixed left-0 top-0 w-full h-full z-10 cursor-default"
  on:mousedown={() => {
    dispatch("closeContextMenu");
  }}
>
  <div
    class="absolute bg-gray-700 rounded p-1"
    style={`left: ${x}px; top: ${y}px;`}
    on:mousedown|stopPropagation={() => {}}
  >
    <input class="block text-black rounded my-1" bind:value={title} />
    {#if target.node.url}
      <input class="block text-black rounded my-1" bind:value={url} />
    {/if}

    <button
      class="bg-gray-500 rounded mx-1 px-1"
      on:click={() => {
        browser.bookmarks
          .update(target.node.id, { url, title })
          .then(() => window.location.reload());
      }}>OK</button
    >
    <button
      class="bg-gray-500 rounded mx-1 px-1"
      on:click={() => {
        // @ts-ignore
        browser.bookmarks
          .remove(target.node.id)
          .then(() => window.location.reload());
      }}>Remove</button
    >
  </div>
</div>

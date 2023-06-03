<script lang="ts">
  import folderIcon from "../assets/folder.svg";
  import type { Bookmark, BookmarkTreeNode } from "../types";
  import db from "../db";
  import ContextMenu from "./ContextMenu.svelte";
  import {
    readFileAsBlob,
    readFileAsText,
    requestFileUpload,
    getChildBookmarks,
  } from "../misc";

  const exportImages = async () => {
    const images = await db.images.toArray();
    const formData = new FormData();
    for (const { url, data } of images) formData.append(url, data);
    await fetch(`http://localhost:8000/upload`, {
      method: "POST",
      body: formData,
    });
    alert("Sent images to server");
  };

  const importImages = async () => {
    const event = await requestFileUpload();
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    const files = [...target.files];
    const index_file = files.find((file) => file.name === "index.json");
    if (!index_file) return;
    const index: Record<string, string> = JSON.parse(
      await readFileAsText(index_file)
    );

    for (const [url, filename] of Object.entries(index)) {
      const file = files.find((file) => file.name === filename);
      if (!file) continue;
      const blob = await readFileAsBlob(file);
      db.images.put({ url: url, data: blob });
    }
  };

  const cleanImgs = async () => {
    const getAllChildren = (parent: BookmarkTreeNode): BookmarkTreeNode[] =>
      parent.children
        ? parent.children!.map((bm) => getAllChildren(bm)).flat()
        : [parent];

    const urls = getAllChildren((await browser.bookmarks.getTree())[0])
      .map((bm) => bm.url)
      .filter((url) => url);
    const diff = (await db.images.toArray())
      .filter((record) => !urls.includes(record.url))
      .map((record) => record.url);
    db.images.bulkDelete(diff);
    console.log("Deleted images for:", diff);
  };

  let clickState: { target: Bookmark; x: number; y: number } | undefined;
</script>

<button
  class="rounded bg-gray-500 p-2 m-2"
  on:click={() => {
    exportImages();
  }}>Export</button
>
<button
  class="rounded bg-gray-500 p-2 m-2"
  on:click={() => {
    importImages();
  }}>Import</button
>
<button
  class="rounded bg-gray-500 p-2 m-2"
  on:click={() => {
    cleanImgs();
  }}>Clean</button
>

{#await getChildBookmarks(new URL(location.href).searchParams.get("id")) then bookmarks}
  <div
    class="grid gap-2 auto-rows-[12rem] m-2"
    style="grid-template-columns: repeat(auto-fit, 12rem)"
  >
    {#each bookmarks as bm}
      <a
        class="bg-gray-500 rounded relative cursor-pointer font-semibold overflow-hidden"
        href={bm.node.url || `newtab.html?id=${bm.node.id}`}
        on:contextmenu={(e) => {
          clickState = { target: bm, x: e.clientX, y: e.clientY };
          e.preventDefault();
        }}
      >
        <img
          class="object-contain w-full h-full"
          src={bm.node.children
            ? folderIcon
            : bm.img
            ? bm.img
            : bm.node.url
            ? `https://www.google.com/s2/favicons?sz=32&domain=${
                new URL(bm.node.url).origin
              }`
            : ""}
          alt=""
        />
        <div
          class="absolute bottom-0 h-12 w-full bg-gradient-to-b from-transparent to-black overflow-hidden"
        >
          {bm.node.title}
        </div>
      </a>
    {/each}
  </div>
  {#if clickState}
    <ContextMenu
      {...clickState}
      on:closeContextMenu={() => {
        clickState = undefined;
      }}
    />
  {/if}
{/await}

<style>
</style>

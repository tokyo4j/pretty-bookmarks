import { imgToBlob, getImgAt, downloadVideoAt } from "../misc";

console.log("Pretty Bookmark's content script is loaded");

let clickPos: { x: number; y: number } | undefined;

document.addEventListener("mousedown", (e) => {
  if (e.button !== 2) return;
  if (!(e.target instanceof HTMLElement)) return;

  clickPos = {
    x: e.clientX,
    y: e.clientY,
  };

  console.log("clicked position", clickPos);
});

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!clickPos) return false;

  if (msg === "request-clicked-img-element") {
    getImgAt(clickPos.x, clickPos.y)
      .then((img) => img && imgToBlob(img))
      .then((blob) => sendResponse(blob));
    return true;
  } else if (msg === "download-clicked-video") {
    downloadVideoAt(clickPos.x, clickPos.y);
    return true;
  }

  return false;
});

export {};

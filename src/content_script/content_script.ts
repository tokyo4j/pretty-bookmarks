import { imgToBlob, getImgAt } from "../misc";

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
  if (msg !== "request-clicked-img-element")
    throw new Error("invalid message" + msg);
  if (!clickPos) return false;

  getImgAt(clickPos.x, clickPos.y)
    .then((img) => img && imgToBlob(img))
    .then((blob) => sendResponse(blob));

  return true;
});

export {};

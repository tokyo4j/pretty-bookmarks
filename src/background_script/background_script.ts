import db from "../db";
import { sleep } from "../misc";

browser.contextMenus.create({
  id: "use-image-for-bookmark",
  title: "Use image for bookmark",
  contexts: ["all"],
});

browser.contextMenus.create({
  id: "download-video",
  title: "Download video",
  contexts: ["all"],
});

async function requestClickedImgElement() {
  const tab = (
    await browser.tabs.query({ active: true, currentWindow: true })
  )[0];

  return (await browser.tabs.sendMessage(
    tab.id!,
    "request-clicked-img-element"
  )) as Blob | undefined;
}

async function downloadClickedVideo() {
  const tab = (
    await browser.tabs.query({ active: true, currentWindow: true })
  )[0];

  return (await browser.tabs.sendMessage(tab.id!, "download-clicked-video")) as
    | Blob
    | undefined;
}

async function captureScreen() {
  const url = await browser.tabs.captureVisibleTab();
  const blob = await fetch(url).then((res) => res.blob());
  return blob;
}

browser.contextMenus.onClicked.addListener(async ({ menuItemId, pageUrl }) => {
  if (!pageUrl) return;

  if (menuItemId === "use-image-for-bookmark") {
    // this must be before any "await" because the state that "this action is triggered by the user"
    // is lost after await
    browser.action.openPopup();

    if ((await browser.bookmarks.search({ url: pageUrl })).length === 0) {
      console.log(pageUrl, "is not bookmarked");
      browser.runtime.sendMessage({ label: "not-bookmarked" });

      return;
    }

    const blob = (await requestClickedImgElement()) || (await captureScreen());
    console.log("blob", blob);
    await db.images.put({ url: pageUrl, data: blob });

    await sleep(100);
    browser.runtime.sendMessage({ label: "show-saved-img", img: blob });
  } else if (menuItemId === "download-video") {
    await downloadClickedVideo();
  }
});

export {};

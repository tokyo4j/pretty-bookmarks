import db from "../db";

browser.contextMenus.create({
  id: "use-image-for-bookmark",
  title: "Use image for bookmark",
  contexts: ["all"],
});

const requestImgElement = async () => {
  const tab = (
    await browser.tabs.query({ active: true, currentWindow: true })
  )[0];

  return (await browser.tabs.sendMessage(
    tab.id!,
    "request-clicked-img-element"
  )) as Blob | undefined;
};

const captureScreen = async () => {
  const url = await browser.tabs.captureVisibleTab();
  const blob = await fetch(url).then((res) => res.blob());
  return blob;
};

browser.contextMenus.onClicked.addListener(async ({ menuItemId, pageUrl }) => {
  if (menuItemId !== "use-image-for-bookmark") return;
  if (!pageUrl) return;

  // this must be before any "await" because info that "this action is triggered by the user"
  // is lost after await
  browser.action.openPopup();

  if ((await browser.bookmarks.search({ url: pageUrl })).length === 0) {
    console.log(pageUrl, "is not bookmarked");
    browser.runtime.sendMessage({ label: "not-bookmarked" });

    return;
  }

  const blob = (await requestImgElement()) || (await captureScreen());
  console.log("blob", blob);
  await db.images.put({ url: pageUrl, data: blob });

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(() => resolve(), ms);
    });
  await sleep(100);
  browser.runtime.sendMessage({ label: "show-saved-img", img: blob });
});

export {};

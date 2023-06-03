import type { Bookmark, BookmarkTreeNode } from "./types";
import db from "./db";

export const requestFileUpload = () =>
  new Promise<Event>((resolve, reject) => {
    const el = document.createElement("input");
    el.type = "file";
    el.multiple = true;
    el.onchange = (e: Event) => resolve(e);
    el.click();
  });

export const readFileAsText = async (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(file);
  });

export const readFileAsBlob = async (file: File) =>
  new Promise<Blob>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(
        new Blob([new Uint8Array(reader.result as ArrayBuffer)], {
          type: file.type,
        })
      );
    reader.readAsArrayBuffer(file);
  });

// get child bookmarks from parent bookmark id, and merge them with images retrieved from DB
export const getChildBookmarks = async (
  bookmarkId: string | null | undefined
): Promise<Bookmark[]> => {
  const parent = bookmarkId
    ? (await browser.bookmarks.getSubTree(bookmarkId))[0]
    : (await browser.bookmarks.getTree())[0];
  if (!parent.children) return [];

  const imgs = await Promise.all(
    parent.children.map(
      (child) =>
        child.url &&
        db.images
          .get(child.url)
          .then((img) => img && URL.createObjectURL(img.data))
    )
  );
  const bookmarks = parent.children.map(
    (child, i) => ({ node: child, img: child.url && imgs[i] } as Bookmark)
  );
  return bookmarks;
};

export const imgToBlob = (img: HTMLImageElement) =>
  new Promise((resolve, reject) => {
    const MAX_SIZE = 320;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    let rate = MAX_SIZE / Math.max(img.naturalWidth, img.naturalHeight);
    if (rate > 1) rate = 1;
    const width = rate * img.naturalWidth;
    const height = rate * img.naturalHeight;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to convert image to Blob"));
    });
  }) as Promise<Blob>;

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });

const getImgFromElement = async (
  el: Element
): Promise<HTMLImageElement | null> => {
  if (el instanceof HTMLImageElement) {
    return el;
  } else {
    const style = getComputedStyle(el);
    const url =
      style.backgroundImage.match(/(?<=url\(").*(?="\))/)?.[0] ||
      style.background.match(/(?<=url\(").*(?="\))/)?.[0] ||
      ((el as HTMLVideoElement).poster as string | undefined | null);

    if (url) return await loadImage(url);
    else return null;
  }
};

export const getImgAt = async (x: number, y: number) => {
  const els = document.elementsFromPoint(x, y);
  console.log(`all the elements at (${x},${y})`, els);

  const imgs = (await Promise.all(els.map((el) => getImgFromElement(el))))
    .filter((img) => img !== null)
    .filter((img) => img!.naturalWidth > 30) as HTMLImageElement[];

  console.log("retrieved imgs", imgs);

  if (imgs.length === 0) return null;
  else return imgs[0];
};

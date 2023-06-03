const main = document.getElementById("main") as HTMLDivElement;
const img = document.getElementById("img") as HTMLImageElement;

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.label === "show-saved-img") {
    main.textContent = "Image saved!";
    img.src = URL.createObjectURL(msg.img);
    sendResponse(true);
    return true;
  } else if (msg.label === "not-bookmarked") {
    main.textContent = "Not bookmarked";
    sendResponse(true);
    return true;
  }
});

main.textContent = "popup loaded!";

export {};

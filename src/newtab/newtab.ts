import App from "./App.svelte";
import "../tailwind.css";

const app = new App({
  target: document.getElementById("app") as HTMLElement,
});

export default app;

import "./app.css";
import App from "./App.svelte";

let app;
try {
  const targetElement = document.getElementById("app");
  console.clear();
  app = new App({
    target: targetElement ? targetElement : document.body,
  });
} catch (error) {
  console.error(error);
}

export default app;

// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://werkstadtforum.de",
  compressHTML: true,
  build: {
    // kleines CSS direkt ins HTML – kein render-blockierender Request
    inlineStylesheets: "always",
  },
  devToolbar: { enabled: false },
});

import { defineConfig } from "vite";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";
import manifest from "./manifest.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest: manifest as ManifestV3Export })],
  resolve: {
    alias: {
      "@logo": path.resolve(process.cwd(), "@logo"),
    },
  },
  build: {
    assetsDir: "assets",
    copyPublicDir: true,
    outDir: "dist",
  },
});

import { defineConfig } from "vite";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";
import manifest from "./manifest.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest: manifest as ManifestV3Export })],
  assetsInclude: ["**/*.woff2"],
  resolve: {
    alias: {
      "@logo": path.resolve(process.cwd(), "@logo"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@": "/src",
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    open: "/popup.html",
  },
});

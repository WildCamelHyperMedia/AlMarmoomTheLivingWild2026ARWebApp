import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Static build used ONLY for the no-backend GitHub Pages demo.
// It deliberately omits the Replit dev plugins and the meta-images plugin
// (which depend on the Replit deployment domain) so the build is fully
// self-contained. Your normal vite.config.ts is left untouched.
//
// base:
//   - Custom domain / org page (served at "/")      -> leave VITE_BASE unset.
//   - Pages project page (served at "/<repo>/")      -> set VITE_BASE=/<repo>/
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});

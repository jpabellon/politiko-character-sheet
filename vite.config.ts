import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

// BASE_PATH is "/<repo>/" on GitHub Pages project sites and "/" on a custom domain or locally.
export default defineConfig({
  base: process.env["BASE_PATH"] ?? "/",
  plugins: [
    tsConfigPaths(),
    tanstackStart({ spa: { enabled: true, prerender: { outputPath: "/index.html" } } }),
    react(),
    tailwindcss(),
  ],
});

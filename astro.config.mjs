// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://usemusa.app",
  output: "static",
  // React só para as ilhas que usam Base UI (controles do mapa, ADR 0006)
  integrations: [react()],
  build: { format: "file" },
  server: { port: 4321, host: "127.0.0.1" },
  vite: {
    plugins: [tailwindcss()],
    // os painéis de revisão (só em dev) importam dialkit e agentation direto de node_modules
    server: { fs: { allow: ["."] } }
  }
});

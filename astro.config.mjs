// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://usemusa.app",
  output: "static",
  build: { format: "file" },
  server: { port: 4321, host: "127.0.0.1" },
  vite: {
    plugins: [tailwindcss()],
    // os painéis de revisão (só em dev) importam dialkit e agentation direto de node_modules
    server: { fs: { allow: ["."] } }
  }
});

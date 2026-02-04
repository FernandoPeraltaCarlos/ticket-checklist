import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/ticket-checklist/",
  plugins: [tailwindcss()],
  server: {
    port: 5173
  }
});

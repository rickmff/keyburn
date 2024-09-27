import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import tailwind from "tailwindcss"
import autoprefixer from "autoprefixer"
import path from "path"

export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    assetsDir: "assets"
  },
  publicDir: "public"
})

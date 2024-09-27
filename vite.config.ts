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
    assetsDir: "assets",
    rollupOptions: {
      output: {
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? "")) {
            return "assets/images/[name]-[hash][extname]"
          }
          if (/\.css$/.test(name ?? "")) {
            return "assets/css/[name]-[hash][extname]"
          }
          return "assets/[name]-[hash][extname]"
        }
      }
    },
    sourcemap: false,
    minify: "esbuild"
  },
  server: {
    port: 3000
  }
})

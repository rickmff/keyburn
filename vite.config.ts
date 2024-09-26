import { type ConfigEnv, type UserConfigExport, loadEnv } from "vite"
import { resolve } from "path"
import vue from "@vitejs/plugin-vue"
import tailwind from "tailwindcss"
import autoprefixer from "autoprefixer"
import path from "path"
export default ({ mode }: ConfigEnv): UserConfigExport => {
  const viteEnv = loadEnv(mode, process.cwd()) as ImportMetaEnv
  const { VITE_PUBLIC_PATH } = viteEnv
  return {
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()]
      }
    },
    base: VITE_PUBLIC_PATH,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },
    server: {
      host: true,
      port: 3333,
      open: false,
      cors: true,
      strictPort: false,
      proxy: {
        "/api/v1": {
          target: "https://mock.mengxuegu.com/mock/63218b5fb4c53348ed2bc212",
          ws: true,
          changeOrigin: true
        }
      },
      warmup: {
        clientFiles: ["./src/layouts/**/*.vue"]
      }
    },
    build: {
      chunkSizeWarningLimit: 2048,
      reportCompressedSize: false,
      assetsDir: "static",
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ["vue", "vue-router", "pinia"]
          }
        }
      }
    },
    esbuild:
      mode === "development"
        ? undefined
        : {
            pure: ["console.log"],
            drop: ["debugger"],
            legalComments: "none"
          },
    plugins: [vue()]
  }
}

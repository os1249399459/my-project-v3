import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiTarget = env['VITE_DEV_PROXY_TARGET'] ?? 'http://127.0.0.1:8080'

  return {
    plugins: [
      vue(),
      vueDevTools(),
      // Element Plus on demand: without this the whole library (868 kB) lands
      // in the entry chunk instead of the ~40 kB of components actually used.
      AutoImport({ resolvers: [ElementPlusResolver()], dts: 'src/types/auto-imports.d.ts' }),
      Components({ resolvers: [ElementPlusResolver()], dts: 'src/types/components.d.ts' }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Same-origin in the browser, real backend during dev.
        '/api': { target: apiTarget, changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') },
      },
    },
    build: {
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          // Split the three vendors that change at different rates so a
          // dependency bump does not invalidate the app chunk's cache.
          // Vite 8 uses rolldown, which only accepts the function form.
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined
            if (/node_modules\/(vue|vue-router|pinia)\//.test(id)) return 'vue'
            if (id.includes('node_modules/element-plus')) return 'element'
            if (/node_modules\/(axios|dayjs|zod)\//.test(id)) return 'vendor'
            return undefined
          },
        },
      },
    },
  }
})

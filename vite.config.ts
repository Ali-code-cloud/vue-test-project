import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'
export default defineConfig({
  plugins: [vue(), basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@layouts': path.resolve(import.meta.dirname, './src/layouts'),
      '@views': path.resolve(import.meta.dirname, './src/views'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
    }
  },
  server: {
    https: {},
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['localhost', 'mrhomeservices.com', 'mrhomeservices.local', 'mrhomeservices.test'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
    },
  },
})
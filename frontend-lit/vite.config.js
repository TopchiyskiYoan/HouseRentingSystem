import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => {
  const root = fileURLToPath(new URL('.', import.meta.url))
  const env = loadEnv(mode, root, '')
  const target = env.VITE_API_TARGET || 'http://localhost:5000'

  return {
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target, changeOrigin: true, secure: false },
        '/login': { target, changeOrigin: true, secure: false },
        '/register': { target, changeOrigin: true, secure: false },
      },
    },
  }
})


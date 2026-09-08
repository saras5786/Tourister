import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteApiPlugin } from './server/viteApiPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), viteApiPlugin()],
  server: {
    host: true, // Listen on all network addresses (0.0.0.0) so phone can access via local IP
    port: 5173,
  },
})


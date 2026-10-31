import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site from /Solar/
export default defineConfig({
  base: '/Solar/',
  plugins: [react()],
  build: {
    target: 'es2020',
    // three.js lives in its own lazily loaded chunk (dynamic import) — not part of the first load.
    chunkSizeWarningLimit: 900,
  },
})

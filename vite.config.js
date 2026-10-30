import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site from /Solar/
export default defineConfig({
  base: '/Solar/',
  plugins: [react()],
})

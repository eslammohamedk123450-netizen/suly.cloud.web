import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        services: 'services.html',
        projects: 'projects.html',
        offers: 'offers.html',
        contact: 'contact.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      // Images don't need HMR, and watching them can crash the dev server
      // when a file is locked by another app (EBUSY)
      ignored: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.gif', '**/*.svg']
    }
  }
})
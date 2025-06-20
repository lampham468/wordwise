/**
 * vite.config.ts – Vite configuration for the writing assistant app
 * Configures React, path aliases, and development server
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    open: true,
    port: 3000,
    fs: {
      strict: true,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'tiptap': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/core'],
          'spell-check': ['nspell', 'dictionary-en-us', 'write-good'],
        },
      },
    },
  },
  define: {
    // Ensure environment variables are properly injected
    'process.env': {},
  },
})

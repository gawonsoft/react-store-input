import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^react-store-input\/text-editor$/,
        replacement: fileURLToPath(new URL('../src/text_editor.tsx', import.meta.url)),
      },
      {
        find: /^react-store-input$/,
        replacement: fileURLToPath(new URL('../src/index.tsx', import.meta.url)),
      },
    ],
    // The package is linked from ../ during development. Force every linked
    // dependency to use the example application's React singleton.
    dedupe: ['react', 'react-dom'],
  },
})

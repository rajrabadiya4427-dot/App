import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
     build: {
    // Set the limit to 1000 KiB
    chunkSizeWarningLimit: 1000,
  },
})

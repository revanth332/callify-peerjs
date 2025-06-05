import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // More robust way
      // OR if you prefer string replacement, ensure it matches tsconfig
      // '@': '/src', // This might need adjustments based on project root
    },
  },
})


import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Use current directory literal '.' instead of process.cwd() to avoid potential type resolution issues with the Process interface.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    base: '', // Allows deployment to any sub-path (like GitHub Pages)
  }
})

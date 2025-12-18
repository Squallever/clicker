import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: '', // Allows deployment to any sub-path (like GitHub Pages)
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
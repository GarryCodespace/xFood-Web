import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Temporarily disable React refresh to fix white page
      fastRefresh: false,
      // Force JSX runtime
      jsxRuntime: 'automatic',
    })
  ],
  server: {
    allowedHosts: true,
    // Add some debugging
    hmr: {
      overlay: true
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  // Add some debugging
  logLevel: 'info',
}) 
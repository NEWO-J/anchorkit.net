import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    // Strip console.* calls from production output (L-1).
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Three.js ecosystem — deferred until a 3D scene mounts
          if (
            id.includes('/three/') ||
            id.includes('@react-three/') ||
            id.includes('/postprocessing/')
          ) return 'three-vendor';
          // React core — stable across deploys, maximises cache hits
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router/') || id.includes('/scheduler/'))
            return 'react-vendor';
          // UI libraries — Radix primitives + icons
          if (id.includes('@radix-ui/') || id.includes('lucide-react/') || id.includes('@floating-ui/'))
            return 'ui-vendor';
        },
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})

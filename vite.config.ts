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
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js and R3F into a deferred chunk so the main bundle
          // doesn't pay the ~400KB cost until the 3D scene is actually needed.
          'three-vendor': [
            'three',
            '@react-three/fiber',
            '@react-three/postprocessing',
            'postprocessing',
          ],
        },
      },
    },
  },
})

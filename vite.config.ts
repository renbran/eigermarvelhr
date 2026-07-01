import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'src/pages/index.html'),
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          'vendor':  ['react', 'react-dom'],
          'gsap':    ['gsap', '@gsap/react'],
          'three':   ['three', '@react-three/fiber', '@react-three/drei'],
          'motion':  ['framer-motion', 'motion'],
          'ui':      ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tooltip', '@radix-ui/react-dropdown-menu'],
          'icons':   ['@phosphor-icons/react', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
    minify: 'terser',
  },
});

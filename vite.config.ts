import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
    visualizer({ filename: 'dist/stats.html', open: false, gzipSize: true }),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    outDir: 'dist',
    modulePreload: false,
    rollupOptions: {
      input: resolve(projectRoot, 'src/pages/index.html'),
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'gsap-vendor': ['gsap'],
          'motion-vendor': ['framer-motion'],
          'three-vendor': ['three', '@react-three/fiber'],
          'icons-vendor': ['lucide-react', '@phosphor-icons/react'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
    minify: 'terser',
  },
});

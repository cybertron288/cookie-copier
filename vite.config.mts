import { defineConfig } from 'vite';
import path from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  root: 'src',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup-modern.html'),
        background: path.resolve(__dirname, 'src/background.ts'),
        content: path.resolve(__dirname, 'src/content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const { name } = assetInfo;
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'assets/images/[name][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
    target: 'chrome88',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  plugins: [
    {
      name: 'copy-manifest',
      closeBundle() {
        // Copy manifest.json to dist
        try {
          mkdirSync(path.resolve(__dirname, 'dist'), { recursive: true });
          copyFileSync(
            path.resolve(__dirname, 'src/manifest.json'),
            path.resolve(__dirname, 'dist/manifest.json')
          );
          console.log('✓ Manifest copied');
        } catch (err) {
          console.error('Failed to copy manifest:', err);
        }
      },
    },
    {
      name: 'chrome-extension-reload',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('.ts') || file.endsWith('.html') || file.endsWith('.css')) {
          console.log('Reloading extension...');
          server.ws.send({
            type: 'full-reload',
            path: '*',
          });
        }
      },
    },
  ],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    watch: {
      usePolling: true,
    },
  },
});
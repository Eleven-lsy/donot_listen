import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './',
  publicDir: 'public',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'home.html'),
        login: resolve(__dirname, 'login.html'),
        favorites: resolve(__dirname, 'favorites.html'),
        'learning-records': resolve(__dirname, 'learning-records.html'),
        settings: resolve(__dirname, 'settings.html')
      },
      output: {
        manualChunks: {
          'ui-components': ['./ui-components.js'],
          'state-manager': ['./state-manager.js'],
          'api-service': ['./api-service.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },

  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
       // target: 'http://localhost:8082',
        target: 'http://47.103.221.35',  
        changeOrigin: true,
        secure: false
      }
    }
  },

  preview: {
    port: 4173,
    open: true
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@core': resolve(__dirname, 'core'),
      '@controllers': resolve(__dirname, 'controllers'),
      '@services': resolve(__dirname, 'services')
    }
  }
});

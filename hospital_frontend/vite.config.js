import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // Configuration pour éviter les erreurs de MIME type
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-bootstrap', 
      'react-datepicker',
      'react-router-dom'
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx'
      },
    }
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  server: {
    // Configuration pour servir correctement les fichiers JSX
    fs: {
      // Autoriser le service de fichiers hors du répertoire racine
      allow: ['..']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      // Proxy pour le serveur Orthanc - permet d'accéder directement aux prévisualisations
      '/orthanc': {
        target: 'http://localhost:8042',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/orthanc/, '')
      }
    },
    cors: true
  }
})

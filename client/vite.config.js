import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import https from 'https';
import tls from 'tls';
import net from 'net';

/**
 * The local ISP DNS does not resolve api.themoviedb.org.
 * TCP to 99.84.152.8:443 is confirmed reachable.
 *
 * Use a custom https.Agent that overrides createConnection to connect
 * directly to the IP, bypassing DNS entirely while keeping TLS SNI correct.
 */
const TMDB_IP = '99.84.152.8';
const TMDB_HOST = 'api.themoviedb.org';

class TmdbAgent extends https.Agent {
  createConnection(options, callback) {
    if (options.host === TMDB_HOST || options.hostname === TMDB_HOST) {
      const tlsOptions = {
        ...options,
        host: TMDB_IP,
        servername: TMDB_HOST, // TLS SNI — required for CloudFront to serve the right cert
      };
      return tls.connect(tlsOptions, callback);
    }
    return super.createConnection(options, callback);
  }
}

const tmdbAgent = new TmdbAgent({ keepAlive: true });

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['use-sync-external-store/with-selector', 'react-redux'],
  },
  build: {
    outDir: '../server/public',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/tmdb': {
        target: 'https://api.themoviedb.org',
        changeOrigin: true,
        secure: true,
        agent: tmdbAgent,
        rewrite: (path) => path.replace(/^\/tmdb/, '/3'),
      },
    },
  },
});

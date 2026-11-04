import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The shop calls /api/*; Vite forwards it to the Cartwheel API (default http://localhost:3000).
const api = process.env.CARTWHEEL_API_URL || 'http://localhost:3000';
const proxy = {
  '/api': { target: api, changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') },
};

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 5173, proxy },
});

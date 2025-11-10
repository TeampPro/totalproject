// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 기본값
    proxy: {
      // ✅ Spring Boot REST API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // ✅ Spring Boot WebSocket
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});

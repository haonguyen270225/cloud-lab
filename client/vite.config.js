import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
plugins: [react()],

server: {
host: '0.0.0.0',
port: 4173,
strictPort: true,

allowedHosts: ['mern-frontend-236115.onrender.com'],

proxy: {
  '/api': {
    target: 'https://mern-backend-236115-2026.onrender.com',
    changeOrigin: true,
    secure: true,
  },
},

},
});

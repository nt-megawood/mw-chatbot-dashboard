import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/mw-chatbot-dashboard/',
  plugins: [react()],
  server: {
    port: 5173,
  },
});

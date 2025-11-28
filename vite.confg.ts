import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Safely expose specific environment variables to the client
    'process.env': {
      API_KEY: process.env.API_KEY || ''
    }
  },
});
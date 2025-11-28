import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Injecte la variable d'environnement lors du build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Évite le crash "process is not defined" dans le navigateur
    'process.env': {}
  },
  build: {
    outDir: 'dist',
  }
});
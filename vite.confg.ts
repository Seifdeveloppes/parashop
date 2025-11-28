import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Cette ligne permet d'injecter la clé API lors du build Vercel
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Cette ligne évite les crashs "process is not defined" dans le navigateur
    'process.env': {}
  },
  build: {
    // Assure que le dossier de sortie est standard
    outDir: 'dist',
  }
});
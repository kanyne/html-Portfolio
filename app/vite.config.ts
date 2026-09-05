import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  // Relative asset URLs so the portable build works from any folder, including file://
  base: mode === 'portable' ? './' : '/',
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
  build: mode === 'portable' ? { outDir: 'dist-portable' } : {},
}));

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Built output is committed to src/static so the Databricks App deploy needs
// no Node toolchain — FastAPI serves it directly.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../src/static',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});

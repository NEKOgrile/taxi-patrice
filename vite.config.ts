import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // base is required for GitHub Pages hosting at https://nekogrile.github.io/taxi-nekogrile/
  base: '/taxi-nekogrile/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

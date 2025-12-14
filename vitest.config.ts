import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [react(), vue({ include: [/\.vue$/, /\.ce\.vue$/], customElement: true })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});

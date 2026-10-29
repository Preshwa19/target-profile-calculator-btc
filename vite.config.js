import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the built site works from any URL path (root domain, sub-folder, GitHub Pages).
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.js'],
  },
});

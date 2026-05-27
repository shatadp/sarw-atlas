import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base is set at build time for GitHub Pages (project site). Override with
// VITE_BASE=/sarw-atlas/ in the deploy workflow; default '/' keeps dev simple.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/',
});

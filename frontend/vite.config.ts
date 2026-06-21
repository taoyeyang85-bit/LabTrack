import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set VITE_BASE_PATH=/your-repo-name/ for GitHub Pages project sites.
// Leave as '/' for local dev or user/organization pages.
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    allowedHosts: ['host.docker.internal'],
  },
});

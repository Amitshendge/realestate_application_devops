import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/auth/', // Set the base path for production builds
  plugins: [react()], // Use the React plugin
  server: {
    host: 'www.onestrealestate.co', // Listen on all network interfaces
    port: 5173, // Set the development server port
    strictPort: true, // Exit if the port is already in use
  },
  build: {
    outDir: 'dist', // Output directory for the production build
    emptyOutDir: true, // Clear the output directory before building
    sourcemap: true, // Generate source maps for debugging
  },
});
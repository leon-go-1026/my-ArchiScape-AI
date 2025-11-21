import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY and API_BASE_URL
      // We prefer the loaded env (which includes .env files) but fallback to process.env (system env)
      // This ensures Vercel environment variables are picked up correctly.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ''),
      'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL || process.env.API_BASE_URL || ''),
    },
  };
});
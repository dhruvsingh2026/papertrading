import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    proxy: {
      // Avoid browser CORS / missing ACAO when CoinGecko rate-limits keyless calls.
      // Docs: https://docs.coingecko.com/docs/errors-and-rate-limits
      '/api/coingecko': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, '/api/v3'),
      },
    },
  },
})

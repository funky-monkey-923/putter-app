import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Putter',
        short_name: 'Putter',
        description: 'A calm, all-in-one home for your daily life.',
        // Placeholder colors — real Quiet Morning theme tokens land in M0 slice 3.
        theme_color: '#f5f1ea',
        background_color: '#f5f1ea',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Putter',
        short_name: 'Putter',
        description: 'A calm, all-in-one home for your daily life.',
        theme_color: '#F3EFE8',
        background_color: '#F3EFE8',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
      workbox: {
        // woff2 added when the real self-hosted fonts landed — without it,
        // the fonts wouldn't be part of the offline precache, which would
        // quietly undercut the "works fully offline" PWA promise on a
        // repeat visit with no network.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
})

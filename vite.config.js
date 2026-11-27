import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// En desarrollo usamos "/"; al compilar para GitHub Pages usamos "/plataforma-boletos/"
// (también se puede sobreescribir con VITE_BASE).
const repoBase = '/plataforma-boletos/'

export default defineConfig(({ command }) => {
  const base = process.env.VITE_BASE ?? (command === 'build' ? repoBase : '/')

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        // 'prompt' permite mostrar el aviso "Hay una nueva versión disponible" antes de recargar
        registerType: 'prompt',
        manifest: {
          name: 'Easy Ticket — Venta de boletos para eventos',
          short_name: 'Easy Ticket',
          description: 'Explora óperas y conciertos, elige tus asientos y consulta tus boletos con código QR también sin conexión.',
          lang: 'es',
          start_url: base,
          scope: base,
          display: 'standalone',
          background_color: '#0B2D5B',
          theme_color: '#0B2D5B',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Precache del app shell (HTML, JS, CSS e iconos); las imágenes y la API usan runtimeCaching
          globPatterns: ['**/*.{js,css,html,svg,ico}', 'icons/*.png', 'images/logo.png'],
          globIgnores: ['**/404.html'],
          navigateFallback: `${base}index.html`,
          navigateFallbackDenylist: [/\/api\/.+\.json$/],
          runtimeCaching: [
            // API falsa (JSON): NetworkFirst → intenta red primero y cae al caché cuando no hay conexión
            {
              urlPattern: ({ url }) => url.pathname.includes('/api/') && url.pathname.endsWith('.json'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'easyticket-api',
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
              },
            },
            // Imágenes de eventos: CacheFirst → rápidas y disponibles sin conexión tras la primera visita
            {
              urlPattern: ({ request, url }) => request.destination === 'image' || url.pathname.includes('/images/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'easyticket-images',
                expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
            // Tipografía Google Fonts (si el navegador la descargó una vez, queda en caché)
            {
              urlPattern: ({ url }) => url.origin.includes('fonts.g'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'easyticket-fonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
              },
            },
          ],
        },
      }),
    ],
  }
})

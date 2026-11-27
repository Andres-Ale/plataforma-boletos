# Arquitectura y decisiones técnicas (Tercera Entrega)

## 1. Capas de la aplicación

```text
main.jsx
  └─► App.jsx
        ├─ AuthProvider     (Context + useReducer → localStorage: et_session)
        ├─ CartProvider     (Context + useReducer → localStorage: et_cart)
        └─ CatalogProvider  (Context + useReducer → src/api/* + AbortController)
              └─ RouterProvider (createBrowserRouter con basename)
                    └─ RootLayout (Header · PwaPrompts · CartPanel · <Outlet /> · Footer)
                          ├─ Rutas públicas (/, /eventos, /ayuda, /login, /registro, /verificar/:code)
                          ├─ CatalogGate (/eventos/:id, /eventos/:id/asientos, /carrito, /checkout)
                          │     ├─ RequireAuth (/confirmacion/:orderId, /boletos, /perfil)
                          │     └─ RequireAuth [admin, organizador] → LazyAdminLayout
                          │           ├─ /admin · /admin/eventos · /admin/inventario
                          │           └─ RequireAuth [admin] → /admin/reportes
                          └─ * → NotFoundPage (404)
```

Principios aplicados:

1. **Separación estricta entre UI y datos:** ningún componente ni página lee archivos JSON ni toca `localStorage` directamente; todo pasa por `src/api/` y los tres Providers.
2. **Cero estado duplicado:** totales del carrito, disponibilidad de asientos, estado del evento (`available`, `soldout`, `past`) y métricas de reportes se **derivan** en render o con `useMemo` a partir de `events` y `orders`.
3. **Sesión unificada:** una sola clave `et_session` gestionada por `AuthProvider` (se eliminó la doble sesión de la entrega anterior).
4. **Carga diferida:** las cuatro pantallas de `/admin/*` se cargan con `React.lazy` + `Suspense`, reduciendo el bundle inicial de los visitantes públicos.

---

## 2. Estado global con `Context` y `useReducer`

| Provider | Estado | Acciones del `reducer` | Persistencia |
|---|---|---|---|
| `AuthProvider` | `{ user }` | `login`, `logout`, `profileUpdated` | `localStorage` (`et_session`) |
| `CartProvider` | `{ eventId, seats[] }` | `toggleSeat`, `removeSeat`, `clear` | `localStorage` (`et_cart`) |
| `CatalogProvider` | `{ status, events, orders, error }` | `loading`, `loaded`, `failed`, `eventSaved`, `eventDeleted`, `orderAdded` | Semilla en `public/api/*.json` + mutaciones en `et_events` y `et_orders` |

El hook `useLogout` coordina `AuthProvider.logout()` y `CartProvider.clear()` para vaciar el carrito al cerrar sesión sin acoplar un contexto dentro del otro.

---

## 3. Capa de API falsa y cancelación (`src/api/`)

- `client.js` centraliza `delay(ms, signal)`, `fetchJson(path, { signal })` y la clase `ApiError`.
- Tanto `CatalogProvider` como el hook `useAsync` y `PaymentPage` crean un `AbortController` en `useEffect` (o al enviar el pago) y llaman `controller.abort()` en la función de limpieza.
- Si una promesa rechaza con `AbortError`, `isAbortError(err)` la ignora silenciosamente para evitar errores en consola o actualizaciones sobre componentes desmontados.
- Regla de integridad en `deleteEvent`: no se permite borrar un evento que ya tenga órdenes asociadas, evitando boletos huérfanos en `/boletos` y `/admin/reportes`.

---

## 4. Boletos y verificación de QR

- Al confirmar una compra, `orders.js` guarda en cada orden el arreglo `items: [{ seat, zone, price }]` con el precio vigente al momento de la compra. Así, si un administrador cambia después las tarifas de un evento en `/admin/inventario`, los reportes históricos no se distorsionan.
- `TicketCard` genera en el cliente un `<QRCodeSVG>` cuyo contenido es `buildVerifyUrl(order.id)` → `<origen>/plataforma-boletos/verificar/<orderId>`.
- `VerifyTicketPage` consulta `getOrderByCode(code)` y muestra si el boleto es **válido**, si pertenece a un **evento finalizado** o si el código **no existe**.

---

## 5. PWA, Service Worker y GitHub Pages

- **Estrategias Workbox:**
  - *Precache* para el *app shell* (`index.html`, JS, CSS, iconos y logo).
  - `NetworkFirst` para `/api/*.json` (3 s de *timeout* antes de usar caché), de modo que online siempre se intenten datos frescos y offline responda el caché.
  - `CacheFirst` para `/images/*` (WebP) y fuentes.
  - `navigateFallback` hacia `/plataforma-boletos/index.html` para soportar recargas offline en cualquier ruta de React Router.
- **Rutas profundas en GitHub Pages:** como GitHub Pages no tiene reescritura de servidor para SPAs, el script de `build` copia `dist/index.html` a `dist/404.html`. Cuando un usuario abre o recarga directamente `/plataforma-boletos/eventos/turandot`, GitHub Pages entrega `404.html` con el bundle de la SPA y `createBrowserRouter(..., { basename: '/plataforma-boletos' })` renderiza la ruta exacta.

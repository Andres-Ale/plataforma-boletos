# Easy Ticket — PWA de venta y gestión de boletos para eventos

Proyecto de **Programación Orientada al Usuario** (Universidad Centroamericana José Simeón Cañas).  
**Tercera entrega (final):** Aplicación Web Progresiva (PWA) con React Router 8 en modo datos, estado global con `Context` y `useReducer`, capa de acceso a datos sobre API falsa con `AbortController`, panel administrativo con operaciones CRUD, reportes dinámicos, boletos con código QR verificable y despliegue en GitHub Pages.

> **Alcance académico:** No existe backend real, base de datos externa, pasarela de pago real ni envío real de correos. Los datos semilla se sirven como JSON estáticos (`public/api/*.json`) y las mutaciones (compras, usuarios nuevos, altas/ediciones/bajas de eventos e inventario) se persisten en `localStorage`. Nunca se almacenan datos de tarjeta ni datos personales reales.

- **URL publicada (GitHub Pages):** `https://andres-ale.github.io/plataforma-boletos/`
- **Repositorio:** `https://github.com/Andres-Ale/plataforma-boletos`

---

## Tecnologías

- **React 19** + **Vite 8** (JavaScript y JSX, sin TypeScript).
- **React Router 8** en modo datos (`createBrowserRouter` + `RouterProvider`).
- **Context + `useReducer`** para sesión (`AuthProvider`), carrito (`CartProvider`) y catálogo/órdenes (`CatalogProvider`).
- **PWA:** `vite-plugin-pwa` 2 + **Workbox** (`generateSW`, precache del *app shell*, `NetworkFirst` para API y `CacheFirst` para imágenes y fuentes).
- **QR en el cliente:** `qrcode.react` (`QRCodeSVG`) apuntando a una ruta verificable (`/verificar/:code`).
- **Estilos:** CSS propio con variables del Design System (sin librerías externas de UI).
- **Calidad:** `oxlint` (0 advertencias, 0 errores) e imágenes optimizadas en WebP.

---

## Instalación y ejecución

Requisitos: **Node.js 20 o superior**.

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173/
```

Otros comandos disponibles:

```bash
npm run build      # compila la PWA en dist/ (con base /plataforma-boletos/, 404.html y .nojekyll)
npm run preview    # previsualiza la compilación de producción
npm run lint       # ejecuta oxlint sobre todo src/
```

---

## Arquitectura de carpetas

```text
public/
  .nojekyll                 evita que GitHub Pages ignore archivos con guion bajo
  api/                      datos semilla JSON consumidos con fetch()
    events.json             8 eventos iniciales con zonas y precios
    orders.json             41 órdenes históricas para poblar reportes y ocupación
    users.json              cuentas de prueba con roles
  icons/                    iconos PWA (192x192, 512x512, maskable 512x512, apple-touch-icon)
  images/                   logo y afiches optimizados en WebP
src/
  api/                      capa de acceso a datos (separada de los componentes)
    client.js               delay cancelable con AbortSignal, fetchJson, ApiError, localStorage
    store.js                combinación de JSON semilla + mutaciones en localStorage
    events.js               listEvents, createEvent, updateEvent, deleteEvent
    orders.js               listOrders, createOrder, getOrderByCode
    auth.js                 login, register, updateProfile, requestPasswordReset
    users.js                listUsers (sin exponer contraseñas)
    payments.js             processPayment (simulación con rechazo controlado)
  context/                  estado global con Context + useReducer
    contexts.js             objetos Context, ROLES y hooks useAuth, useCart, useCatalog
    AuthContext.jsx         sesión persistida en et_session
    CartContext.jsx         carrito persistido en et_cart
    CatalogContext.jsx      eventos y órdenes sincronizados con la API falsa
    useLogout.js            cierre de sesión coordinado (limpia sesión y carrito)
  router/                   React Router 8 en modo datos
    index.jsx               createBrowserRouter con basename y rutas anidadas
    RootLayout.jsx          layout global (Header, CartPanel, PwaPrompts, Outlet, Footer)
    RequireAuth.jsx         guardia de autenticación y autorización por rol
    CatalogGate.jsx         barrera de carga/error con reintento del catálogo
    ErrorPages.jsx          página 404 y límite de error de ruta
    lazyAdmin.jsx           carga diferida (React.lazy + Suspense) del módulo admin
  pages/                    vistas públicas, de cliente y subcarpetas admin/
  components/               componentes reutilizables del Design System y subcarpeta admin/
  hooks/useAsync.js         hook asíncrono reutilizable con AbortController
  utils/                    funciones puras (asientos, órdenes, formato, validación, reportes)
  styles/                   tokens del Design System, estilos globales y de páginas
.github/workflows/deploy.yml  compilación y publicación automática en GitHub Pages
docs/
  ARQUITECTURA.md           decisiones técnicas, flujo de datos y estado
  capturas/                 evidencias en 375 px, 768 px, 1440 px y capturas PWA
```

---

## Mapa de rutas

| Ruta | Contenido | Acceso |
|---|---|---|
| `/` | Inicio y próximos eventos destacados | Público |
| `/eventos` | Listado completo, búsqueda y filtros por mes, recinto y categoría | Público |
| `/eventos/:id` | Detalle del evento, sinopsis y precios por zona | Público |
| `/eventos/:id/asientos` | Mapa interactivo de 36 asientos por zona | Público |
| `/carrito` | Revisión de asientos seleccionados y resumen de compra | Público |
| `/checkout` | Pago simulado con prevención de doble envío | Público (redirige a `/login` al pagar si no hay sesión) |
| `/login` · `/registro` | Inicio de sesión, registro y recuperación simulada | Público |
| `/ayuda` | Preguntas frecuentes | Público |
| `/verificar/:code` | Verificación pública del código QR de un boleto | Público |
| `/confirmacion/:orderId` | Confirmación de compra, boleto con QR y envío simulado | Autenticado |
| `/boletos` | Historial de boletos electrónicos del usuario | Autenticado |
| `/perfil` | Edición persistente de nombre y correo | Autenticado |
| `/admin` | Dashboard de KPIs, top de ingresos y directorio de usuarios | Administrador u organizador |
| `/admin/eventos` | CRUD completo de eventos con validación y confirmación | Administrador u organizador |
| `/admin/inventario` | Edición de precios, cupos por zona y bloqueo por asiento | Administrador u organizador |
| `/admin/reportes` | Reportes dinámicos por evento y fechas + exportación CSV | **Solo administrador** |
| `*` | Página 404 con retorno al catálogo | Público |

---

## API falsa y mapeo de datos

Se implementó la estrategia recomendada de **API falsa local** en `src/api/`:

1. **Lectura inicial (`fetch`):** `fetchJson()` descarga `public/api/events.json`, `orders.json` y `users.json` respetando `import.meta.env.BASE_URL`.
2. **Latencia y cancelación:** todas las operaciones pasan por `delay(ms, signal)` y `fetch(..., { signal })`. Si el componente se desmonta o el usuario recarga, `AbortController` cancela la operación y `isAbortError()` evita actualizar estado desmontado.
3. **Mutaciones persistidas:** al crear/editar/eliminar eventos, ajustar inventario, registrar cuentas, editar perfil o confirmar una orden, `src/api/store.js` persiste el cambio en `localStorage` (`et_events`, `et_orders`, `et_users`).
4. **Simulación de fallos para demostración:**
   - Abrir `/?fail` o `/eventos?fail` provoca un fallo controlado en el primer `listEvents()` para mostrar `ErrorMessage` y el botón **Reintentar**.
   - En `/checkout`, una tarjeta terminada en `0000` simula un rechazo bancario; cualquier otra tarjeta válida de 16 dígitos con fecha futura aprueba la orden.

---

## Credenciales de demostración y roles

Contraseña común para todas las cuentas de prueba: **`Password123!`**

| Nombre | Correo | Rol | Permisos principales |
|---|---|---|---|
| Andrés Ale | `andres.ale@easyticket.com` | `administrador` | Compra + `/admin`, CRUD de eventos, inventario y `/admin/reportes` |
| Carlos Rivera | `carlos.rivera@easyticket.com` | `organizador` | Compra + `/admin`, CRUD de eventos e inventario (sin `/admin/reportes`) |
| Luis Pacheco | `luis.pacheco@easyticket.com` | `cliente` | Flujo de compra, `/boletos` y `/perfil` |

---

## Configuración PWA y estrategias de caché

Configurada en [`vite.config.js`](vite.config.js) mediante `vite-plugin-pwa` y Workbox:

- **Web App Manifest (`manifest.webmanifest`):** nombre completo y corto, descripción, `start_url` y `scope` sincronizados con `base`, `display: "standalone"`, `theme_color` y `background_color` `#0B2D5B`, e iconos `192×192`, `512×512` y `512×512` `maskable`.
- **Precache del App Shell:** HTML, bundles JS/CSS (incluidos los chunks diferidos del panel administrativo), SVG e iconos principales.
- **Fallback SPA (`navigateFallback`):** `/plataforma-boletos/index.html` (excluyendo `/api/*.json`) para que cualquier ruta profunda cargue sin conexión tras la primera visita.
- **`NetworkFirst` (`easyticket-api`):** para `/api/*.json` con *timeout* de 3 s; prioriza datos frescos y cae al caché cuando no hay red.
- **`CacheFirst` (`easyticket-images` y `easyticket-fonts`):** para afiches WebP, imágenes y tipografía Montserrat.
- **Avisos en interfaz (`PwaPrompts`):** banda superior cuando el navegador pierde conexión (`offline`/`online`), aviso de aplicación lista para uso offline y aviso con botón **Actualizar** (`registerType: 'prompt'`) cuando hay un nuevo Service Worker esperando.

---

## Publicación en GitHub Pages

1. `vite.config.js` define `base: '/plataforma-boletos/'` en compilación y `router/index.jsx` toma `import.meta.env.BASE_URL` como `basename`.
2. `npm run build` genera `dist/sw.js`, `dist/manifest.webmanifest`, `dist/.nojekyll` y copia `dist/index.html` en `dist/404.html` para que GitHub Pages resuelva recargas directas en rutas profundas (`/eventos/turandot`, `/admin/reportes`, `/verificar/...`).
3. El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) ejecuta `npm ci` y `npm run build` en cada *push* a `main` y publica `dist/` con `actions/deploy-pages@v4`.
4. En el repositorio de GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

---

## Capturas

Capturas responsive en [`docs/capturas/`](docs/capturas/) (375 px, 768 px y 1440 px) y capturas de la entrega PWA en [`docs/capturas/pwa/`](docs/capturas/pwa/):

- [Listado de eventos](docs/capturas/pwa/01-eventos.png) · [Detalle](docs/capturas/pwa/02-detalle.png) · [Carrito](docs/capturas/pwa/03-carrito.png) · [Checkout](docs/capturas/pwa/04-checkout.png)
- [Boleto con código QR verificable](docs/capturas/pwa/05-boleto-qr.png) · [CRUD administrativo](docs/capturas/pwa/06-admin-crud.png) · [Reportes dinámicos](docs/capturas/pwa/07-reportes.png) · [Modo offline](docs/capturas/pwa/08-modo-offline.png)
- [Manifest en Chrome DevTools](docs/capturas/pwa/09-devtools-manifest.png) · [Service Worker activo en Chrome DevTools](docs/capturas/pwa/10-devtools-service-worker.png)

---

## Limitaciones conocidas

- **Persistencia local por navegador:** los cambios del CRUD y las compras viven en `localStorage` del dispositivo donde se realizaron; otro navegador verá los datos semilla hasta interactuar.
- **Sin pasarela ni correo real:** los pagos y el envío por correo son simulaciones controladas con fines académicos.
- **Contraseñas de prueba en JSON semilla:** solo se usan cuentas ficticias de demostración; en producción la autenticación residiría en un servidor con hash seguro y tokens firmados.

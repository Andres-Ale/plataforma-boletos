# Easy Ticket — plataforma de venta y gestión de boletos para eventos

Proyecto de **Programación Orientada al Usuario** (Universidad Centroamericana José Simeón Cañas).
Segunda entrega: implementación en React del MVP diseñado en Figma en la primera entrega.

Easy Ticket permite explorar eventos culturales (óperas y conciertos sinfónicos), elegir asientos en un mapa interactivo, pagar de forma **simulada** y obtener un boleto electrónico con código QR. No hay backend, base de datos, pasarela de pago real ni envío real de correos: todo funciona con datos simulados y persistencia en `localStorage`.

## Tecnologías

React 19 · Vite 8 · JavaScript/JSX · CSS propio (sin librerías de UI) · `qrcode.react` (QR generado en el cliente) · oxlint.

## Instalación y ejecución

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
```

Otros comandos: `npm run build` (compilación de producción), `npm run preview` (probar la compilación) y `npm run lint`.

## Cuentas de demostración

La contraseña de todas es `Password123!`. También se puede crear una cuenta nueva desde "Crear cuenta".

| Nombre | Correo | Rol |
|---|---|---|
| Andrés Ale | `andres.ale@easyticket.com` | administrador |
| Luis Pacheco | `luis.pacheco@easyticket.com` | cliente |
| Carlos Rivera | `carlos.rivera@easyticket.com` | organizador |

## Cómo probar los estados de error

- **Error de carga de eventos:** abrir `http://localhost:5173/?fail`. Falla la primera vez y funciona al pulsar "Reintentar".
- **Pago rechazado:** usar una tarjeta que termine en `0000`. Cualquier otro número válido (por ejemplo `4242 4242 4242 4242`, vencimiento futuro, CVC de 3 dígitos) es aprobado.
- **Estado vacío:** buscar un texto que no coincida con ningún evento.
- **Asientos ya vendidos:** al terminar una compra, esos asientos aparecen como no disponibles en el mapa.

## Módulos del MVP cubiertos (8 de 8)

| # | Módulo | Estado | Dónde |
|---|---|---|---|
| 1 | Usuarios y autenticación | Implementado | Login, registro, recuperación de contraseña (simulada), perfil editable, roles visuales. `AuthView`, `ProfileView`, `services/auth.js` |
| 2 | Gestión de eventos | Implementado | Listado agrupado por categoría, búsqueda por texto, filtros por fecha y lugar, detalle y estados del evento. `EventsPage`, `EventDetailPage` |
| 3 | Inventario y precios | Implementado | Zonas VIP, Diamante y Palco con precio y disponibilidad por evento, visibles en el detalle y en el mapa de asientos. `SeatMap`, `ZoneLegend` |
| 4 | Proceso de compra | Implementado | Selección de asientos, carrito, resumen y flujo de 4 pasos con indicador de progreso. `SeatsPage`, `CartPanel`, `OrderSummary`, `StepIndicator` |
| 5 | Sistema de pagos | Implementado | Tarjeta, PayPal y Bitcoin simulados, validación, confirmación y estados de éxito/error. `PaymentPage`, `fakeApi.js` |
| 6 | Boletos electrónicos | Implementado | Boleto con código QR, "Mis boletos" y descarga por impresión. `TicketCard`, `MyTicketsPage` |
| 7 | Panel de administración | Implementado | Dashboard con indicadores, inventario y precios por evento (con filtros por categoría y estado) y directorio de usuarios con roles (filtro por rol). Solo accesible para administrador y organizador; un cliente ve un aviso de acceso restringido. `AdminPage` (menú de usuario → "Panel de administración") |
| 8 | Reportes y analítica | Implementado | Tarjetas y gráficos de barras estáticos: ingresos y ocupación por evento, ventas por categoría y periodo, y rendimiento por zona. Se calculan a partir de los eventos y las órdenes guardadas. `AdminPage` (pestaña "Reportes") |

## Flujo principal

Listado de eventos → detalle → selección de asientos (zona y cantidad) → carrito y resumen → pago simulado → confirmación → boleto con QR. Las pantallas de asientos, pago, confirmación, boletos y perfil exigen sesión: si no hay una, se lleva al login y luego se regresa al punto donde iba el usuario.

## Estructura de carpetas

```
public/images/          logo y afiches de los 8 eventos
src/
  App.jsx               estado elevado y navegación por vistas
  main.jsx              punto de entrada
  components/           componentes reutilizables (UI y mapa de asientos)
  pages/                vistas completas (una por pantalla)
  hooks/                useAsync, useLocalStorage
  services/auth.js      cuentas y sesión simuladas
  data/events.js        8 eventos con zonas, precios y asientos ocupados
  utils/                formato, asientos, órdenes, validación y API simulada
  styles/               variables, estilos globales y de páginas
docs/                   arquitectura y capturas
```

## Inventario de componentes (`src/components`)

| Componente | Props principales | Función |
|---|---|---|
| `Button` | `variant`, `size`, `block`, `type` | Botón (primario, contorno, claro) |
| `Input` | `id`, `label`, `error`, `hint` | Campo con etiqueta asociada y mensaje de error |
| `Icon` | `name`, `size` | Íconos SVG propios |
| `Logo` | `height` | Logotipo de Easy Ticket |
| `Header` | `user`, `cartCount`, `currentView`, `onNavigate`, `onLogout`, `onCartClick` | Navegación, menú de usuario y carrito |
| `Footer` | — | Beneficios, redes y créditos |
| `EventCard` | `event`, `status`, `onSelect` | Tarjeta de evento con afiche, fecha, lugar y precio |
| `EventImage` | `event` | Afiche con recuadro de respaldo si falta la imagen |
| `SearchBar` | `filters`, `months`, `venues`, `onChange`, `onSubmit` | Búsqueda y filtros |
| `CategoryTabs` | `categories`, `selected`, `onSelect` | Filtro por categoría |
| `SeatMap` | `event`, `takenSeats`, `selectedSeats`, `onToggle` | Mapa de asientos por zonas |
| `Seat` | `id`, `event`, `state`, `onToggle` | Asiento (disponible, seleccionado, ocupado) |
| `SeatLegend`, `ZoneLegend` | `prices` | Leyendas del mapa y de precios por zona |
| `StepIndicator` | `current` | Indicador de progreso de 4 pasos |
| `OrderSummary` | `event`, `seats`, `title` | Resumen agrupado por zona con total |
| `CartPanel` | `open`, `event`, `seats`, `onClose`, `onRemoveSeat`, `onCheckout` | Panel lateral del carrito |
| `PaymentMethodSelector` | `value`, `onChange`, `disabled` | Tarjeta, PayPal o Bitcoin |
| `TicketCard` | `order`, `event` | Boleto electrónico con QR |
| `LoadingState`, `ErrorMessage`, `EmptyState` | `message`, `onRetry`, `title`, `text`, `actionLabel`, `onAction` | Estados de carga, error con reintento y vacío |
| `AuthView` | `initialMode`, `onAuthSuccess`, `onNavigate` | Login, registro y recuperación de contraseña |
| `ProfileView` | `session`, `onSessionChange`, `onNavigate` | Perfil editable y cierre de sesión |

## Mapa de estado y persistencia

| Estado | Dónde vive | Persistencia |
|---|---|---|
| Vista actual y sus parámetros | `App` (`useState`) | No |
| Sesión del usuario | `App` (`useLocalStorage`) | `et_user` |
| Carrito (evento y asientos) | `App` (`useLocalStorage`) | `et_cart` |
| Órdenes de compra | `App` (`useLocalStorage`) | `et_orders` |
| Eventos cargados | `App` (`useAsync`) | No (datos en `data/events.js`) |
| Usuarios registrados | `services/auth.js` | `easyticket_users` |
| Sesión del módulo de cuentas | `services/auth.js` | `easyticket_session` |
| Filtros, formulario de pago, avisos | Estado local de cada página | No |

Los totales, la cantidad del carrito, los asientos ocupados y el estado de cada evento **se calculan** a partir del carrito y las órdenes; no se guardan duplicados. Más detalle en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

## Datos simulados

- **8 eventos** en 2 categorías: *Grandes Operas* (Turandot, La traviata, Carmen, I Pagliacci) y *Cine y Conciertos Sinfónicos* (Hans Zimmer, John Williams, Einaudi, Morricone), con fecha, recinto, ciudad, duración, clasificación, sinopsis y afiche.
- **3 zonas por evento** (VIP, Diamante y Palco) con precios propios y **36 asientos** por evento; cada evento trae algunos ya ocupados.
- **3 usuarios** de demostración con roles de cliente, administrador y organizador.
- Las órdenes se crean al comprar y se guardan en el navegador.

## Estados de interfaz y accesibilidad

- **Carga, error con reintento y vacío** en el listado y en el pago; el botón de pago se bloquea mientras procesa para evitar dobles compras, y al pagar se vuelve a validar la disponibilidad de los asientos.
- **Formularios controlados** con validación y mensajes claros (tarjeta, vencimiento, CVC, correo, contraseña).
- HTML semántico, enlace "Saltar al contenido", foco que pasa al contenido al cambiar de vista, título de pestaña por vista, etiquetas asociadas a cada campo, foco visible, textos alternativos en imágenes y estados anunciados con `role="status"` y `role="alert"`.
- Los asientos tienen nombre accesible (`aria-label`) y `aria-pressed`; el estado no depende solo del color (seleccionado con borde grueso, ocupado tachado).
- Navegación por teclado completa, con cierre del carrito con `Escape`.

## Responsividad

Probado a **375 px** (móvil), **768 px** (tablet) y **1440 px** (escritorio), sin desbordes horizontales de página. En pantallas menores a 480 px el mapa de asientos apila las zonas (V.I.P., Diamante, Palcos A y B lado a lado, Palco C) para que todos los asientos quepan con un tamaño táctil cómodo. Capturas en [`docs/capturas/`](docs/capturas/):

| Vista | 375 px | 768 px | 1440 px |
|---|---|---|---|
| Listado de eventos | [ver](docs/capturas/375/01-eventos.png) | [ver](docs/capturas/768/01-eventos.png) | [ver](docs/capturas/1440/01-eventos.png) |
| Login | [ver](docs/capturas/375/02-login.png) | [ver](docs/capturas/768/02-login.png) | [ver](docs/capturas/1440/02-login.png) |
| Recuperar contraseña | [ver](docs/capturas/375/03-recuperar-contrasena.png) | [ver](docs/capturas/768/03-recuperar-contrasena.png) | [ver](docs/capturas/1440/03-recuperar-contrasena.png) |
| Registro | [ver](docs/capturas/375/04-registro.png) | [ver](docs/capturas/768/04-registro.png) | [ver](docs/capturas/1440/04-registro.png) |
| Detalle del evento | [ver](docs/capturas/375/05-detalle.png) | [ver](docs/capturas/768/05-detalle.png) | [ver](docs/capturas/1440/05-detalle.png) |
| Selección de asientos | [ver](docs/capturas/375/06-asientos.png) | [ver](docs/capturas/768/06-asientos.png) | [ver](docs/capturas/1440/06-asientos.png) |
| Pago | [ver](docs/capturas/375/07-pago.png) | [ver](docs/capturas/768/07-pago.png) | [ver](docs/capturas/1440/07-pago.png) |
| Confirmación y boleto | [ver](docs/capturas/375/08-confirmacion-boleto.png) | [ver](docs/capturas/768/08-confirmacion-boleto.png) | [ver](docs/capturas/1440/08-confirmacion-boleto.png) |
| Mis boletos | [ver](docs/capturas/375/09-mis-boletos.png) | [ver](docs/capturas/768/09-mis-boletos.png) | [ver](docs/capturas/1440/09-mis-boletos.png) |
| Perfil | [ver](docs/capturas/375/10-perfil.png) | [ver](docs/capturas/768/10-perfil.png) | [ver](docs/capturas/1440/10-perfil.png) |
| Panel de administración y reportes | [ver](docs/capturas/375/11-admin.png) | [ver](docs/capturas/768/11-admin.png) | [ver](docs/capturas/1440/11-admin.png) |

## Limitaciones y decisiones de diseño

- **Sin backend ni pago real.** El pago, la carga de eventos y el "Enviar a mi correo" son simulaciones con retardos. Nunca se guardan datos de tarjeta, solo el método usado.
- **Contraseñas en texto plano** dentro de `localStorage`. Es aceptable solo porque son cuentas ficticias de un proyecto académico; en un sistema real irían cifradas en un servidor.
- **Navegación por estado de vista**, sin React Router (la rúbrica no lo exige en esta entrega). Router, Context, API falsa y PWA quedan para la siguiente.
- **Selección por asiento** en lugar de "zona y cantidad": cubre el requisito (el usuario elige zona y cuántos boletos) con el mapa del prototipo. El carrito admite un solo evento a la vez y hasta 8 asientos.
- **Contraste:** el texto blanco sobre el naranja de los botones (fiel al Figma) tiene una relación de 2.9:1, por debajo del 4.5:1 recomendado por WCAG AA. Una mejora futura es usar texto azul marino sobre el naranja (4.8:1).
- **Inicio de sesión con Google** es una simulación que entra con una cuenta de demostración.
-  **Panel de administración y reportes** de solo lectura: muestran datos simulados y las órdenes del navegador; no permiten crear, editar ni eliminar eventos, precios o usuarios. Los gráficos son barras hechas con CSS, sin librería de gráficos

## Reparto de trabajo

| Persona | Responsabilidades |
|---|---|
| **Andrés Ale** | Flujo de compra completo (listado, búsqueda, detalle, mapa de asientos, carrito, pago simulado, confirmación y boleto con QR), componentes reutilizables, integración de las dos ramas, ajustes de responsividad y accesibilidad, documentación y capturas. |
| **Luis Pacheco** | Pantallas de cuenta (login, registro, perfil), servicio de sesión simulada, estilos de las pantallas de cuenta, datos iniciales y base del proyecto. |

La presentación la preparan y exponen ambos. Los commits de cada integrante se conservan en el historial de Git.

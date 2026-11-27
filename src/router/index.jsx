import { createBrowserRouter } from 'react-router'
import { ROLES } from '../context/contexts'
import CartPage from '../pages/CartPage'
import ConfirmationPage from '../pages/ConfirmationPage'
import EventDetailPage from '../pages/EventDetailPage'
import EventsPage from '../pages/EventsPage'
import HelpPage from '../pages/HelpPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import MyTicketsPage from '../pages/MyTicketsPage'
import PaymentPage from '../pages/PaymentPage'
import ProfilePage from '../pages/ProfilePage'
import SeatsPage from '../pages/SeatsPage'
import VerifyTicketPage from '../pages/VerifyTicketPage'
import CatalogGate from './CatalogGate'
import { NotFoundPage, RouteError } from './ErrorPages'
import RequireAuth from './RequireAuth'
import RootLayout from './RootLayout'

import {
  LazyAdminDashboard,
  LazyAdminEvents,
  LazyAdminInventory,
  LazyAdminLayout,
  LazyAdminReports,
} from './lazyAdmin'

// En local `BASE_URL` es "/"; en GitHub Pages es "/plataforma-boletos/".
// createBrowserRouter exige basename sin barra final (salvo "/").
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <RouteError />,
      children: [
        // ---- Públicas ----
        { index: true, element: <HomePage />, handle: { title: 'Inicio' } },
        { path: 'eventos', element: <EventsPage />, handle: { title: 'Eventos' } },
        { path: 'ayuda', element: <HelpPage />, handle: { title: 'Ayuda' } },
        { path: 'login', element: <LoginPage initialMode="login" />, handle: { title: 'Iniciar sesión' } },
        { path: 'registro', element: <LoginPage initialMode="register" />, handle: { title: 'Crear cuenta' } },
        { path: 'verificar/:code', element: <VerifyTicketPage />, handle: { title: 'Verificación de boleto' } },

        // ---- Necesitan el catálogo cargado ----
        {
          element: <CatalogGate />,
          children: [
            { path: 'eventos/:id', element: <EventDetailPage />, handle: { title: 'Detalle del evento' } },
            { path: 'eventos/:id/asientos', element: <SeatsPage />, handle: { title: 'Selección de asientos' } },
            { path: 'carrito', element: <CartPage />, handle: { title: 'Tu carrito' } },
            { path: 'checkout', element: <PaymentPage />, handle: { title: 'Pago' } },

            // ---- Protegidas: usuario autenticado ----
            {
              element: <RequireAuth />,
              children: [
                { path: 'confirmacion/:orderId', element: <ConfirmationPage />, handle: { title: 'Compra exitosa' } },
                { path: 'boletos', element: <MyTicketsPage />, handle: { title: 'Mis boletos' } },
                { path: 'perfil', element: <ProfilePage />, handle: { title: 'Mi perfil' } },
              ],
            },

            // ---- Protegidas por rol: administrador u organizador ----
            {
              path: 'admin',
              element: <RequireAuth roles={[ROLES.admin, ROLES.organizer]} />,
              children: [
                {
                  element: <LazyAdminLayout />,
                  children: [
                    { index: true, element: <LazyAdminDashboard />, handle: { title: 'Administración' } },
                    { path: 'eventos', element: <LazyAdminEvents />, handle: { title: 'Gestión de eventos' } },
                    { path: 'inventario', element: <LazyAdminInventory />, handle: { title: 'Inventario y precios' } },
                    // Solo Administrador (un organizador ve "Acceso restringido")
                    {
                      element: <RequireAuth roles={[ROLES.admin]} />,
                      children: [
                        { path: 'reportes', element: <LazyAdminReports />, handle: { title: 'Reportes' } },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ---- 404 ----
        { path: '*', element: <NotFoundPage />, handle: { title: 'Página no encontrada' } },
      ],
    },
  ],
  { basename },
)

export default router

import { Suspense, lazy } from 'react'
import { LoadingState } from '../components/StatusViews'

// Carga diferida del panel administrativo: un visitante público no descarga ese código
const Layout = lazy(() => import('../pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('../pages/admin/AdminDashboardPage'))
const Events = lazy(() => import('../pages/admin/AdminEventsPage'))
const Inventory = lazy(() => import('../pages/admin/AdminInventoryPage'))
const Reports = lazy(() => import('../pages/admin/AdminReportsPage'))

const fallback = <div className="container"><LoadingState message="Cargando panel..." /></div>

export function LazyAdminLayout() {
  return <Suspense fallback={fallback}><Layout /></Suspense>
}
export function LazyAdminDashboard() {
  return <Suspense fallback={fallback}><Dashboard /></Suspense>
}
export function LazyAdminEvents() {
  return <Suspense fallback={fallback}><Events /></Suspense>
}
export function LazyAdminInventory() {
  return <Suspense fallback={fallback}><Inventory /></Suspense>
}
export function LazyAdminReports() {
  return <Suspense fallback={fallback}><Reports /></Suspense>
}

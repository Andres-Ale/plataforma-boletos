import { Outlet } from 'react-router'
import { ErrorMessage, LoadingState } from '../components/StatusViews'
import { useCatalog } from '../context/contexts'

// Las rutas hijas necesitan los eventos cargados: aquí se muestran la carga y el error con reintento.
function CatalogGate() {
  const { status, error, reload } = useCatalog()

  if (status === 'loading') {
    return <div className="container"><LoadingState message="Cargando..." /></div>
  }
  if (status === 'error') {
    return <div className="container"><ErrorMessage message={error} onRetry={reload} /></div>
  }
  return <Outlet />
}

export default CatalogGate

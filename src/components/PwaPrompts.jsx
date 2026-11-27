import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import './PwaPrompts.css'

// Avisos de la PWA:
//  1) Sin conexión / conexión recuperada (eventos online/offline del navegador).
//  2) Disponible sin conexión la primera vez que el service worker termina de precachear.
//  3) Nueva versión lista para activar (updateServiceWorker).
function PwaPrompts() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <>
      {!online && (
        <div className="pwa-offline" role="status" aria-live="polite">
          Estás sin conexión. Puedes seguir consultando las pantallas y boletos ya visitados.
        </div>
      )}

      {(offlineReady || needRefresh) && (
        <aside className="pwa-toast" role="status" aria-live="polite">
          <p>
            {needRefresh
              ? 'Hay una nueva versión de Easy Ticket disponible.'
              : 'Aplicación lista para usarse también sin conexión.'}
          </p>
          <div className="pwa-toast__actions">
            {needRefresh && (
              <button type="button" className="pwa-toast__btn pwa-toast__btn--primary" onClick={() => updateServiceWorker(true)}>
                Actualizar
              </button>
            )}
            <button
              type="button"
              className="pwa-toast__btn"
              onClick={() => {
                setOfflineReady(false)
                setNeedRefresh(false)
              }}
            >
              Cerrar
            </button>
          </div>
        </aside>
      )}
    </>
  )
}

export default PwaPrompts

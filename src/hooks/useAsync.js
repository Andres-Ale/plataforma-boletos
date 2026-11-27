import { useCallback, useEffect, useState } from 'react'
import { isAbortError } from '../api/client'

// Ejecuta una función asíncrona y expone { status, data, error, reload }.
//  - asyncFn(signal) recibe un AbortSignal: al desmontar o al recargar se cancela la petición anterior.
//  - status: 'loading' | 'success' | 'error'. asyncFn debe ser una referencia estable (useCallback o módulo).
export default function useAsync(asyncFn) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    asyncFn(controller.signal)
      .then((data) => setState({ status: 'success', data, error: null }))
      .catch((err) => {
        if (isAbortError(err)) return // cancelada: no se actualiza el estado
        setState({ status: 'error', data: null, error: err.message })
      })

    return () => controller.abort()
  }, [asyncFn, attempt])

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }))
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, reload }
}

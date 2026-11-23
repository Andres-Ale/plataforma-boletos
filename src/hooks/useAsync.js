import { useCallback, useEffect, useState } from 'react'

// Ejecuta una función asíncrona y expone { status, data, error, reload }.
// status: 'loading' | 'success' | 'error'. asyncFn debe ser una referencia estable.
export default function useAsync(asyncFn) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', data: null, error: null })

    asyncFn(attempt)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data, error: null })
      })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', data: null, error: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [asyncFn, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return { ...state, reload }
}

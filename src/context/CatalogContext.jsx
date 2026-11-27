import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { isAbortError } from '../api/client'
import * as eventsApi from '../api/events'
import * as ordersApi from '../api/orders'

// Catálogo global: eventos y órdenes que vienen de la API falsa.
// Estado: { status: 'loading' | 'success' | 'error', events, orders, error }
const initialState = { status: 'loading', events: [], orders: [], error: null }

// Acciones: loading · loaded · failed · eventSaved · eventDeleted · orderAdded
function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, status: 'loading', error: null }
    case 'loaded':
      return { status: 'success', events: action.events, orders: action.orders, error: null }
    case 'failed':
      return { ...state, status: 'error', error: action.error }
    case 'eventSaved': {
      const exists = state.events.some((e) => e.id === action.event.id)
      const events = exists
        ? state.events.map((e) => (e.id === action.event.id ? action.event : e))
        : [...state.events, action.event]
      return { ...state, events }
    }
    case 'eventDeleted':
      return { ...state, events: state.events.filter((e) => e.id !== action.id) }
    case 'orderAdded':
      return { ...state, orders: [...state.orders, action.order] }
    default:
      return state
  }
}

import { CatalogContext } from './contexts'

export function CatalogProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [attempt, setAttempt] = useState(0)

  // Carga inicial (y reintentos) con cancelación al desmontar o reintentar
  useEffect(() => {
    const controller = new AbortController()
    const options = { signal: controller.signal }

    Promise.all([eventsApi.listEvents(options), ordersApi.listOrders(options)])
      .then(([events, orders]) => dispatch({ type: 'loaded', events, orders }))
      .catch((err) => {
        if (!isAbortError(err)) dispatch({ type: 'failed', error: err.message })
      })

    return () => controller.abort()
  }, [attempt])

  const reload = useCallback(() => {
    dispatch({ type: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  // Escrituras: llaman a la API y, si salen bien, actualizan el estado global
  const createEvent = useCallback(async (data) => {
    const event = await eventsApi.createEvent(data)
    dispatch({ type: 'eventSaved', event })
    return event
  }, [])

  const updateEvent = useCallback(async (id, patch) => {
    const event = await eventsApi.updateEvent(id, patch)
    dispatch({ type: 'eventSaved', event })
    return event
  }, [])

  const deleteEvent = useCallback(async (id) => {
    await eventsApi.deleteEvent(id)
    dispatch({ type: 'eventDeleted', id })
  }, [])

  const placeOrder = useCallback(async (data, options) => {
    const order = await ordersApi.createOrder(data, options)
    dispatch({ type: 'orderAdded', order })
    return order
  }, [])

  const value = useMemo(
    () => ({ ...state, reload, createEvent, updateEvent, deleteEvent, placeOrder }),
    [state, reload, createEvent, updateEvent, deleteEvent, placeOrder],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}


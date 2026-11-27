import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { readLocal, writeLocal } from '../api/client'

// Carrito global: un solo evento a la vez. Los totales NO se guardan: se derivan del evento y los asientos.
const CART_KEY = 'et_cart'
const EMPTY_CART = { eventId: null, seats: [] }

const initialState = () => readLocal(CART_KEY, EMPTY_CART)

// Acciones: toggleSeat · removeSeat · clear
function reducer(state, action) {
  switch (action.type) {
    case 'toggleSeat': {
      const current = state.eventId === action.eventId ? state.seats : []
      const seats = current.includes(action.seatId)
        ? current.filter((id) => id !== action.seatId)
        : [...current, action.seatId]
      return { eventId: seats.length > 0 ? action.eventId : null, seats }
    }
    case 'removeSeat': {
      const seats = state.seats.filter((id) => id !== action.seatId)
      return { eventId: seats.length > 0 ? state.eventId : null, seats }
    }
    case 'clear':
      return EMPTY_CART
    default:
      return state
  }
}

import { CartContext } from './contexts'

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(reducer, undefined, initialState)

  useEffect(() => {
    writeLocal(CART_KEY, cart)
  }, [cart])

  const toggleSeat = useCallback((eventId, seatId) => dispatch({ type: 'toggleSeat', eventId, seatId }), [])
  const removeSeat = useCallback((seatId) => dispatch({ type: 'removeSeat', seatId }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo(
    () => ({ cart, count: cart.seats.length, toggleSeat, removeSeat, clear }),
    [cart, toggleSeat, removeSeat, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}


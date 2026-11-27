import { useCallback, useEffect, useMemo, useReducer } from 'react'
import * as authApi from '../api/auth'
import { readLocal, writeLocal } from '../api/client'

// Sesión simulada. Una sola clave de localStorage; la contraseña nunca se guarda en la sesión.
const SESSION_KEY = 'et_session'


const initialState = () => ({ user: readLocal(SESSION_KEY, null) })

// Acciones: login · logout · profileUpdated
function reducer(state, action) {
  switch (action.type) {
    case 'login':
      return { user: action.user }
    case 'logout':
      return { user: null }
    case 'profileUpdated':
      return state.user ? { user: { ...state.user, ...action.changes } } : state
    default:
      return state
  }
}

import { AuthContext } from './contexts'

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  // Persistencia: cada cambio de sesión se guarda en localStorage
  useEffect(() => {
    writeLocal(SESSION_KEY, state.user)
  }, [state.user])

  const login = useCallback(async (credentials, options) => {
    const user = await authApi.login(credentials, options)
    dispatch({ type: 'login', user })
    return user
  }, [])

  const register = useCallback(async (data, options) => {
    const user = await authApi.register(data, options)
    dispatch({ type: 'login', user })
    return user
  }, [])

  const updateProfile = useCallback(async (userId, data, options) => {
    const changes = await authApi.updateProfile(userId, data, options)
    dispatch({ type: 'profileUpdated', changes })
    return changes
  }, [])

  const logout = useCallback(() => dispatch({ type: 'logout' }), [])

  const value = useMemo(
    () => ({ user: state.user, login, register, updateProfile, logout }),
    [state.user, login, register, updateProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


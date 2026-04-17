import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function isTokenValid(token) {
  const payload = parseJwt(token)
  if (!payload) return false
  return payload.exp * 1000 > Date.now()
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('jwt_token')
    return stored && isTokenValid(stored) ? stored : null
  })

  const payload = token ? parseJwt(token) : null
  // ASP.NET Identity JWT uses ClaimTypes.NameIdentifier → serialized as "nameid"
  const userId = payload?.nameid ?? payload?.sub ?? null
  const username = payload?.unique_name ?? null
  const isAuthenticated = !!token

  function login(newToken) {
    localStorage.setItem('jwt_token', newToken)
    setToken(newToken)
  }

  function logout() {
    localStorage.removeItem('jwt_token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, userId, username, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

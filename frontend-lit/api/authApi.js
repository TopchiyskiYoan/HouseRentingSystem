import { http } from './http.js'

function pickToken(data) {
  if (!data || typeof data !== 'object') return null
  if (typeof data.token === 'string') return data.token
  if (typeof data.accessToken === 'string') return data.accessToken
  if (typeof data.jwt === 'string') return data.jwt
  return null
}

export async function login(email, password) {
  const data = await http.post('/login', { email, password })
  const token = pickToken(data)
  if (!token) {
    throw new Error('Липсва token в отговора от сървъра.')
  }
  return { token, data }
}

export async function register({ email, password, username }) {
  const payload = { email, password, username }

  const data = await http.post('/register', payload)
  const token = pickToken(data)
  if (token) return { token, data }
  return { token: null, data }
}

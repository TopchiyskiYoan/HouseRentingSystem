const TOKEN_KEY = 'jwt_token'

// Default is same-origin. If your API is on another host, set:
// window.__API_BASE_URL__ = "https://localhost:5001"
const API_BASE_URL = (() => {
  const fromWindow = typeof window !== 'undefined' ? window.__API_BASE_URL__ : undefined
  return typeof fromWindow === 'string' ? fromWindow.replace(/\/+$/, '') : ''
})()

function normalizeUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (!url.startsWith('/')) return `${API_BASE_URL}/${url}`
  return `${API_BASE_URL}${url}`
}

async function safeReadText(res) {
  try {
    return await res.text()
  } catch {
    return ''
  }
}

function extractErrorMessage(payloadText) {
  if (!payloadText) return null
  try {
    const data = JSON.parse(payloadText)
    if (typeof data?.message === 'string' && data.message.trim()) return data.message
    if (typeof data?.error === 'string' && data.error.trim()) return data.error
    if (Array.isArray(data?.errors) && data.errors.length) return data.errors.join('\n')
    if (data?.errors && typeof data.errors === 'object') {
      const parts = []
      for (const val of Object.values(data.errors)) {
        if (Array.isArray(val)) parts.push(...val)
        else if (typeof val === 'string') parts.push(val)
      }
      if (parts.length) return parts.join('\n')
    }
    return null
  } catch {
    return payloadText.length > 500 ? `${payloadText.slice(0, 500)}…` : payloadText
  }
}

export class HttpError extends Error {
  constructor(message, { status, data } = {}) {
    super(message || 'Request failed')
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

export async function request(method, url, data, { headers = {} } = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

  const reqHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  let body
  if (data !== undefined) {
    reqHeaders['Content-Type'] = 'application/json'
    body = JSON.stringify(data)
  }

  if (token) {
    reqHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(normalizeUrl(url), { method, headers: reqHeaders, body })

  if (res.status === 204) return null

  const text = await safeReadText(res)
  const contentType = res.headers.get('content-type') || ''

  let parsed = null
  if (text) {
    if (contentType.includes('application/json')) {
      try {
        parsed = JSON.parse(text)
      } catch {
        parsed = text
      }
    } else {
      parsed = text
    }
  }

  if (!res.ok) {
    const msg = extractErrorMessage(text) || `Грешка (${res.status})`
    throw new HttpError(msg, { status: res.status, data: parsed })
  }

  return parsed
}

export const http = {
  get: (url, opts) => request('GET', url, undefined, opts),
  post: (url, data, opts) => request('POST', url, data, opts),
  put: (url, data, opts) => request('PUT', url, data, opts),
  del: (url, opts) => request('DELETE', url, undefined, opts),
}

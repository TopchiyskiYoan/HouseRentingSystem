import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const { login } = useAuth()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isAgent, setIsAgent] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  function resetForm() {
    setEmail('')
    setPassword('')
    setUsername('')
    setIsAgent(false)
    setError(null)
    setSuccess(null)
  }

  function switchTab(t) {
    setTab(t)
    resetForm()
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? 'Невалиден имейл или парола')
        return
      }
      login(data.token)
      onSuccess()
    } catch {
      setError('Връзката с сървъра е неуспешна. Опитайте отново.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, isAgent }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? 'Регистрацията е неуспешна')
        return
      }
      setSuccess('Акаунтът е създаден успешно. Можете да влезете.')
      switchTab('login')
    } catch {
      setError('Връзката с сървъра е неуспешна. Опитайте отново.')
    } finally {
      setLoading(false)
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Затвори" type="button">×</button>

        <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32, height: 32, background: 'var(--accent)',
            borderRadius: 'var(--radius-sm)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path d="M9 22V12h6v10" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>HomeRent</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', margin: '1.25rem 0 1rem' }}>
          <button
            type="button"
            onClick={() => switchTab('login')}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)',
              border: tab === 'login' ? '2px solid var(--accent)' : '2px solid var(--border)',
              background: tab === 'login' ? 'var(--accent)' : 'transparent',
              color: tab === 'login' ? 'white' : 'var(--text-dark)',
              fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem'
            }}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => switchTab('register')}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)',
              border: tab === 'register' ? '2px solid var(--accent)' : '2px solid var(--border)',
              background: tab === 'register' ? 'var(--accent)' : 'transparent',
              color: tab === 'register' ? 'white' : 'var(--text-dark)',
              fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem'
            }}
          >
            Регистрация
          </button>
        </div>

        {success && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)',
            padding: '0.75rem', marginBottom: '1rem', color: '#15803d', fontSize: '0.875rem'
          }}>
            {success}
          </div>
        )}

        {error && (
          <div className="form-error" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              width="16" height="16" style={{ flexShrink: 0, marginRight: '0.375rem', display: 'inline' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} noValidate>
            <h2 id="auth-title" className="modal-title" style={{ marginBottom: '1rem' }}>Добре дошли обратно</h2>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Имейл адрес</label>
              <input
                id="login-email" type="email" className="form-input"
                placeholder="ivan@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email" autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Парола</label>
              <input
                id="login-password" type="password" className="form-input"
                placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password"
              />
            </div>
            <button type="submit" className="form-btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <Spinner label="Влизане..." /> : 'Вход'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} noValidate>
            <h2 id="auth-title" className="modal-title" style={{ marginBottom: '1rem' }}>Създайте акаунт</h2>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Потребителско име</label>
              <input
                id="reg-username" type="text" className="form-input"
                placeholder="ivan" value={username}
                onChange={(e) => setUsername(e.target.value)}
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Имейл адрес</label>
              <input
                id="reg-email" type="email" className="form-input"
                placeholder="ivan@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Парола</label>
              <input
                id="reg-password" type="password" className="form-input"
                placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                required autoComplete="new-password"
              />
            </div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              margin: '0.75rem 0 1rem', cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={isAgent}
                onChange={(e) => setIsAgent(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                Регистрирам се като брокер на имоти
              </span>
            </label>
            <button type="submit" className="form-btn" disabled={loading}>
              {loading ? <Spinner label="Регистрация..." /> : 'Регистрация'}
            </button>
          </form>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}

function Spinner({ label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
      <span style={{
        width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
        borderTopColor: 'white', borderRadius: '50%',
        display: 'inline-block', animation: 'spin 0.7s linear infinite'
      }} />
      {label}
    </span>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const categoryLabels = {
  1: 'Единична спалня',
  2: 'Двойна спалня',
  3: 'Фамилна',
}

export default function MyListingsPage() {
  const { isAuthenticated, userId, token } = useAuth()
  const navigate = useNavigate()

  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/House/All')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        const mine = (Array.isArray(data) ? data : []).filter(h => h.userId === userId)
        setHouses(mine)
      } catch (e) {
        if (!cancelled) setError(e?.message ?? 'Грешка при зареждане')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [isAuthenticated, userId, navigate])

  async function handleDelete(id) {
    if (!window.confirm('Сигурен ли си, че искаш да изтриеш тази обява?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/House/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setHouses(prev => prev.filter(h => h.id !== id))
    } catch (e) {
      alert('Грешка при изтриване: ' + e.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Зареждане...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <p className="error-text">Грешка: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>Мои обяви</h1>
          <p style={{ color: 'var(--text)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            {houses.length === 0 ? 'Нямате публикувани обяви' : `${houses.length} публикувани обяви`}
          </p>
        </div>
        <Link to="/create" className="nav-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Добави обява
        </Link>
      </div>

      {houses.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path d="M9 22V12h6v10" />
          </svg>
          <h3 className="empty-state-title">Нямате обяви</h3>
          <p className="empty-state-text">Добавете първата си обява и достигнете до хиляди наематели</p>
          <Link to="/create" className="form-btn" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none', padding: '0.75rem 1.5rem' }}>
            Добави обява
          </Link>
        </div>
      ) : (
        <div className="listings-grid">
          {houses.map(house => (
            <MyListingCard
              key={house.id}
              house={house}
              deleting={deletingId === house.id}
              onDelete={() => handleDelete(house.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MyListingCard({ house, deleting, onDelete }) {
  return (
    <article className="property-card" style={{ position: 'relative' }}>
      <Link to={`/property/${house.id}/edit`} className="property-card-link">
        <div className="property-image-wrapper">
          <img
            src={house.imageUrl}
            alt={house.title}
            className="property-image"
            loading="lazy"
          />
          <span className="property-badge">
            {Number(house.pricePerMonth).toLocaleString('bg-BG')} лв.
            <span className="property-badge-period">/месец</span>
          </span>
        </div>
        <div className="property-body">
          <p className="property-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {house.address}
          </p>
          <h3 className="property-title">{house.title}</h3>
          <div className="property-features">
            <span className="property-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 4v16" /><path d="M2 8h18a2 2 0 012 2v10" />
                <path d="M2 17h20" /><path d="M6 8v9" />
              </svg>
              {categoryLabels[house.category] ?? 'N/A'}
            </span>
          </div>
          <div className="property-footer">
            <span className="property-cta">Редактирай</span>
          </div>
        </div>
      </Link>

      <div style={{
        display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem',
        borderTop: '1px solid var(--border)', background: 'var(--bg)'
      }}>
        <Link
          to={`/property/${house.id}`}
          className="btn-edit"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Преглед
        </Link>
        <button
          className="btn-delete"
          onClick={(e) => { e.preventDefault(); onDelete() }}
          disabled={deleting}
          style={{ flex: 1 }}
        >
          {deleting ? 'Изтриване...' : 'Изтрий'}
        </button>
      </div>
    </article>
  )
}

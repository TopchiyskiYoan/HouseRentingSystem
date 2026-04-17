import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  { value: 1, label: 'Единична спалня (SingleBedroom)' },
  { value: 2, label: 'Двойна спалня (DoubleBedroom)' },
  { value: 3, label: 'Фамилна (FamilyBedroom)' },
]

export default function EditHousePage() {
  const { id } = useParams()
  const { isAuthenticated, userId, token } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/House/${id}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (cancelled) return

        if (data.userId !== userId) {
          navigate('/')
          return
        }

        setForm({
          title: data.title ?? '',
          address: data.address ?? '',
          imageUrl: data.imageUrl ?? '',
          description: data.description ?? '',
          pricePerMonth: data.pricePerMonth ?? '',
          category: 1, // default — API doesn't return category enum yet
        })
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setFetching(false)
      }
    })()
    return () => { cancelled = true }
  }, [id, isAuthenticated, userId, navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/House/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          address: form.address,
          imageUrl: form.imageUrl,
          description: form.description,
          pricePerMonth: Number(form.pricePerMonth),
          category: Number(form.category),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message ?? `Грешка ${res.status}. Проверете полетата.`)
        return
      }

      navigate(`/property/${id}`)
    } catch {
      setError('Връзката с сървъра е неуспешна. Опитайте отново.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Зареждане...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="container">
        <div className="error-container">
          <p className="error-text">Грешка: {error ?? 'Обявата не е намерена'}</p>
          <Link to="/" className="back-link">Обратно</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="house-form-page">
      <Link
        to={`/property/${id}`}
        className="back-link"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.5rem' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
        </svg>
        Обратно към обявата
      </Link>

      <h1 className="house-form-title">Редактирай обявата</h1>
      <p className="house-form-subtitle">Промените ще бъдат видими веднага след запазване</p>

      <div className="house-form">
        {error && (
          <div className="form-error" role="alert" style={{ marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="title">Заглавие</label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-input"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pricePerMonth">Цена / месец (лв.)</label>
              <input
                id="pricePerMonth"
                name="pricePerMonth"
                type="number"
                className="form-input"
                value={form.pricePerMonth}
                onChange={handleChange}
                required
                min={0}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Адрес</label>
            <input
              id="address"
              name="address"
              type="text"
              className="form-input"
              value={form.address}
              onChange={handleChange}
              required
              maxLength={150}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="imageUrl">URL на снимка</label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              className="form-input"
              value={form.imageUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">Категория</label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={form.description}
              onChange={handleChange}
              required
              maxLength={500}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="form-btn" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Запазване...' : 'Запази промените'}
            </button>
            <Link to={`/property/${id}`} className="btn-secondary">Отказ</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

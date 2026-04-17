import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  { value: 1, label: 'Единична спалня (SingleBedroom)' },
  { value: 2, label: 'Двойна спалня (DoubleBedroom)' },
  { value: 3, label: 'Фамилна (FamilyBedroom)' },
]

export default function CreateHousePage() {
  const { isAuthenticated, token } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    address: '',
    imageUrl: '',
    description: '',
    pricePerMonth: '',
    category: 1,
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) navigate('/')
  }, [isAuthenticated, navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/house/All', {
        method: 'POST',
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

      navigate('/')
    } catch {
      setError('Връзката с сървъра е неуспешна. Опитайте отново.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="house-form-page">
      <Link to="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.5rem' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
        </svg>
        Обратно към обявите
      </Link>

      <h1 className="house-form-title">Добави нова обява</h1>
      <p className="house-form-subtitle">Попълнете детайлите за вашия имот</p>

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
                placeholder="напр. Модерен апартамент в центъра"
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
                placeholder="напр. 950"
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
              placeholder="напр. бул. Витоша 15, София"
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
              placeholder="https://images.unsplash.com/..."
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
              required
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
              placeholder="Опишете имота — локация, удобства, особености..."
              value={form.description}
              onChange={handleChange}
              required
              maxLength={500}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="form-btn" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Публикуване...' : 'Публикувай обявата'}
            </button>
            <Link to="/" className="btn-secondary">Отказ</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

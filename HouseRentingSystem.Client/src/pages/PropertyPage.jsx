import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PropertyPage() {
  const { id } = useParams()
  const { userId, token } = useAuth()
  const navigate = useNavigate()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/House/${id}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        setProperty(data)
        setError(null)
      } catch (e) {
        if (!cancelled) {
          setError(e?.message ?? 'Грешка при зареждане')
          setProperty(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  async function handleDelete() {
    if (!window.confirm('Сигурен ли си, че искаш да изтриеш тази обява?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/House/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      navigate('/')
    } catch (e) {
      alert('Грешка при изтриване: ' + e.message)
      setDeleting(false)
    }
  }

  const isOwner = !!(userId && property?.userId && property.userId === userId)

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Зареждане на обявата...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="container">
        <div className="error-container">
          <p className="error-text">Грешка: {error ?? 'Обявата не е намерена'}</p>
          <Link to="/" className="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            Обратно към обявите
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container detail-page">
      <Link to="/" className="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
        </svg>
        Обратно към обявите
      </Link>

      <div className="detail-header">
        <h1 className="detail-title">{property.title}</h1>
        <p className="detail-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {property.address}
        </p>

        {isOwner && (
          <div className="owner-actions">
            <Link to={`/property/${id}/edit`} className="btn-edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Редактирай
            </Link>
            <button
              className="btn-delete"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Изтриване...' : 'Изтрий обявата'}
            </button>
          </div>
        )}
      </div>

      <div className="detail-image-section">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="detail-main-image"
        />
      </div>

      <div className="detail-content">
        <div className="detail-main">
          <div className="detail-section">
            <h2 className="detail-section-title">Описание</h2>
            <p className="detail-description">{property.description}</p>
          </div>
          <div className="detail-section">
            <h2 className="detail-section-title">Местоположение</h2>
            <p className="detail-description">
              Имотът се намира на адрес: <strong>{property.address}</strong>.
              Районът е с отлична инфраструктура, близо до обществен транспорт,
              магазини и училища.
            </p>
          </div>
        </div>

        <aside>
          <div className="booking-card">
            <div className="booking-price">
              <span className="booking-price-amount">
                {Number(property.pricePerMonth).toLocaleString('bg-BG')} лв.
              </span>
              <span className="booking-price-period">/месец</span>
            </div>

            <form className="booking-form" onSubmit={(e) => e.preventDefault()}>
              <div className="booking-input-group">
                <label className="booking-label">Дата на нанасяне</label>
                <input type="date" className="booking-input" />
              </div>
              <div className="booking-input-group">
                <label className="booking-label">Вашият телефон</label>
                <input type="tel" className="booking-input" placeholder="+359 88 888 8888" />
              </div>
              <button type="submit" className="booking-btn">
                Запитване за имота
              </button>
            </form>

            <p className="booking-info">Ще се свържем с вас до 24 часа</p>

            <div className="contact-section">
              <div className="contact-avatar">ИП</div>
              <div className="contact-info">
                <p className="contact-name">Иван Петров</p>
                <p className="contact-role">Брокер на имоти</p>
              </div>
              <button className="contact-btn">Обади се</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

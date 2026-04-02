import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const kindLabels = {
  1: 'Студио',
  2: '1 спалня',
  3: '2 спални',
  4: '3 спални',
  5: '4+ спални',
  6: 'Пентхаус',
  7: 'Дуплекс',
  8: 'Лофт',
  9: 'Таунхаус',
  10: 'Къща',
  11: 'Вила',
}

export default function PropertyPage() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    return () => {
      cancelled = true
    }
  }, [id])

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
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
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
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
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
            <h2 className="detail-section-title">Характеристики</h2>
            <div className="detail-features-grid">
              <div className="detail-feature">
                <div className="detail-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 4v16" />
                    <path d="M2 8h18a2 2 0 012 2v10" />
                    <path d="M2 17h20" />
                    <path d="M6 8v9" />
                  </svg>
                </div>
                <div className="detail-feature-text">
                  <p className="detail-feature-label">Тип имот</p>
                  <p className="detail-feature-value">{kindLabels[property.kind] ?? 'N/A'}</p>
                </div>
              </div>
              <div className="detail-feature">
                <div className="detail-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 8h20" />
                  </svg>
                </div>
                <div className="detail-feature-text">
                  <p className="detail-feature-label">Обзавеждане</p>
                  <p className="detail-feature-value">Напълно обзаведен</p>
                </div>
              </div>
              <div className="detail-feature">
                <div className="detail-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                </div>
                <div className="detail-feature-text">
                  <p className="detail-feature-label">Площ</p>
                  <p className="detail-feature-value">85 кв.м</p>
                </div>
              </div>
              <div className="detail-feature">
                <div className="detail-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="detail-feature-text">
                  <p className="detail-feature-label">Наличност</p>
                  <p className="detail-feature-value">Свободен</p>
                </div>
              </div>
            </div>
          </div>

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
                <input 
                  type="tel" 
                  className="booking-input" 
                  placeholder="+359 88 888 8888" 
                />
              </div>
              <button type="submit" className="booking-btn">
                Запитване за имота
              </button>
            </form>

            <p className="booking-info">
              Ще се свържем с вас до 24 часа
            </p>

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

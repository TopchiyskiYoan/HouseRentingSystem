import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

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

export default function HomePage() {
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/House/All')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        setHouses(Array.isArray(data) ? data : [])
        setError(null)
      } catch (e) {
        if (!cancelled) {
          setError(e?.message ?? 'Грешка при зареждане')
          setHouses([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredHouses = useMemo(() => {
    if (!searchQuery.trim()) return houses
    const query = searchQuery.toLowerCase()
    return houses.filter(
      (h) =>
        h.title?.toLowerCase().includes(query) ||
        h.address?.toLowerCase().includes(query)
    )
  }, [houses, searchQuery])

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Актуални обяви
          </div>
          <h1 className="hero-title">Намерете перфектния дом под наем</h1>
          <p className="hero-subtitle">
            Разгледайте стотици верифицирани обяви за жилища под наем в цялата страна. 
            Бързо, лесно и сигурно.
          </p>
        </div>
      </section>

      <section className="listings-section">
        <div className="container">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Търсете по град, квартал или заглавие..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="results-count">
              {loading ? (
                'Зареждане...'
              ) : (
                <>
                  <strong>{filteredHouses.length}</strong> намерени обяви
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p className="loading-text">Зареждане на обявите...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-text">Грешка: {error}</p>
            </div>
          ) : filteredHouses.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path d="M9 22V12h6v10" />
              </svg>
              <h3 className="empty-state-title">Няма намерени обяви</h3>
              <p className="empty-state-text">Опитайте с друго търсене</p>
            </div>
          ) : (
            <div className="listings-grid">
              {filteredHouses.map((house) => (
                <PropertyCard key={house.id} house={house} kindLabels={kindLabels} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function PropertyCard({ house, kindLabels }) {
  return (
    <article className="property-card">
      <Link to={`/property/${house.id}`} className="property-card-link">
        <div className="property-image-wrapper">
          <img
            src={house.imageUrl}
            alt={house.title}
            className="property-image"
            loading="lazy"
          />
          <span className="property-badge">
            {kindLabels[house.kind] ?? `Тип ${house.kind}`}
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
                <path d="M2 4v16" />
                <path d="M2 8h18a2 2 0 012 2v10" />
                <path d="M2 17h20" />
                <path d="M6 8v9" />
              </svg>
              {kindLabels[house.kind] ?? 'N/A'}
            </span>
            <span className="property-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 8h20" />
              </svg>
              Обзаведен
            </span>
          </div>
          <div className="property-footer">
            <p className="property-price">
              {Number(house.pricePerMonth).toLocaleString('bg-BG')} лв.
              <span>/месец</span>
            </p>
            <span className="property-cta">Виж детайли</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

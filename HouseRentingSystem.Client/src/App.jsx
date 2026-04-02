import { useEffect, useMemo, useState } from 'react'
import './App.css'

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

export default function App() {
  const [houses, setHouses] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/House/All')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        setHouses(Array.isArray(data) ? data : [])
        setSelectedId(data?.[0]?.id ?? null)
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

  const selected = useMemo(
    () => houses.find((h) => h.id === selectedId) ?? null,
    [houses, selectedId],
  )

  return (
    <div className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">House Renting System</p>
          <h1 className="title">Обяви под наем</h1>
          <p className="lede">
            Данните идват от API; при празна база се пълнят от{' '}
            <code>SeedData/houses.json</code>.
          </p>
        </div>
        <div className="heroMeta">
          {loading ? (
            <span className="pill">Зареждане…</span>
          ) : (
            <span className="pill">{houses.length} обяви</span>
          )}
        </div>
      </header>

      {error ? <div className="banner">{error}</div> : null}

      <main className="layout">
        <section className="grid" aria-label="Списък обяви">
          {houses.map((h) => (
            <article
              key={h.id}
              className={`card ${h.id === selectedId ? 'card--active' : ''}`}
            >
              <button
                type="button"
                className="cardHit"
                onClick={() => setSelectedId(h.id)}
              >
                <div className="cardImgWrap">
                  <img
                    className="cardImg"
                    src={h.imageUrl}
                    alt=""
                    loading="lazy"
                  />
                  <span className="kindBadge">
                    {kindLabels[h.kind] ?? `Тип ${h.kind}`}
                  </span>
                </div>
                <div className="cardBody">
                  <h2 className="cardTitle">{h.title}</h2>
                  <p className="cardAddr">{h.address}</p>
                  <p className="cardPrice">
                    {Number(h.pricePerMonth).toLocaleString('bg-BG')} лв. / месец
                  </p>
                </div>
              </button>
            </article>
          ))}
        </section>

        <aside className="detail" aria-label="Детайли">
          {selected ? (
            <>
              <div className="detailHero">
                <img
                  className="detailImg"
                  src={selected.imageUrl}
                  alt=""
                />
                <div className="detailOverlay">
                  <span className="kindBadge kindBadge--lg">
                    {kindLabels[selected.kind] ?? `Тип ${selected.kind}`}
                  </span>
                  <h2 className="detailTitle">{selected.title}</h2>
                  <p className="detailAddr">{selected.address}</p>
                </div>
              </div>
              <div className="detailBody">
                <p className="detailPrice">
                  {Number(selected.pricePerMonth).toLocaleString('bg-BG')} лв. / месец
                </p>
                <p className="detailDesc">{selected.description}</p>
              </div>
            </>
          ) : (
            <div className="detailEmpty">
              {loading ? 'Зареждане…' : 'Няма избрана обява.'}
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}

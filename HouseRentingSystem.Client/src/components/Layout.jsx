import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path d="M9 22V12h6v10" />
              </svg>
            </div>
            <span>HomeRent</span>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Обяви</Link>
            <a href="#" className="nav-link">За нас</a>
            <a href="#" className="nav-link">Контакти</a>
            <button className="nav-btn">Вход</button>
          </nav>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
      
      <footer className="footer">
        <div className="container footer-inner">
          <p className="footer-text">2026 HomeRent. Всички права запазени.</p>
          <div className="footer-links">
            <a href="#" className="footer-link">Условия за ползване</a>
            <a href="#" className="footer-link">Поверителност</a>
            <a href="#" className="footer-link">Помощ</a>
          </div>
        </div>
      </footer>
    </>
  )
}

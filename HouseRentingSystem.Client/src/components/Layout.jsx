import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'

export default function Layout() {
  const { isAuthenticated, username, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const navigate = useNavigate()

  function handleLoginSuccess() {
    setShowLogin(false)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

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

            {isAuthenticated && (
              <>
                <Link to="/my-listings" className="nav-link">Мои обяви</Link>
                <Link to="/create" className="nav-link">+ Добави обява</Link>
              </>
            )}

            {isAuthenticated ? (
              <>
                <div className="nav-user">
                  <div className="nav-user-avatar">
                    {username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="nav-user-name">{username}</span>
                </div>
                <button className="nav-btn nav-btn--logout" onClick={handleLogout}>
                  Изход
                </button>
              </>
            ) : (
              <button className="nav-btn" onClick={() => setShowLogin(true)}>
                Вход
              </button>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                </div>
                <span className="footer-logo-name">HomeRent</span>
              </div>
              <p className="footer-tagline">Намери своя дом. Бързо и лесно.</p>
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">Условия за ползване</a>
              <a href="#" className="footer-link">Поверителност</a>
              <a href="#" className="footer-link">Помощ</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-text">© 2026 HomeRent. Всички права запазени.</p>
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
}

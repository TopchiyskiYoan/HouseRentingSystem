import page from 'page'
import { html, render as litRender } from 'lit-html'
import { loginView } from './views/loginView.js'
import { registerView } from './views/registerView.js'

const TOKEN_KEY = 'jwt_token'

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function isTokenValid(token) {
  const payload = parseJwt(token)
  if (!payload) return false
  if (typeof payload.exp !== 'number') return true
  return payload.exp * 1000 > Date.now()
}

const auth = {
  token: null,
  get isAuthenticated() {
    return !!this.token
  },
  get payload() {
    return this.token ? parseJwt(this.token) : null
  },
  get username() {
    const p = this.payload
    return p?.unique_name ?? p?.name ?? p?.email ?? null
  },
  init() {
    const stored = localStorage.getItem(TOKEN_KEY)
    this.token = stored && isTokenValid(stored) ? stored : null
    if (stored && !this.token) localStorage.removeItem(TOKEN_KEY)
  },
  login(token) {
    localStorage.setItem(TOKEN_KEY, token)
    this.token = token
    appRender()
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY)
    this.token = null
    appRender()
  },
}

const root = document.getElementById('app')
let currentView = () => html``

function onLink(e) {
  const a = e?.currentTarget
  if (!a || a.tagName !== 'A') return
  const href = a.getAttribute('href')
  if (!href || href.startsWith('http')) return
  e.preventDefault()
  page.show(href)
}

function viewCtx() {
  return {
    auth,
    page,
    onLink,
    render: appRender,
  }
}

function layout(content) {
  return html`
    <header class="header">
      <div class="container header-inner">
        <a class="brand" href="/" @click=${onLink}>
          <span class="brand-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path d="M9 22V12h6v10"></path>
            </svg>
          </span>
          <span>HomeRent</span>
        </a>

        <nav class="nav">
          <a class="nav-link" href="/" @click=${onLink}>Начало</a>

          ${auth.isAuthenticated
            ? html`
                <span class="nav-user" title="Входнат потребител">
                  <span class="avatar">${(auth.username?.charAt(0) || '?').toUpperCase()}</span>
                  <span>${auth.username || 'Потребител'}</span>
                </span>
                <a class="btn btn-danger" href="/logout" @click=${onLink}>Изход</a>
              `
            : html`
                <a class="btn" href="/login" @click=${onLink}>Вход</a>
                <a class="btn btn-primary" href="/register" @click=${onLink}>Регистрация</a>
              `}
        </nav>
      </div>
    </header>

    <main>
      ${content}
    </main>

    <footer class="footer">
      <div class="container">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
          <span>© 2026 HomeRent (Lit)</span>
          <span style="opacity:0.8;">Auth demo, подобно на .client</span>
        </div>
      </div>
    </footer>
  `
}

function homeView() {
  const tokenPreview = auth.token ? `${auth.token.slice(0, 18)}…${auth.token.slice(-10)}` : '—'
  const payload = auth.payload

  return html`
    <div class="container">
      <section class="card">
        <div class="hero">
          <h1 class="hero-title">Начало</h1>
          <p class="hero-sub">
            Това е Lit SPA, което имплементира login/register + JWT (като .client).
          </p>
        </div>
        <div class="card-inner">
          <div class="grid">
            <div class="card" style="box-shadow:none; background:rgba(255,255,255,0.03);">
              <div class="card-inner">
                <p class="help" style="margin:0 0 10px;">
                  Статус: <strong>${auth.isAuthenticated ? 'Влязъл' : 'Не е влязъл'}</strong>
                </p>
                <p class="help" style="margin:0 0 10px;">
                  Token (preview): <code>${tokenPreview}</code>
                </p>
                <div class="row">
                  ${auth.isAuthenticated
                    ? html`<a class="btn btn-danger" href="/logout" @click=${onLink}>Изход</a>`
                    : html`
                        <a class="btn" href="/login" @click=${onLink}>Вход</a>
                        <a class="btn btn-primary" href="/register" @click=${onLink}>Регистрация</a>
                      `}
                </div>
              </div>
            </div>

            <div class="card" style="box-shadow:none; background:rgba(255,255,255,0.03);">
              <div class="card-inner">
                <p class="help" style="margin:0 0 10px;"><strong>JWT payload</strong></p>
                <pre style="
                  margin:0;
                  padding:12px;
                  border-radius:12px;
                  border:1px solid rgba(255,255,255,0.10);
                  background: rgba(11,16,32,0.35);
                  overflow:auto;
                  max-height: 280px;
                ">${payload ? JSON.stringify(payload, null, 2) : '—'}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
}

function setView(viewFn) {
  currentView = viewFn
  appRender()
}

function appRender() {
  litRender(layout(currentView(viewCtx())), root)
}

auth.init()

page('/', () => setView(() => homeView()))

page('/login', () => {
  if (auth.isAuthenticated) return page.redirect('/')
  setView((ctx) => loginView(ctx))
})

page('/register', () => {
  if (auth.isAuthenticated) return page.redirect('/')
  setView((ctx) => registerView(ctx))
})

page('/logout', () => {
  auth.logout()
  page.redirect('/')
})

page('*', () => page.redirect('/'))
page()

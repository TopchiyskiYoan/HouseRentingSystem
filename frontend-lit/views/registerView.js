import { html } from 'lit-html'
import { register } from '../api/authApi.js'

const state = {
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  error: null,
  loading: false,
}

export function registerView(ctx) {
  async function onSubmit(e) {
    e.preventDefault()
    state.error = null

    const email = state.email.trim()
    if (!email) {
      state.error = 'Имейлът е задължителен.'
      ctx.render()
      return
    }

    if (state.password.length < 6) {
      state.error = 'Паролата трябва да е поне 6 символа.'
      ctx.render()
      return
    }

    if (state.password !== state.confirmPassword) {
      state.error = 'Паролите не съвпадат.'
      ctx.render()
      return
    }

    state.loading = true
    ctx.render()

    try {
      const username = state.username.trim() || email.split('@')[0]
      const { token } = await register({ email, password: state.password, username })
      if (token) {
        ctx.auth.login(token)
        ctx.page.redirect('/')
      } else {
        ctx.page.redirect('/login')
      }
    } catch (err) {
      state.error = err?.message || 'Неуспешна регистрация.'
    } finally {
      state.loading = false
      ctx.render()
    }
  }

  return html`
    <div class="container">
      <div class="grid">
        <section class="card">
          <div class="hero">
            <h1 class="hero-title">Регистрация</h1>
            <p class="hero-sub">Създай акаунт и започни да публикуваш обяви.</p>
          </div>
          <div class="card-inner">
            ${state.error ? html`<div class="error" role="alert">${state.error}</div>` : null}

            <form class="form" @submit=${onSubmit} novalidate>
              <div class="field">
                <label class="label" for="email">Имейл</label>
                <input
                  id="email"
                  class="input"
                  type="email"
                  autocomplete="email"
                  required
                  .value=${state.email}
                  @input=${(e) => { state.email = e.target.value; }}
                  placeholder="ivan@example.com"
                />
              </div>

              <div class="field">
                <label class="label" for="username">Потребителско име</label>
                <input
                  id="username"
                  class="input"
                  type="text"
                  autocomplete="username"
                  .value=${state.username}
                  @input=${(e) => { state.username = e.target.value; }}
                  placeholder="ivan"
                />
                <p class="help" style="margin:0;">Ако го оставиш празно, ще използваме частта преди @ от имейла.</p>
              </div>

              <div class="field">
                <label class="label" for="password">Парола</label>
                <input
                  id="password"
                  class="input"
                  type="password"
                  autocomplete="new-password"
                  required
                  .value=${state.password}
                  @input=${(e) => { state.password = e.target.value; }}
                  placeholder="••••••••"
                />
              </div>

              <div class="field">
                <label class="label" for="confirmPassword">Потвърди парола</label>
                <input
                  id="confirmPassword"
                  class="input"
                  type="password"
                  autocomplete="new-password"
                  required
                  .value=${state.confirmPassword}
                  @input=${(e) => { state.confirmPassword = e.target.value; }}
                  placeholder="••••••••"
                />
              </div>

              <div class="row">
                <button class="btn btn-primary" type="submit" ?disabled=${state.loading}>
                  ${state.loading ? 'Създаване…' : 'Регистрация'}
                </button>
                <a class="nav-link" href="/login" @click=${(e) => ctx.onLink(e)}>
                  Имаш профил? Вход
                </a>
              </div>
            </form>
          </div>
        </section>

        <aside class="card">
          <div class="hero">
            <h2 class="hero-title">Как работи</h2>
            <p class="hero-sub">След регистрация ще те пренасочи към вход (или ще те логне автоматично ако API-то връща token).</p>
          </div>
          <div class="card-inner">
            <p class="help">
              Бекендът ти създава акаунт с <code>Username</code>, затова формата включва потребителско име.
            </p>
          </div>
        </aside>
      </div>
    </div>
  `
}

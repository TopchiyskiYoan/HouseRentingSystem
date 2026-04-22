import { html } from 'lit-html'
import { login } from '../api/authApi.js'

const state = {
  email: '',
  password: '',
  error: null,
  loading: false,
}

export function loginView(ctx) {
  async function onSubmit(e) {
    e.preventDefault()
    state.error = null
    state.loading = true
    ctx.render()

    try {
      const { token } = await login(state.email.trim(), state.password)
      ctx.auth.login(token)
      ctx.page.redirect('/')
    } catch (err) {
      state.error = err?.message || 'Неуспешен вход.'
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
            <h1 class="hero-title">Вход</h1>
            <p class="hero-sub">Влез в акаунта си, за да управляваш обявите.</p>
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
                <label class="label" for="password">Парола</label>
                <input
                  id="password"
                  class="input"
                  type="password"
                  autocomplete="current-password"
                  required
                  .value=${state.password}
                  @input=${(e) => { state.password = e.target.value; }}
                  placeholder="••••••••"
                />
              </div>

              <div class="row">
                <button class="btn btn-primary" type="submit" ?disabled=${state.loading}>
                  ${state.loading ? 'Влизане…' : 'Вход'}
                </button>
                <a class="nav-link" href="/register" @click=${(e) => ctx.onLink(e)}>
                  Нямаш профил? Регистрация
                </a>
              </div>
            </form>
          </div>
        </section>

        <aside class="card">
          <div class="hero">
            <h2 class="hero-title">Съвет</h2>
            <p class="hero-sub">Ако API-то ти е на друг порт/host, задай <code>window.__API_BASE_URL__</code> в DevTools Console.</p>
          </div>
          <div class="card-inner">
            <p class="help">
              Token ключът е <code>jwt_token</code> (като в .client). След успешен вход ще видиш състоянието на началната страница.
            </p>
          </div>
        </aside>
      </div>
    </div>
  `
}

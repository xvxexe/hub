import { useState } from 'react'
import { roles } from '../../lib/roles'

export function LoginMock({ selectedRole, onRoleSelect, onLogin, loginError, loginLoading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const activeRole = roles.find((role) => role.id === selectedRole)

  function handleSubmit(event) {
    event.preventDefault()
    onLogin({ email, password })
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <p className="eyebrow">Area privata sicura</p>
        <h1>Accedi all'area interna</h1>
        <p>
          Login reale con Supabase Auth. Il ruolo viene letto dal profilo utente e determina menu,
          permessi e pagine disponibili.
        </p>

        <form className="mock-form login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              autoComplete="email"
              inputMode="email"
              placeholder="nome@europaservice.it"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              placeholder="Password account"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {loginError ? <p className="role-description login-error">{loginError}</p> : null}
          <button className="button button-primary" disabled={loginLoading} type="submit">
            {loginLoading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="mock-form login-form login-fallback-panel">
          <label>
            Anteprima ruolo locale
            <select value={selectedRole} onChange={(event) => onRoleSelect(event.target.value)}>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          {activeRole ? <p className="role-description">{activeRole.description}</p> : null}
          <button className="button button-secondary" type="button" onClick={() => onLogin()}>
            Entra in modalità locale
          </button>
        </div>
      </div>
    </section>
  )
}

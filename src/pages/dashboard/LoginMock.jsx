import { useMemo, useState } from 'react'
import { roles } from '../../lib/roles'
import { completeInviteWithPassword, readInviteSessionFromUrl } from '../../lib/supabaseClient'

export function LoginMock({ selectedRole, onRoleSelect, onLogin, loginError, loginLoading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [invitePasswordConfirm, setInvitePasswordConfirm] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const inviteSession = useMemo(() => readInviteSessionFromUrl(), [])
  const activeRole = roles.find((role) => role.id === selectedRole)

  function handleSubmit(event) {
    event.preventDefault()
    onLogin({ email, password })
  }

  async function handleInviteSubmit(event) {
    event.preventDefault()
    setInviteError('')

    if (!inviteSession?.isSupabaseInvite) {
      setInviteError('Questo link invito non contiene ancora i token Supabase. Crea un nuovo invito e usa il link generato da Supabase.')
      return
    }

    if (invitePassword.length < 8) {
      setInviteError('La password deve avere almeno 8 caratteri.')
      return
    }

    if (invitePassword !== invitePasswordConfirm) {
      setInviteError('Le password non coincidono.')
      return
    }

    setInviteLoading(true)
    const result = await completeInviteWithPassword({
      accessToken: inviteSession.accessToken,
      refreshToken: inviteSession.refreshToken,
      password: invitePassword,
    })
    setInviteLoading(false)

    if (result.error) {
      setInviteError(result.error.message)
      return
    }

    window.location.assign('#/dashboard')
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <p className="eyebrow">Area privata sicura</p>
        <h1>{inviteSession ? 'Completa invito' : "Accedi all'area interna"}</h1>
        <p>
          {inviteSession
            ? 'Imposta la password del tuo account EuropaService per attivare l’accesso all’area privata.'
            : 'Login reale con Supabase Auth. Il ruolo viene letto dal profilo utente e determina menu, permessi e pagine disponibili.'}
        </p>

        {inviteSession ? (
          <form className="mock-form login-form" onSubmit={handleInviteSubmit}>
            <label>
              Email invito
              <input
                autoComplete="email"
                inputMode="email"
                readOnly
                type="email"
                value={inviteSession.email ?? 'Email letta da Supabase'}
              />
            </label>
            <label>
              Nuova password
              <input
                autoComplete="new-password"
                placeholder="Minimo 8 caratteri"
                required
                type="password"
                value={invitePassword}
                onChange={(event) => setInvitePassword(event.target.value)}
              />
            </label>
            <label>
              Conferma password
              <input
                autoComplete="new-password"
                placeholder="Ripeti password"
                required
                type="password"
                value={invitePasswordConfirm}
                onChange={(event) => setInvitePasswordConfirm(event.target.value)}
              />
            </label>
            {inviteError ? <p className="role-description login-error">{inviteError}</p> : null}
            <button className="button button-primary" disabled={inviteLoading} type="submit">
              {inviteLoading ? 'Attivazione in corso...' : 'Attiva account'}
            </button>
            {!inviteSession.isSupabaseInvite ? (
              <p className="role-description">
                Questo è solo un link informativo. Per attivare davvero l’account usa il link Supabase copiato dalla sezione Impostazioni.
              </p>
            ) : null}
          </form>
        ) : (
          <>
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
          </>
        )}
      </div>
    </section>
  )
}

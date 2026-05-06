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
  const inviteSession = useMemo(() => {
    try {
      return readInviteSessionFromUrl()
    } catch (error) {
      console.error('Errore lettura link invito', error)
      return null
    }
  }, [])
  const activeRole = roles.find((role) => role.id === selectedRole)
  const isSupabaseInvite = Boolean(inviteSession?.isSupabaseInvite)
  const isLocalInvite = Boolean(inviteSession?.isLocalInvite && !inviteSession?.isSupabaseInvite)

  function handleSubmit(event) {
    event.preventDefault()
    onLogin({ email, password })
  }

  async function handleInviteSubmit(event) {
    event.preventDefault()
    setInviteError('')

    if (!isSupabaseInvite) {
      setInviteError('Questo link non contiene i token Supabase reali. Apri dalla sezione Impostazioni il link segnato come “link reale”.')
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
        <h1>{isSupabaseInvite ? 'Completa invito' : "Accedi all'area interna"}</h1>
        <p>
          {isSupabaseInvite
            ? 'Imposta la password del tuo account EuropaService per attivare l’accesso all’area privata.'
            : 'Login reale con Supabase Auth. Il ruolo viene letto dal profilo utente e determina menu, permessi e pagine disponibili.'}
        </p>

        {isLocalInvite ? (
          <div className="mock-form login-form login-fallback-panel">
            <p className="role-description login-error">
              Questo è un link invito locale/vecchio, non il link Supabase reale. Per sicurezza non può attivare l’account.
            </p>
            <label>
              Email rilevata
              <input readOnly type="text" value={inviteSession.email ?? 'Email non leggibile'} />
            </label>
            <p className="role-description">
              Torna in Impostazioni → Inviti / utenti creati, premi “Copia” o “Apri” sulla riga dell’utente e usa il link reale Supabase.
            </p>
            <a className="button button-secondary" href="#/dashboard/login">Vai al login normale</a>
          </div>
        ) : isSupabaseInvite ? (
          <form className="mock-form login-form" onSubmit={handleInviteSubmit}>
            <label>
              Email invito
              <input
                autoComplete="email"
                inputMode="email"
                readOnly
                type="text"
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

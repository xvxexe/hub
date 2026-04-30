import { roles } from '../../data/mockData'

export function LoginMock({ selectedRole, onRoleSelect, onLogin }) {
  const activeRole = roles.find((role) => role.id === selectedRole)

  return (
    <section className="login-page">
      <div className="login-card">
        <p className="eyebrow">Login mock</p>
        <h1>Accedi all'area interna</h1>
        <p>
          Accesso dimostrativo per provare menu e viste in base al ruolo. Non usa backend,
          Supabase o autenticazione reale.
        </p>

        <form className="mock-form login-form">
          <label>
            Ruolo
            <select value={selectedRole} onChange={(event) => onRoleSelect(event.target.value)}>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          {activeRole ? <p className="role-description">{activeRole.description}</p> : null}
          <button className="button button-primary" type="button" onClick={onLogin}>
            Entra con ruolo mock
          </button>
        </form>
      </div>
    </section>
  )
}

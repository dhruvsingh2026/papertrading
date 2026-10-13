import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Signup() {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const signup = useAuthStore((s) => s.signup)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (session) return <Navigate to="/app" replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const err = signup(name, email, password)
    setError(err)
    if (!err) navigate('/app')
  }

  return (
    <div className="auth-shell">
      <Link to="/" className="auth-brand brand">
        <span className="brand-mark" aria-hidden />
        <div>
          <div className="brand-name">Fairbook</div>
          <div className="brand-tag">Start practicing</div>
        </div>
      </Link>

      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Sign up</h1>
        <p className="auth-copy">
          Create a free demo account. Your wallet starts at ₹0 — add money next.
        </p>

        <label className="field">
          <span>Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
          />
        </label>

        {error && <p className="ticket-error">{error}</p>}

        <button type="submit" className="submit buy">
          Create account
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
        <p className="disclaimer">
          Demo only. Passwords stay in localStorage on this device — do not reuse real passwords.
        </p>
      </form>
    </div>
  )
}

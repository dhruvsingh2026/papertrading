import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (session) return <Navigate to="/app" replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const err = login(email, password)
    setError(err)
    if (!err) navigate('/app')
  }

  return (
    <div className="auth-shell">
      <Link to="/" className="auth-brand brand">
        <span className="brand-mark" aria-hidden />
        <div>
          <div className="brand-name">Fairbook</div>
          <div className="brand-tag">Welcome back</div>
        </div>
      </Link>

      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Log in</h1>
        <p className="auth-copy">Enter your demo account to open the trading desk.</p>

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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="ticket-error">{error}</p>}

        <button type="submit" className="submit buy">
          Log in
        </button>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
        <p className="disclaimer">Demo auth is stored only in this browser — not a real bank login.</p>
      </form>
    </div>
  )
}

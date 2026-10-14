import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Signup() {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const signup = useAuthStore((s) => s.signup)
  const instantDemo = useAuthStore((s) => s.instantDemo)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/app" replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    setTimeout(() => {
      const err = signup(name, email, password)
      setLoading(false)
      setError(err)
      if (!err) navigate('/app')
    }, 200)
  }

  const handleInstantDemo = () => {
    instantDemo()
    navigate('/app')
  }

  return (
    <div className="auth-shell">
      <Link to="/" className="auth-brand brand">
        <span className="brand-mark">F</span>
        <span className="brand-name">FAIRBOOK</span>
      </Link>

      <form className="auth-card" onSubmit={onSubmit}>
        <h1>CREATE DEMO ACCOUNT</h1>
        <p className="auth-copy">
          Start paper trading in seconds. Your simulated wallet starts with ₹0 — top up virtual funds
          whenever you are ready.
        </p>

        <label className="field">
          <span>Full Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Aarav Sharma"
            required
          />
        </label>

        <label className="field">
          <span>Demo Email</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="trader@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Choose Password (min 4 characters)</span>
          <div className="input-password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {error && <p className="ticket-error">{error}</p>}

        <button type="submit" className="btn primary full large" disabled={loading}>
          {loading ? 'Creating Desk…' : 'Start Paper Trading'}
          <ArrowRight size={16} />
        </button>

        <div style={{ textAlign: 'center', margin: '0.25rem 0' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>— or jump straight in —</span>
        </div>

        <button
          type="button"
          className="btn ghost full"
          onClick={handleInstantDemo}
        >
          <ShieldCheck size={16} className="up" />
          One-Click Instant Demo Account
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <p className="disclaimer">
          100% demo sandbox. Passwords are saved in this browser’s localStorage only. Never enter real banking credentials.
        </p>
      </form>
    </div>
  )
}

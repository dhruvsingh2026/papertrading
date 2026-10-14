import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const login = useAuthStore((s) => s.login)
  const instantDemo = useAuthStore((s) => s.instantDemo)

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
      const err = login(email, password)
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
        <h1>WELCOME BACK</h1>
        <p className="auth-copy">
          Enter your demo credentials to access your simulated trading desk and virtual portfolio.
        </p>

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
          <span>Password</span>
          <div className="input-password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
          {loading ? 'Opening Desk…' : 'Log in to Demo Desk'}
          <ArrowRight size={16} />
        </button>

        <div style={{ textAlign: 'center', margin: '0.25rem 0' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>— or quick exploration —</span>
        </div>

        <button
          type="button"
          className="btn ghost full"
          onClick={handleInstantDemo}
        >
          <ShieldCheck size={16} className="up" />
          Continue as Instant Demo Trader
        </button>

        <p className="auth-switch">
          Need a fresh account? <Link to="/signup">Sign up free</Link>
        </p>

        <p className="disclaimer">
          Demo authentication is preserved locally on this device. Do not use real financial passwords.
        </p>
      </form>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const STATS = [
  { value: '₹ first', label: 'Prices in Indian rupees' },
  { value: 'Live', label: 'Crypto & stock candles' },
  { value: '0 risk', label: 'Demo money only' },
]

const COINS = [
  { name: 'Bitcoin', symbol: 'BTC', price: '₹72,40,000', pct: '+2.4%', up: true },
  { name: 'Ethereum', symbol: 'ETH', price: '₹2,85,000', pct: '+1.1%', up: true },
  { name: 'Solana', symbol: 'SOL', price: '₹12,480', pct: '−0.8%', up: false },
  { name: 'Apple', symbol: 'AAPL', price: '₹18,920', pct: '+0.6%', up: true },
]

const FEATURES = [
  {
    icon: Wallet,
    title: 'Wallet',
    text: 'Add demo money with a UPI-style checkout, then buy and sell on paper.',
  },
  {
    icon: Zap,
    title: 'Speed',
    text: 'Open the desk fast — charts, watchlist, and ticket in one quiet screen.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety',
    text: 'No real bank charge. Practice the habit before you risk capital.',
  },
]

const FAQS = [
  {
    q: 'Is this real trading?',
    a: 'No. Fairbook is a paper-trading practice desk. Demo payments never charge your UPI or card.',
  },
  {
    q: 'Do I need KYC or a bank account?',
    a: 'Not for Fairbook. Sign up locally in your browser, fund a demo wallet, and practice freely.',
  },
  {
    q: 'Why rupees by default?',
    a: 'So Indian users can read prices the way they already think — toggle to USD anytime in the desk.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Account and wallet live in this browser’s local storage. Clear site data and the demo account resets.',
  },
]

function Spark({ up }: { up: boolean }) {
  const points = up
    ? '0,28 12,22 24,24 36,14 48,16 60,8 72,10 84,4'
    : '0,8 12,12 24,10 36,18 48,16 60,22 72,20 84,28'
  return (
    <svg className="coin-spark" viewBox="0 0 84 32" aria-hidden>
      <polyline
        fill="none"
        stroke={up ? '#2DB87A' : '#E85D6C'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function DeskMock() {
  return (
    <div className="desk-mock" aria-hidden>
      <div className="desk-mock-chrome">
        <span />
        <span />
        <span />
        <em>Fairbook desk</em>
      </div>
      <div className="desk-mock-body">
        <aside className="desk-mock-side">
          {['BTC', 'ETH', 'SOL', 'AAPL', 'NVDA'].map((s, i) => (
            <div key={s} className={i === 0 ? 'on' : undefined}>
              <b>{s}</b>
              <small className={i % 2 === 0 ? 'up' : 'down'}>
                {i % 2 === 0 ? '+1.2%' : '−0.4%'}
              </small>
            </div>
          ))}
        </aside>
        <div className="desk-mock-chart">
          <div className="desk-mock-ohlc">
            <span>O 72.1L</span>
            <span>H 73.0L</span>
            <span>L 71.4L</span>
            <span>C 72.4L</span>
          </div>
          <svg viewBox="0 0 420 180" preserveAspectRatio="none">
            <path
              d="M0 140 C 40 130, 70 120, 100 100 S 160 70, 200 80 S 280 110, 320 60 S 380 40, 420 30"
              fill="none"
              stroke="#F0B90B"
              strokeWidth="2.5"
            />
            {[40, 90, 140, 190, 240, 290, 340].map((x, i) => (
              <rect
                key={x}
                x={x}
                y={50 + (i % 3) * 18}
                width="14"
                height={40 + (i % 4) * 10}
                rx="2"
                fill={i % 2 === 0 ? '#2DB87A' : '#E85D6C'}
                opacity="0.75"
              />
            ))}
          </svg>
        </div>
        <aside className="desk-mock-ticket">
          <b>Paper ticket</b>
          <span>BTC · Buy</span>
          <div className="desk-mock-btn">Pay & buy</div>
        </aside>
      </div>
      <div className="float-chip chip-a">
        <IndianRupee size={14} /> INR
      </div>
      <div className="float-chip chip-b">
        <Wallet size={14} /> Wallet
      </div>
      <div className="float-chip chip-c">
        <Sparkles size={14} /> Demo UPI
      </div>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={open ? 'faq-item open' : 'faq-item'}>
      <button type="button" onClick={() => setOpen((v) => !v)}>
        <span>{q}</span>
        <ChevronDown size={18} strokeWidth={1.75} />
      </button>
      {open && <p>{a}</p>}
    </div>
  )
}

export default function Landing() {
  const session = useAuthStore((s) => s.session)
  const primaryTo = session ? '/app' : '/signup'

  return (
    <div className="marketing">
      <header className="marketing-nav">
        <Link to="/" className="brand marketing-brand">
          <span className="brand-mark" aria-hidden />
          <span className="brand-name">Fairbook</span>
        </Link>
        <nav className="marketing-nav-actions">
          <a className="nav-quiet" href="#markets">
            Markets
          </a>
          <a className="nav-quiet" href="#why">
            Why Fairbook
          </a>
          <a className="nav-quiet" href="#faq">
            FAQ
          </a>
          {session ? (
            <Link className="btn primary" to="/app">
              Open desk
            </Link>
          ) : (
            <>
              <Link className="btn ghost" to="/login">
                Log in
              </Link>
              <Link className="btn primary" to="/signup">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="lp-hero">
        <div className="lp-hero-copy">
          <p className="hero-kicker">Clear markets. Quiet desk.</p>
          <h1>
            This is a <em>calm</em> paper-trading platform.
          </h1>
          <p className="lede">
            Practice buying and selling with live charts, a ₹ wallet, and a demo payment flow —
            built for India, without risking a rupee.
          </p>
          <div className="hero-cta">
            <Link className="btn primary large" to={primaryTo}>
              {session ? 'Continue to desk' : 'Open account free'}
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link className="btn ghost large" to="/login">
              Log in
            </Link>
          </div>
          <div className="lp-stats">
            {STATS.map((s) => (
              <div key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-hero-visual">
          <DeskMock />
        </div>
      </section>

      <section className="lp-section" id="markets">
        <div className="lp-split">
          <div>
            <h2>
              Watch the move.
              <br />
              <em>Practice</em> the trade.
            </h2>
          </div>
          <p>
            Spot momentum on crypto and stocks, fund your demo wallet, and run the same buy/sell
            habit you’d use on a real desk — with zero settlement risk.
          </p>
        </div>

        <div className="coin-rail">
          {COINS.map((c) => (
            <article key={c.symbol} className="coin-card">
              <div className="coin-card-top">
                <div>
                  <b>{c.name}</b>
                  <small>{c.symbol}</small>
                </div>
                {c.up ? (
                  <ArrowUpRight size={16} className="up" />
                ) : (
                  <ArrowDownRight size={16} className="down" />
                )}
              </div>
              <div className="coin-card-price mono">{c.price}</div>
              <div className="coin-card-foot">
                <Spark up={c.up} />
                <span className={c.up ? 'up mono' : 'down mono'}>{c.pct}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="feature-row" id="why">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <article key={f.title}>
                <Icon size={22} strokeWidth={1.6} />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="lp-section lp-infra">
        <div className="lp-split">
          <div>
            <h2>
              Trusted layout.
              <br />
              Quiet infrastructure.
            </h2>
            <p className="section-note">
              Symbols left, chart center, ticket right — the same mental map as a professional
              terminal, softened for learning.
            </p>
          </div>
          <ul className="infra-list">
            <li>Live candlesticks with OHLC + volume</li>
            <li>Per-user paper wallet after login</li>
            <li>Demo UPI / card / net banking checkout</li>
            <li>₹ / $ toggle with IST market pulse</li>
          </ul>
        </div>
        <DeskMock />
      </section>

      <section className="lp-cta">
        <div>
          <h2>
            Open your desk. <em>Instant.</em> No hassle.
          </h2>
          <p>Create a free demo account, add money, and place your first paper trade today.</p>
        </div>
        <div className="hero-cta">
          <Link className="btn primary large" to={primaryTo}>
            {session ? 'Back to desk' : 'Create free account'}
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <Link className="btn ghost large" to="/login">
            I have an account
          </Link>
        </div>
      </section>

      <section className="lp-section" id="faq">
        <div className="section-head">
          <h2>Frequently asked</h2>
          <p>Straight answers before you sign up.</p>
        </div>
        <div className="faq-list">
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <div className="brand">
            <span className="brand-mark" aria-hidden />
            <span className="brand-name">Fairbook</span>
          </div>
          <p>Clear markets. Quiet desk. Demo trading for India.</p>
        </div>
        <div className="lp-footer-cols">
          <div>
            <h4>Product</h4>
            <a href="#markets">Markets</a>
            <a href="#why">Wallet</a>
            <Link to="/signup">Sign up</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Log in</Link>
            <Link to="/app">Open desk</Link>
          </div>
          <div>
            <h4>Note</h4>
            <span>Not a broker</span>
            <span>Not financial advice</span>
            <span>Demo payments only</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CandlestickChart,
  ChevronDown,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const STATS = [
  { value: '₹ FIRST', label: 'Default INR display with live FX rates' },
  { value: 'LIVE FEEDS', label: 'Crypto & US equity candlestick charts' },
  { value: '0 RISK', label: 'Simulated paper trading sandbox' },
]

interface SampleCoin {
  name: string
  symbol: string
  priceInr: string
  pct: string
  up: boolean
  high: string
  low: string
}

const FEATURED_INSTRUMENTS: SampleCoin[] = [
  { name: 'Bitcoin', symbol: 'BTC', priceInr: '₹57,15,575', pct: '+2.85%', up: true, high: '₹58,40,000', low: '₹56,10,000' },
  { name: 'Ethereum', symbol: 'ETH', priceInr: '₹2,93,920', pct: '+1.45%', up: true, high: '₹2,98,000', low: '₹2,89,500' },
  { name: 'Solana', symbol: 'SOL', priceInr: '₹12,875', pct: '+5.20%', up: true, high: '₹13,200', low: '₹12,100' },
  { name: 'Apple Inc.', symbol: 'AAPL', priceInr: '₹19,250', pct: '+0.85%', up: true, high: '₹19,450', low: '₹19,050' },
  { name: 'NVIDIA Corp.', symbol: 'NVDA', priceInr: '₹11,640', pct: '−1.25%', up: false, high: '₹11,920', low: '₹11,480' },
]

const PILLARS = [
  {
    icon: CandlestickChart,
    title: 'REAL CANDLESTICK DYNAMICS',
    description: 'Learn to read OHLC candles, price action, and volume across multiple timeframes with industry-standard charting.',
  },
  {
    icon: Wallet,
    title: 'SIMULATED INR DEMO WALLET',
    description: 'Deposit virtual funds via a realistic demo UPI and card checkout. Practice the habit before putting hard-earned capital at risk.',
  },
  {
    icon: TrendingUp,
    title: 'AUTHORITATIVE LEDGER & COST BASIS',
    description: 'Every order updates your weighted average entry price, tracks unrealized P&L, and writes an immutable chronological ledger.',
  },
  {
    icon: ShieldCheck,
    title: 'CALM, NO-PRESSURE DESK',
    description: 'No gambling loops, countdown clocks, or aggressive push notifications. Built specifically for students and beginner investors.',
  },
]

const WORKFLOW = [
  {
    step: '01',
    title: 'EXPLORE INSTRUMENTS',
    desc: 'Browse trending cryptocurrencies and major US equities. Filter by gainers, losers, or curated watchlist.',
  },
  {
    step: '02',
    title: 'STUDY THE CHART',
    desc: 'Analyze multi-timeframe candles, volume bars, 24h ranges, and market capitalization before committing.',
  },
  {
    step: '03',
    title: 'SIMULATE THE ORDER',
    desc: 'Specify your exact units or cash budget. Test market buys and sells with realistic simulated payment confirmation.',
  },
  {
    step: '04',
    title: 'AUDIT YOUR LEDGER',
    desc: 'Track how your decisions impact portfolio equity, available cash, and realized gains without emotional distress.',
  },
]

const FAQS = [
  {
    q: 'Is Fairbook a licensed brokerage or real financial platform?',
    a: 'No. Fairbook is strictly an educational paper-trading simulator and learning environment. There is no real broker connection, no actual order routing, and zero financial settlement risk.',
  },
  {
    q: 'Will demo payments charge my UPI account, debit card, or net banking?',
    a: 'Never. The checkout flow is a pure simulated UI demonstration designed to help beginner traders understand how funding workflows operate. No banking credentials are ever transmitted or debited.',
  },
  {
    q: 'Why does Fairbook default to Indian Rupees (INR)?',
    a: 'Most young Indian investors think in rupees. Fairbook pulls live global market prices in USD and converts them dynamically using real-time ECB exchange rates. You can toggle between ₹ INR and $ USD with a single click.',
  },
  {
    q: 'Where is my account and trading history stored?',
    a: 'Everything is securely stored locally in your browser’s localStorage. Your virtual portfolio, positions, and ledger survive page refreshes, and can be fully reset whenever you wish to start fresh.',
  },
  {
    q: 'Can I upload custom stocks or test non-listed instruments?',
    a: 'Yes. Fairbook includes a custom instrument manager allowing you to enter custom symbols or import a CSV of assets to simulate specialized portfolios.',
  },
]

function InteractiveHeroPreview() {
  const [activeTab, setActiveTab] = useState('BTC')
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY')
  const [units, setUnits] = useState('0.05')

  const current = FEATURED_INSTRUMENTS.find((c) => c.symbol === activeTab) || FEATURED_INSTRUMENTS[0]
  const isUp = current.up

  return (
    <div className="desk-mock" role="region" aria-label="Interactive Trading Desk Preview">
      <div className="desk-mock-chrome">
        <span />
        <span />
        <span />
        <em>Fairbook Workspace · Simulated Trading Desk</em>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, background: '#16875d' }} />
          <span style={{ fontSize: '0.72rem', color: '#16875d', fontWeight: 600 }}>PAPER TRADING DEMO</span>
        </div>
      </div>

      <div className="desk-mock-body">
        {/* Instrument Selector Left */}
        <aside className="desk-mock-side">
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', padding: '0.2rem 0.4rem' }}>
            Watchlist
          </span>
          {FEATURED_INSTRUMENTS.map((inst) => (
            <div
              key={inst.symbol}
              className={inst.symbol === activeTab ? 'on' : undefined}
              onClick={() => setActiveTab(inst.symbol)}
              style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
            >
              <b>{inst.symbol}</b>
              <small className={inst.up ? 'up' : 'down'}>{inst.pct}</small>
            </div>
          ))}
        </aside>

        {/* Chart Viewport Center */}
        <div className="desk-mock-chart">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
            <div>
              <strong style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)' }}>{current.priceInr}</strong>
              <span className={`change-pill ${isUp ? 'up' : 'down'}`} style={{ marginLeft: '0.5rem', fontSize: '0.72rem' }}>
                {current.pct}
              </span>
            </div>
            <div className="desk-mock-ohlc">
              <span>H {current.high}</span>
              <span>L {current.low}</span>
            </div>
          </div>

          <svg viewBox="0 0 460 160" preserveAspectRatio="none" style={{ width: '100%', height: '140px', marginTop: '0.5rem' }}>
            {/* Grid Lines */}
            <line x1="0" y1="40" x2="460" y2="40" stroke="#E2E4E7" strokeDasharray="3 3" />
            <line x1="0" y1="80" x2="460" y2="80" stroke="#E2E4E7" strokeDasharray="3 3" />
            <line x1="0" y1="120" x2="460" y2="120" stroke="#E2E4E7" strokeDasharray="3 3" />

            {/* Stylized Candlesticks */}
            {[
              { x: 30, o: 100, c: 85, h: 75, l: 110, up: true },
              { x: 75, o: 85, c: 92, h: 78, l: 98, up: false },
              { x: 120, o: 92, c: 70, h: 65, l: 96, up: true },
              { x: 165, o: 70, c: 60, h: 52, l: 75, up: true },
              { x: 210, o: 60, c: 68, h: 55, l: 74, up: false },
              { x: 255, o: 68, c: 54, h: 48, l: 72, up: true },
              { x: 300, o: 54, c: 62, h: 50, l: 68, up: false },
              { x: 345, o: 62, c: 45, h: 38, l: 66, up: true },
              { x: 390, o: 45, c: 38, h: 32, l: 50, up: true },
              { x: 435, o: 38, c: 42, h: 34, l: 48, up: false },
            ].map((bar, i) => (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={bar.x + 8}
                  y1={bar.h}
                  x2={bar.x + 8}
                  y2={bar.l}
                  stroke={bar.up ? '#16875D' : '#C93C4B'}
                  strokeWidth="1.5"
                />
                {/* Body */}
                <rect
                  x={bar.x}
                  y={Math.min(bar.o, bar.c)}
                  width="16"
                  height={Math.max(4, Math.abs(bar.c - bar.o))}
                  rx="2"
                  fill={bar.up ? '#16875D' : '#C93C4B'}
                />
              </g>
            ))}
          </svg>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)', marginTop: 'auto' }}>
            <span>Available Paper Cash: <strong>₹83,500</strong></span>
            <span>Simulated Execution</span>
          </div>
        </div>

        {/* Order Ticket Right */}
        <aside className="desk-mock-ticket">
          <b>SIMULATED TICKET</b>
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface-2)', padding: '0.15rem', borderRadius: '4px' }}>
            <button
              type="button"
              onClick={() => setTradeAction('BUY')}
              style={{
                flex: 1,
                border: 0,
                background: tradeAction === 'BUY' ? 'var(--accent)' : 'transparent',
                color: tradeAction === 'BUY' ? 'var(--accent-ink)' : 'var(--secondary)',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '0.25rem',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setTradeAction('SELL')}
              style={{
                flex: 1,
                border: 0,
                background: tradeAction === 'SELL' ? 'var(--down)' : 'transparent',
                color: tradeAction === 'SELL' ? '#ffffff' : 'var(--secondary)',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '0.25rem',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              SELL
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem' }}>Quantity</span>
            <input
              className="mono"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              style={{ padding: '0.35rem 0.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--secondary)' }}>
            Est: <strong>{current.priceInr}</strong>
          </div>

          <Link
            to="/signup"
            className="desk-mock-btn"
            style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
          >
            {tradeAction} {activeTab}
          </Link>
        </aside>
      </div>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{q}</span>
        <ChevronDown size={18} strokeWidth={2} />
      </button>
      {open && <p>{a}</p>}
    </div>
  )
}

export default function Landing() {
  const session = useAuthStore((s) => s.session)
  const instantDemo = useAuthStore((s) => s.instantDemo)
  const navigate = useNavigate()

  const handleDemoAccess = () => {
    instantDemo()
    navigate('/app')
  }

  return (
    <div className="marketing">
      {/* 1. Header & Navigation following Top Bar Contract */}
      <header className="marketing-nav">
        <Link to="/" className="brand">
          <span className="brand-mark">F</span>
          <span className="brand-name">FAIRBOOK</span>
        </Link>

        <nav className="marketing-nav-actions" aria-label="Main Navigation">
          <a className="nav-quiet" href="#markets">
            Markets
          </a>
          <a className="nav-quiet" href="#workflow">
            How It Works
          </a>
          <a className="nav-quiet" href="#pillars">
            Why Fairbook
          </a>
          <a className="nav-quiet" href="#faq">
            FAQ
          </a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {session ? (
            <Link className="btn primary" to="/app">
              Open Trading Desk
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <button type="button" className="btn ghost" onClick={handleDemoAccess} title="Try Instant Demo Account">
                Instant Demo
              </button>
              <Link className="btn primary" to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <span className="hero-kicker">YOUR FIRST TRADING DESK</span>
          <h1>
            LEARN THE MARKETS.
            <br />
            PRACTISE WITHOUT <em>THE PRESSURE.</em>
          </h1>
          <p className="lede">
            Explore live price movements across crypto and global stocks, test buy and sell strategies,
            and build a virtual portfolio with a simulated ₹ wallet — zero risk, pure learning.
          </p>

          <div className="hero-cta">
            {session ? (
              <Link className="btn primary large" to="/app">
                Enter Your Trading Desk
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link className="btn primary large" to="/signup">
                  Start Practising Free
                  <ArrowRight size={18} />
                </Link>
                <button type="button" className="btn ghost large" onClick={handleDemoAccess}>
                  Try Instant Demo Account
                </button>
              </>
            )}
          </div>

          <div className="lp-stats">
            {STATS.map((s) => (
              <div key={s.value}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Real Interactive Product Preview */}
        <div className="lp-hero-visual">
          <InteractiveHeroPreview />
        </div>
      </section>

      {/* 4. Live Markets Showcase */}
      <section className="lp-section" id="markets">
        <div className="lp-split">
          <div>
            <h2>
              WATCH THE MOVE.
              <br />
              <em>PRACTISE</em> THE DECISION.
            </h2>
          </div>
          <p>
            Track real 24-hour market momentum across top crypto assets and leading equities. Test your
            market timing and position sizing before you ever risk personal savings.
          </p>
        </div>

        <div className="coin-rail">
          {FEATURED_INSTRUMENTS.map((inst) => (
            <article key={inst.symbol} className="coin-card">
              <div className="coin-card-top">
                <div>
                  <b>{inst.name}</b>
                  <small>{inst.symbol}</small>
                </div>
                {inst.up ? (
                  <ArrowUpRight size={18} className="up" />
                ) : (
                  <ArrowDownRight size={18} className="down" />
                )}
              </div>
              <div className="coin-card-price mono">{inst.priceInr}</div>
              <div className="coin-card-foot">
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>24h Range: {inst.low} – {inst.high}</span>
                <span className={`change-pill ${inst.up ? 'up' : 'down'} mono`}>{inst.pct}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. Core Value Propositions & Pillars */}
      <section className="lp-section" id="pillars" style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)' }}>
        <div className="section-head">
          <h2>BUILT FOR INTENTIONAL LEARNERS</h2>
          <p>Everything you need to master financial discipline, with zero gambling gimmicks.</p>
        </div>

        <div className="feature-row">
          {PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <article key={p.title}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} style={{ color: 'var(--accent-ink)' }} />
                </div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* 6. Step-by-Step Workflow */}
      <section className="lp-section" id="workflow">
        <div className="section-head">
          <h2>THE 4-STEP LEARNING LOOP</h2>
          <p>How young professionals and university students build lasting market competence.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {WORKFLOW.map((w) => (
            <div
              key={w.step}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--accent)', lineHeight: 1 }}>
                {w.step}
              </span>
              <h3 style={{ fontSize: '1.3rem' }}>{w.title}</h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Responsible Use & Disclaimers */}
      <section className="lp-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="lp-split">
          <div>
            <h2>
              TRANSPARENT BOUNDARIES.
              <br />
              <em>GENUINE</em> INTEGRITY.
            </h2>
            <p style={{ marginTop: '0.75rem' }}>
              We believe financial literacy starts with clear distinctions between education and speculation.
            </p>
          </div>
          <ul className="infra-list">
            <li>No brokerage account connection or real transaction routing</li>
            <li>No real bank account, debit card, or UPI withdrawals</li>
            <li>No artificial countdown timers, gamified loot boxes, or leverage traps</li>
            <li>Authoritative FIFO ledger records with auditable average entry costs</li>
          </ul>
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="lp-cta">
        <div>
          <h2>OPEN YOUR DESK. ZERO RISK TODAY.</h2>
          <p>Create your demo account in seconds, claim your paper wallet, and start testing strategies.</p>
        </div>
        <div className="hero-cta">
          {session ? (
            <Link className="btn primary large" to="/app">
              Return to Your Desk
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link className="btn primary large" to="/signup">
                Create Free Account
                <ArrowRight size={18} />
              </Link>
              <button type="button" className="btn ghost large" onClick={handleDemoAccess}>
                Instant Demo Access
              </button>
            </>
          )}
        </div>
      </section>

      {/* 9. FAQ Accordions */}
      <section className="lp-section" id="faq">
        <div className="section-head">
          <h2>FREQUENTLY ASKED QUESTIONS</h2>
          <p>Honest, transparent answers about how the platform operates.</p>
        </div>
        <div className="faq-list">
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* 10. Comprehensive Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-content">
          <div className="lp-footer-brand">
            <div className="brand">
              <span className="brand-mark">F</span>
              <span className="brand-name">FAIRBOOK</span>
            </div>
            <p>Clear markets. Quiet desk. The disciplined paper-trading sandbox built for modern learners.</p>
          </div>

          <div className="lp-footer-cols">
            <h4>Platform</h4>
            <a href="#markets">Markets</a>
            <a href="#workflow">Workflow</a>
            <a href="#pillars">Why Fairbook</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="lp-footer-cols">
            <h4>Terminal</h4>
            <Link to="/app">Overview Desk</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Register</Link>
          </div>

          <div className="lp-footer-cols">
            <h4>Important Notice</h4>
            <span>Paper Trading Only</span>
            <span>No Real Money Debited</span>
            <span>Not Registered Financial Advice</span>
            <span>Local Browser Storage</span>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>© 2026 Fairbook. Educational paper trading platform.</span>
          <span>Designed with Bebas Neue & Inter · No real financial transactions</span>
        </div>
      </footer>
    </div>
  )
}

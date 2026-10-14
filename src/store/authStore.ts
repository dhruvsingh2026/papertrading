import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string
  /** Demo only — stored in browser localStorage for paper-trading simulations */
  password: string
  createdAt: number
}

interface AuthState {
  users: AuthUser[]
  session: AuthUser | null
  signup: (name: string, email: string, password: string) => string | null
  login: (email: string, password: string) => string | null
  instantDemo: () => void
  logout: () => void
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      session: null,

      signup: (name, email, password) => {
        const cleaned = normalizeEmail(email)
        if (!name.trim()) return 'Please enter your full name'
        if (!cleaned.includes('@') || !cleaned.includes('.')) return 'Please enter a valid email address'
        if (password.length < 4) return 'Password must be at least 4 characters'
        if (get().users.some((u) => u.email === cleaned)) {
          return 'An account with this email already exists — please log in instead'
        }
        const user: AuthUser = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: cleaned,
          password,
          createdAt: Date.now(),
        }
        set((s) => ({ users: [...s.users, user], session: user }))
        return null
      },

      login: (email, password) => {
        const cleaned = normalizeEmail(email)
        const user = get().users.find((u) => u.email === cleaned)
        if (!user || user.password !== password) return 'Invalid email or password. Check credentials or try Instant Demo.'
        set({ session: user })
        return null
      },

      instantDemo: () => {
        const demoEmail = 'demo@fairbook.app'
        let demoUser = get().users.find((u) => u.email === demoEmail)
        if (!demoUser) {
          demoUser = {
            id: 'demo-learner-account',
            name: 'Demo Trader',
            email: demoEmail,
            password: 'demo',
            createdAt: Date.now(),
          }
          set((s) => ({ users: [...s.users, demoUser!], session: demoUser }))
        } else {
          set({ session: demoUser })
        }
      },

      logout: () => set({ session: null }),
    }),
    { name: 'fairbook-auth' },
  ),
)

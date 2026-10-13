import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string
  /** Demo only — not real security */
  password: string
  createdAt: number
}

interface AuthState {
  users: AuthUser[]
  session: AuthUser | null
  signup: (name: string, email: string, password: string) => string | null
  login: (email: string, password: string) => string | null
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
        if (!name.trim()) return 'Enter your name'
        if (!cleaned.includes('@')) return 'Enter a valid email'
        if (password.length < 4) return 'Password must be at least 4 characters'
        if (get().users.some((u) => u.email === cleaned)) {
          return 'Account already exists — try login'
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
        if (!user || user.password !== password) return 'Invalid email or password'
        set({ session: user })
        return null
      },
      logout: () => set({ session: null }),
    }),
    { name: 'fairbook-auth' },
  ),
)

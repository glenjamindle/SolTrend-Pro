'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'admin@apexsolar.com', password: 'demo123' },
  { role: 'Project Manager', email: 'pm@apexsolar.com', password: 'demo123' },
  { role: 'Supervisor', email: 'supervisor@apexsolar.com', password: 'demo123' },
  { role: 'Crew', email: 'crew@apexsolar.com', password: 'demo123' },
  { role: 'Inspector', email: 'inspector@apexsolar.com', password: 'demo123' },
]

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password')
      return
    }
    router.push('/')
    router.refresh()
  }

  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0c1222',
        color: '#f1f5f9',
        fontFamily: "'DM Sans', sans-serif",
        padding: 16,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 20,
              color: 'white',
            }}
          >
            S
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20 }}>SolTrend</div>
            <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>Pro</div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: 'linear-gradient(135deg, #1a2332 0%, #111827 100%)',
            border: '1px solid #1e293b',
            borderRadius: 16,
            padding: 28,
          }}
        >
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Sign in
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
            Solar construction management platform
          </p>

          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 10,
              padding: '10px 12px',
              color: 'white',
              marginBottom: 14,
              boxSizing: 'border-box',
              fontSize: 14,
            }}
            placeholder="you@company.com"
          />

          <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 10,
              padding: '10px 12px',
              color: 'white',
              marginBottom: 14,
              boxSizing: 'border-box',
              fontSize: 14,
            }}
            placeholder="••••••••"
          />

          {error && (
            <div style={{ color: '#f87171', fontSize: 13, marginBottom: 14 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: 20,
            background: '#111827',
            border: '1px solid #1e293b',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Demo Credentials
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_CREDENTIALS.map((c) => (
              <button
                key={c.email}
                type="button"
                onClick={() => fillDemo(c.email, c.password)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#1e293b',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 10px',
                  color: '#cbd5e1',
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 600 }}>{c.role}</span>
                <span style={{ color: '#64748b' }}>{c.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

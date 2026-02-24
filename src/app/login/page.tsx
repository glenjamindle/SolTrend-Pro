'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
      } else {
        // Use hard redirect to ensure session is properly loaded
        window.location.href = '/'
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0c1222 0%, #1a2332 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'linear-gradient(135deg, #1a2332 0%, #111827 100%)',
        borderRadius: '16px',
        border: '1px solid #1e293b',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '28px',
            fontWeight: 700,
            color: 'white',
            margin: '0 0 8px'
          }}>SolTrend Pro</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Solar Construction Management</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#f87171',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#94a3b8',
              marginBottom: '8px',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px'
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.15s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
              onBlur={(e) => e.target.style.borderColor = '#1e293b'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#94a3b8',
              marginBottom: '8px',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px'
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.15s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
              onBlur={(e) => e.target.style.borderColor = '#1e293b'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#334155' : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              border: 'none',
              borderRadius: '8px',
              color: loading ? '#94a3b8' : 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #1e293b'
        }}>
          <p style={{
            fontSize: '11px',
            color: '#64748b',
            textAlign: 'center',
            marginBottom: '12px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px'
          }}>Demo Accounts</p>
          <div style={{
            display: 'grid',
            gap: '8px',
            fontSize: '12px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: '#0f172a',
              borderRadius: '6px'
            }}>
              <span style={{ color: '#94a3b8' }}>Admin</span>
              <span style={{ color: '#f59e0b' }}>admin@apexsolar.com</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: '#0f172a',
              borderRadius: '6px'
            }}>
              <span style={{ color: '#94a3b8' }}>Inspector</span>
              <span style={{ color: '#f59e0b' }}>inspector@apexsolar.com</span>
            </div>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            textAlign: 'center',
            marginTop: '12px'
          }}>Password: <span style={{ color: '#f59e0b' }}>demo123</span></p>
        </div>
      </div>
    </div>
  )
}

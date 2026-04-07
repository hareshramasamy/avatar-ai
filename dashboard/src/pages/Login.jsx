import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api.js'

const PRIMARY = '#c8102f'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/login', { email, password })
      const { access_token, user_id, embed_token, name } = res.data
      localStorage.setItem('avatar_token', access_token)
      localStorage.setItem('avatar_user_id', user_id)
      localStorage.setItem('avatar_embed_token', embed_token)
      if (name) localStorage.setItem('avatar_name', name)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>Avatar</span>
          <span style={{ ...styles.logoText, color: PRIMARY }}>AI</span>
        </div>
        <h2 style={styles.title}>Sign in to your account</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="you@example.com"
          />
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="••••••••"
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    padding: '40px 36px',
    width: 380,
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  logo: {
    display: 'flex',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 700,
    color: '#111',
    letterSpacing: '-0.5px',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 600,
    color: '#333',
    margin: '0 0 24px',
  },
  error: {
    background: '#fff0f0',
    border: '1px solid #f5c6c6',
    color: PRIMARY,
    borderRadius: 4,
    padding: '10px 12px',
    fontSize: 14,
    marginBottom: 16,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#555',
    marginBottom: 2,
    marginTop: 10,
  },
  input: {
    padding: '9px 12px',
    borderRadius: 5,
    border: '1px solid #ddd',
    fontSize: 14,
    outline: 'none',
    color: '#111',
  },
  button: {
    marginTop: 20,
    padding: '11px',
    background: PRIMARY,
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: '#777',
    marginTop: 20,
    marginBottom: 0,
  },
  link: {
    color: PRIMARY,
    textDecoration: 'none',
    fontWeight: 500,
  },
}

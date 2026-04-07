import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api.js'

const PRIMARY = '#c8102f'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/signup', { ...form })
      const { access_token, user_id, embed_token, name } = res.data
      localStorage.setItem('avatar_token', access_token)
      localStorage.setItem('avatar_user_id', user_id)
      localStorage.setItem('avatar_embed_token', embed_token)
      localStorage.setItem('avatar_name', name || form.name)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.')
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
        <h2 style={styles.title}>Create your account</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Full Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Jane Smith"
          />
          <label style={styles.label}>Slug (your unique URL handle)</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="janesmith"
            pattern="[a-z0-9\-]+"
            title="Lowercase letters, numbers and dashes only"
          />
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="you@example.com"
          />
          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="••••••••"
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
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
    padding: '24px 0',
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    padding: '40px 36px',
    width: 400,
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
  optional: {
    fontWeight: 400,
    color: '#999',
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

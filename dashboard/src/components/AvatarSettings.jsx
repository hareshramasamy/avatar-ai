import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api.js'

const PRIMARY = '#c8102f'

const TONES = ['Professional', 'Casual', 'Technical']

export default function AvatarSettings() {
  const userId = localStorage.getItem('avatar_user_id')
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    persona_tone: 'Professional',
    ask_for_email: false,
    topics_to_avoid: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.get(`/users/${userId}/config`)
        const data = res.data
        setForm({
          persona_tone: data.persona_tone || 'Professional',
          ask_for_email: data.ask_for_email ?? false,
          topics_to_avoid: Array.isArray(data.topics_to_avoid)
            ? data.topics_to_avoid.join(', ')
            : (data.topics_to_avoid || ''),
        })
      } catch (err) {
        // Config might not exist yet — use defaults
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const payload = {
        persona_tone: form.persona_tone,
        ask_for_email: form.ask_for_email,
        topics_to_avoid: form.topics_to_avoid
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      }
      await api.patch(`/users/${userId}/config`, payload)
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ color: '#999', fontSize: 14 }}>Loading settings…</p>

  return (
    <div>
      <h2 style={styles.heading}>Settings</h2>
      <p style={styles.sub}>Customize how your avatar behaves and interacts with visitors.</p>

      {error && <div style={styles.error}>{error}</div>}
      {saved && <div style={styles.success}>Settings saved successfully.</div>}

      <form onSubmit={handleSave} style={styles.form}>
        {/* Persona Tone */}
        <div style={styles.section}>
          <label style={styles.sectionLabel}>Persona Tone</label>
          <p style={styles.sectionDesc}>Set the communication style of your avatar.</p>
          <div style={styles.radioGroup}>
            {TONES.map(tone => (
              <label key={tone} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="persona_tone"
                  value={tone}
                  checked={form.persona_tone === tone}
                  onChange={() => handleChange('persona_tone', tone)}
                  style={styles.radio}
                />
                <span style={styles.radioText}>
                  <strong>{tone}</strong>
                  <span style={styles.radioDesc}>
                    {tone === 'Professional' && ' — Formal and polished'}
                    {tone === 'Casual' && ' — Friendly and conversational'}
                    {tone === 'Technical' && ' — Precise and detail-oriented'}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Ask for email */}
        <div style={styles.section}>
          <label style={styles.toggleRow}>
            <span style={styles.sectionLabel} as="span">Ask visitors for email</span>
            <div style={styles.toggleWrap}>
              <input
                type="checkbox"
                checked={form.ask_for_email}
                onChange={e => handleChange('ask_for_email', e.target.checked)}
                style={styles.checkbox}
                id="ask_for_email"
              />
              <label htmlFor="ask_for_email" style={{
                ...styles.toggleTrack,
                background: form.ask_for_email ? PRIMARY : '#ccc',
              }}>
                <span style={{
                  ...styles.toggleThumb,
                  left: form.ask_for_email ? 22 : 2,
                }} />
              </label>
            </div>
          </label>
          <p style={styles.sectionDesc}>When enabled, the widget will ask for an email before the chat starts.</p>
        </div>

        {/* Topics to avoid */}
        <div style={styles.section}>
          <label style={styles.sectionLabel}>Topics to avoid</label>
          <p style={styles.sectionDesc}>Comma-separated list of topics your avatar should not discuss.</p>
          <input
            type="text"
            value={form.topics_to_avoid}
            onChange={e => handleChange('topics_to_avoid', e.target.value)}
            placeholder="salary, personal relationships, politics"
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={saving} style={styles.button}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>

      <div style={styles.dangerZone}>
        <div style={styles.sectionLabel}>Danger Zone</div>
        <p style={styles.sectionDesc}>Permanently delete your account, all documents, and all data. This cannot be undone.</p>
        <button
          disabled={deleting}
          onClick={async () => {
            if (!window.confirm('Are you sure? This will permanently delete your account and all data.')) return
            setDeleting(true)
            try {
              await api.delete(`/users/${userId}`)
              localStorage.clear()
              navigate('/signup')
            } catch (err) {
              alert(err.response?.data?.detail || 'Failed to delete account.')
              setDeleting(false)
            }
          }}
          style={styles.deleteBtn}
        >
          {deleting ? 'Deleting…' : 'Delete Account'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  heading: { fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 6px' },
  sub: { color: '#666', fontSize: 14, marginTop: 0, marginBottom: 24 },
  error: {
    background: '#fff0f0',
    border: '1px solid #f5c6c6',
    color: PRIMARY,
    borderRadius: 5,
    padding: '10px 14px',
    fontSize: 14,
    marginBottom: 16,
  },
  success: {
    background: '#e6f9ed',
    border: '1px solid #a3d9b8',
    color: '#1a7a3c',
    borderRadius: 5,
    padding: '10px 14px',
    fontSize: 14,
    marginBottom: 16,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  section: {
    background: '#fff',
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    padding: '20px 24px',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: '#222',
    display: 'block',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#888',
    margin: '0 0 12px',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    fontSize: 14,
  },
  radio: {
    accentColor: PRIMARY,
    width: 16,
    height: 16,
    flexShrink: 0,
  },
  radioText: {
    color: '#333',
  },
  radioDesc: {
    color: '#888',
    fontWeight: 400,
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  toggleWrap: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  },
  checkbox: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  toggleTrack: {
    display: 'inline-block',
    width: 44,
    height: 24,
    borderRadius: 12,
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  toggleThumb: {
    position: 'absolute',
    top: 2,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 5,
    border: '1px solid #ddd',
    fontSize: 14,
    color: '#111',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    padding: '11px 28px',
    background: PRIMARY,
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  dangerZone: {
    marginTop: 32,
    background: '#fff',
    border: '1px solid #f5c6c6',
    borderRadius: 8,
    padding: '20px 24px',
  },
  deleteBtn: {
    marginTop: 8,
    padding: '10px 24px',
    background: 'none',
    border: `1px solid ${PRIMARY}`,
    color: PRIMARY,
    borderRadius: 5,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
}

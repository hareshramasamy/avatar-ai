import { useState } from 'react'
import api from '../api.js'

const PRIMARY = '#c8102f'

const TABS = ['Upload PDF', 'GitHub Profile', 'Paste Text']

export default function AddSource() {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // PDF state
  const [file, setFile] = useState(null)

  // GitHub state
  const [githubUsername, setGithubUsername] = useState('')

  // Text state
  const [rawText, setRawText] = useState('')

  const userId = localStorage.getItem('avatar_user_id')

  function resetMessages() {
    setSuccess('')
    setError('')
  }

  async function handlePdfSubmit(e) {
    e.preventDefault()
    if (!file) return
    resetMessages()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post(`/users/${userId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Document uploaded successfully. Processing in the background — check Knowledge Sources for status.')
      setFile(null)
      e.target.reset()
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGithubSubmit(e) {
    e.preventDefault()
    resetMessages()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('github_username', githubUsername)
      const res = await api.post(`/users/${userId}/documents`, formData)
      setSuccess('GitHub profile queued for ingestion. Processing in the background — check Knowledge Sources for status.')
      setGithubUsername('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to ingest GitHub profile.')
    } finally {
      setLoading(false)
    }
  }

  async function handleTextSubmit(e) {
    e.preventDefault()
    resetMessages()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('raw_text', rawText)
      const res = await api.post(`/users/${userId}/documents`, formData)
      setSuccess('Text saved and queued for processing. Check Knowledge Sources for status.')
      setRawText('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save text.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={styles.heading}>Add Source</h2>
      <p style={styles.sub}>Add content your avatar will learn from.</p>

      {/* Tab bar */}
      <div style={styles.tabBar}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); resetMessages() }}
            style={{
              ...styles.tab,
              ...(activeTab === i ? styles.tabActive : {}),
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={styles.panel}>
        {success && <div style={styles.success}>{success}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {/* PDF Tab */}
        {activeTab === 0 && (
          <form onSubmit={handlePdfSubmit} style={styles.form}>
            <label style={styles.label}>Select a PDF file</label>
            <input
              type="file"
              accept=".pdf"
              required
              onChange={e => setFile(e.target.files[0])}
              style={styles.fileInput}
            />
            {file && (
              <p style={styles.fileInfo}>Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</p>
            )}
            <button type="submit" disabled={loading || !file} style={styles.button}>
              {loading ? 'Uploading…' : 'Upload PDF'}
            </button>
          </form>
        )}

        {/* GitHub Tab */}
        {activeTab === 1 && (
          <form onSubmit={handleGithubSubmit} style={styles.form}>
            <label style={styles.label}>GitHub Username</label>
            <input
              type="text"
              value={githubUsername}
              onChange={e => setGithubUsername(e.target.value)}
              required
              placeholder="octocat"
              style={styles.input}
            />
            <p style={styles.hint}>We'll import your repositories, README files, and public activity.</p>
            <button type="submit" disabled={loading || !githubUsername.trim()} style={styles.button}>
              {loading ? 'Importing…' : 'Import GitHub Profile'}
            </button>
          </form>
        )}

        {/* Text Tab */}
        {activeTab === 2 && (
          <form onSubmit={handleTextSubmit} style={styles.form}>
            <label style={styles.label}>Paste your text</label>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              required
              rows={10}
              placeholder="Paste any text content here — bio, resume, project descriptions, etc."
              style={styles.textarea}
            />
            <button type="submit" disabled={loading || !rawText.trim()} style={styles.button}>
              {loading ? 'Saving…' : 'Save Text'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  heading: { fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 6px' },
  sub: { color: '#666', fontSize: 14, marginTop: 0, marginBottom: 24 },
  tabBar: {
    display: 'flex',
    borderBottom: '2px solid #e8e8e8',
    marginBottom: 0,
  },
  tab: {
    background: 'none',
    border: 'none',
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: '#888',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
  },
  tabActive: {
    color: PRIMARY,
    borderBottomColor: PRIMARY,
    fontWeight: 600,
  },
  panel: {
    background: '#fff',
    border: '1px solid #e8e8e8',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    padding: '28px 28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 500,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#444',
    marginBottom: 2,
  },
  input: {
    padding: '9px 12px',
    borderRadius: 5,
    border: '1px solid #ddd',
    fontSize: 14,
    color: '#111',
    outline: 'none',
  },
  fileInput: {
    fontSize: 14,
    color: '#333',
  },
  fileInfo: {
    fontSize: 13,
    color: '#555',
    margin: '2px 0',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: 5,
    border: '1px solid #ddd',
    fontSize: 14,
    color: '#111',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  hint: {
    fontSize: 13,
    color: '#888',
    margin: '2px 0',
  },
  button: {
    marginTop: 8,
    padding: '10px 20px',
    background: PRIMARY,
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
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
  error: {
    background: '#fff0f0',
    border: '1px solid #f5c6c6',
    color: PRIMARY,
    borderRadius: 5,
    padding: '10px 14px',
    fontSize: 14,
    marginBottom: 16,
  },
}

import React, { useEffect, useRef } from 'react'

const PRIMARY = '#c8102f'
const WIDGET_SRC = 'http://localhost:3000/widget/dist/widget.iife.js'

export default function Preview() {
  const mountedRef = useRef(false)
  const embedToken = localStorage.getItem('avatar_embed_token') || ''

  function injectWidget() {
    // Remove any existing widget script and container
    const existing = document.getElementById('avatar-preview-script')
    if (existing) existing.remove()
    const existingContainer = document.getElementById('avatar-widget-container')
    if (existingContainer) existingContainer.remove()
    const existingBtn = document.querySelector('[data-avatar-chat-button]')
    if (existingBtn) existingBtn.remove()

    // Inject fresh script
    const script = document.createElement('script')
    script.id = 'avatar-preview-script'
    script.src = `${WIDGET_SRC}?t=${Date.now()}`
    script.setAttribute('data-token', embedToken)
    script.setAttribute('data-api', 'http://localhost:8000')
    script.async = true
    document.body.appendChild(script)
  }

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      injectWidget()
    }
    return () => {
      // Cleanup on unmount
      const script = document.getElementById('avatar-preview-script')
      if (script) script.remove()
      const container = document.getElementById('avatar-widget-container')
      if (container) container.remove()
      const btn = document.querySelector('[data-avatar-chat-button]')
      if (btn) btn.remove()
    }
  }, [])

  function handleClearReload() {
    mountedRef.current = false
    injectWidget()
    mountedRef.current = true
  }

  return (
    <div>
      <h2 style={styles.heading}>Preview</h2>
      <p style={styles.sub}>This is a live preview of your avatar. The chat widget should appear in the bottom-right corner of the page.</p>

      <div style={styles.card}>
        <div style={styles.noteRow}>
          <span style={styles.noteDot} />
          <span style={styles.noteText}>
            The widget is injected live into this page using your embed token. Make sure the widget server is running at{' '}
            <code style={styles.code}>localhost:3000</code>.
          </span>
        </div>
        <div style={styles.tokenRow}>
          <span style={styles.tokenLabel}>Embed Token:</span>
          <code style={styles.tokenValue}>{embedToken || '(not found)'}</code>
        </div>
        <button onClick={handleClearReload} style={styles.reloadBtn}>
          Clear &amp; Reload Widget
        </button>
      </div>

      <div style={styles.hint}>
        <strong>Not seeing the widget?</strong> Check that:
        <ul style={styles.ul}>
          <li>The widget build server is running (<code style={styles.code}>localhost:3000</code>)</li>
          <li>Your embed token is valid</li>
          <li>The API server is running at <code style={styles.code}>localhost:8000</code></li>
        </ul>
      </div>
    </div>
  )
}

const styles = {
  heading: { fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 6px' },
  sub: { color: '#666', fontSize: 14, marginTop: 0, marginBottom: 24 },
  card: {
    background: '#fff',
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    padding: '24px',
    marginBottom: 20,
  },
  noteRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  noteDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#1a7a3c',
    flexShrink: 0,
    marginTop: 5,
  },
  noteText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 1.5,
  },
  tokenRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tokenLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#666',
  },
  tokenValue: {
    fontSize: 13,
    background: '#f5f5f5',
    padding: '3px 8px',
    borderRadius: 4,
    color: '#333',
    wordBreak: 'break-all',
  },
  reloadBtn: {
    padding: '9px 20px',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  hint: {
    background: '#fffbe6',
    border: '1px solid #ffe8a0',
    borderRadius: 8,
    padding: '16px 20px',
    fontSize: 14,
    color: '#5a4a00',
  },
  ul: {
    margin: '8px 0 0',
    paddingLeft: 20,
    lineHeight: 1.8,
  },
  code: {
    background: '#f0f0f0',
    padding: '1px 6px',
    borderRadius: 3,
    fontSize: 13,
    fontFamily: 'monospace',
  },
}

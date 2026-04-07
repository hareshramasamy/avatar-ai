import React, { useState, useEffect } from 'react'
import api from '../api.js'

const PRIMARY = '#c8102f'

export default function AnsweredQuestions() {
  const userId = localStorage.getItem('avatar_user_id')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState({})

  useEffect(() => {
    async function fetchAnswered() {
      try {
        const res = await api.get(`/users/${userId}/answered`)
        setQuestions(res.data.questions || [])
      } catch {
        setError('Failed to load answered questions.')
      } finally {
        setLoading(false)
      }
    }
    fetchAnswered()
  }, [])

  async function handleDelete(id) {
    setDeleting(prev => ({ ...prev, [id]: true }))
    try {
      await api.delete(`/users/${userId}/answered/${id}`)
      setQuestions(prev => prev.filter(q => q.question_id !== id))
    } catch {
      // silently fail — could add error state if needed
    } finally {
      setDeleting(prev => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div>
      <h2 style={styles.heading}>Answered Questions</h2>
      <p style={styles.sub}>Questions you've answered — these are stored in your avatar's knowledge base. Deleting one removes it from Pinecone.</p>

      {loading && <p style={styles.muted}>Loading…</p>}
      {error && <p style={{ color: PRIMARY }}>{error}</p>}

      {!loading && questions.length === 0 && (
        <div style={styles.empty}>No answered questions yet.</div>
      )}

      <div style={styles.list}>
        {questions.map(q => (
          <div key={q.question_id} style={styles.item}>
            <div style={styles.itemHeader}>
              <div style={styles.texts}>
                <div style={styles.question}>{q.question}</div>
                <div style={styles.answer}>{q.answer}</div>
              </div>
              <div style={styles.meta}>
                {q.answered_at && (
                  <span style={styles.date}>
                    {new Date(q.answered_at).toLocaleDateString()}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(q.question_id)}
                  disabled={deleting[q.question_id]}
                  style={styles.deleteBtn}
                >
                  {deleting[q.question_id] ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  heading: { fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 6px' },
  sub: { color: '#666', fontSize: 14, marginTop: 0, marginBottom: 24 },
  muted: { color: '#999', fontSize: 14 },
  empty: {
    background: '#fff',
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    padding: '32px',
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  item: {
    background: '#fff',
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    padding: '16px 20px',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  texts: { flex: 1 },
  question: { fontSize: 15, color: '#222', fontWeight: 500, marginBottom: 6 },
  answer: { fontSize: 14, color: '#555', lineHeight: 1.5 },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
  date: { fontSize: 12, color: '#aaa' },
  deleteBtn: {
    background: 'none',
    border: `1px solid ${PRIMARY}`,
    color: PRIMARY,
    padding: '5px 12px',
    borderRadius: 5,
    fontSize: 13,
    cursor: 'pointer',
  },
}

import React, { useState, useEffect } from 'react'
import api from '../api.js'

const PRIMARY = '#c8102f'

export default function UnansweredQuestions() {
  const userId = localStorage.getItem('avatar_user_id')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState({}) // id -> boolean
  const [answers, setAnswers] = useState({}) // id -> string
  const [submitting, setSubmitting] = useState({}) // id -> boolean
  const [submitErrors, setSubmitErrors] = useState({}) // id -> string

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await api.get(`/users/${userId}/unanswered`)
        setQuestions(res.data.questions || [])
      } catch (err) {
        setError('Failed to load unanswered questions.')
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  function toggleOpen(id) {
    setOpen(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function updateAnswer(id, val) {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  async function handleSubmit(id) {
    const answer = (answers[id] || '').trim()
    if (!answer) return
    setSubmitting(prev => ({ ...prev, [id]: true }))
    setSubmitErrors(prev => ({ ...prev, [id]: '' }))
    try {
      await api.post(`/users/${userId}/unanswered/${id}/answer`, { answer })
      setQuestions(prev => prev.filter(q => q.question_id !== id))
    } catch (err) {
      setSubmitErrors(prev => ({
        ...prev,
        [id]: err.response?.data?.detail || 'Failed to submit answer.',
      }))
    } finally {
      setSubmitting(prev => ({ ...prev, [id]: false }))
    }
  }

  return (
    <div>
      <h2 style={styles.heading}>Visitor Questions</h2>
      <p style={styles.sub}>Questions visitors asked your avatar that it couldn't fully answer.</p>

      {loading && <p style={styles.muted}>Loading…</p>}
      {error && <p style={{ color: PRIMARY }}>{error}</p>}

      {!loading && questions.length === 0 && (
        <div style={styles.empty}>
          No unanswered questions right now. Great work!
        </div>
      )}

      <div style={styles.list}>
        {questions.map(q => (
          <div key={q.question_id} style={styles.item}>
            <div style={styles.itemHeader}>
              <div style={styles.questionText}>{q.question}</div>
              <div style={styles.meta}>
                {q.asked_at && (
                  <span style={styles.date}>
                    {new Date(q.asked_at).toLocaleDateString()}
                  </span>
                )}
                <button
                  onClick={() => toggleOpen(q.question_id)}
                  style={styles.answerBtn}
                >
                  {open[q.question_id] ? 'Cancel' : 'Answer'}
                </button>
              </div>
            </div>

            {open[q.question_id] && (
              <div style={styles.answerBox}>
                {submitErrors[q.question_id] && (
                  <div style={styles.error}>{submitErrors[q.question_id]}</div>
                )}
                <textarea
                  value={answers[q.question_id] || ''}
                  onChange={e => updateAnswer(q.question_id, e.target.value)}
                  rows={4}
                  placeholder="Type your answer…"
                  style={styles.textarea}
                />
                <button
                  onClick={() => handleSubmit(q.question_id)}
                  disabled={submitting[q.question_id] || !(answers[q.question_id] || '').trim()}
                  style={styles.submitBtn}
                >
                  {submitting[q.question_id] ? 'Submitting…' : 'Submit Answer'}
                </button>
              </div>
            )}
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
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
  questionText: {
    fontSize: 15,
    color: '#222',
    fontWeight: 500,
    flex: 1,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
  },
  answerBtn: {
    background: 'none',
    border: `1px solid ${PRIMARY}`,
    color: PRIMARY,
    padding: '5px 14px',
    borderRadius: 5,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  answerBox: {
    marginTop: 14,
    paddingTop: 14,
    borderTop: '1px solid #f0f0f0',
  },
  error: {
    background: '#fff0f0',
    color: PRIMARY,
    border: '1px solid #f5c6c6',
    borderRadius: 4,
    padding: '8px 12px',
    fontSize: 13,
    marginBottom: 10,
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 5,
    border: '1px solid #ddd',
    fontSize: 14,
    color: '#111',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  },
  submitBtn: {
    marginTop: 10,
    padding: '8px 20px',
    background: PRIMARY,
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
}

import React, { useState } from 'react'
import api from '../api.js'

const PRIMARY = '#c8102f'

const QUESTIONS = [
  'Describe your work experience in detail',
  'What are your top technical skills and how have you used them?',
  'What projects are you most proud of and why?',
  'What are your hobbies and interests outside work?',
]

export default function Questionnaire() {
  const userId = localStorage.getItem('avatar_user_id')
  const [answers, setAnswers] = useState(QUESTIONS.map(() => ''))
  const [saving, setSaving] = useState(QUESTIONS.map(() => false))
  const [saved, setSaved] = useState(QUESTIONS.map(() => false))
  const [errors, setErrors] = useState(QUESTIONS.map(() => ''))

  function updateAnswer(i, val) {
    setAnswers(prev => prev.map((a, idx) => idx === i ? val : a))
  }

  async function handleSave(i) {
    const answer = answers[i].trim()
    if (!answer) return

    setSaving(prev => prev.map((s, idx) => idx === i ? true : s))
    setErrors(prev => prev.map((e, idx) => idx === i ? '' : e))

    try {
      const formData = new FormData()
      formData.append('raw_text', `[Question: ${QUESTIONS[i]}]\n${answer}`)
      await api.post(`/users/${userId}/documents`, formData)
      setSaved(prev => prev.map((s, idx) => idx === i ? true : s))
    } catch (err) {
      setErrors(prev => prev.map((e, idx) =>
        idx === i ? (err.response?.data?.detail || 'Failed to save.') : e
      ))
    } finally {
      setSaving(prev => prev.map((s, idx) => idx === i ? false : s))
    }
  }

  return (
    <div>
      <h2 style={styles.heading}>Questionnaire</h2>
      <p style={styles.sub}>Answer these questions so your avatar can represent you authentically.</p>

      <div style={styles.cards}>
        {QUESTIONS.map((q, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.qNum}>Q{i + 1}</span>
              <span style={styles.qText}>{q}</span>
              {saved[i] && (
                <span style={styles.checkmark} title="Saved">&#10003; Saved</span>
              )}
            </div>
            {errors[i] && <div style={styles.error}>{errors[i]}</div>}
            <textarea
              value={answers[i]}
              onChange={e => updateAnswer(i, e.target.value)}
              rows={5}
              placeholder="Type your answer here…"
              style={styles.textarea}
            />
            <button
              onClick={() => handleSave(i)}
              disabled={saving[i] || !answers[i].trim()}
              style={styles.saveBtn}
            >
              {saving[i] ? 'Saving…' : 'Save'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  heading: { fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 6px' },
  sub: { color: '#666', fontSize: 14, marginTop: 0, marginBottom: 24 },
  cards: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    background: '#fff',
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    padding: '20px 24px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  qNum: {
    background: PRIMARY,
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
    borderRadius: 4,
    padding: '2px 8px',
    flexShrink: 0,
  },
  qText: {
    fontWeight: 600,
    fontSize: 15,
    color: '#222',
    flex: 1,
  },
  checkmark: {
    color: '#1a7a3c',
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
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
  saveBtn: {
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

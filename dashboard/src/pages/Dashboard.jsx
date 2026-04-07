import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import KnowledgeSources from '../components/KnowledgeSources.jsx'
import AddSource from '../components/AddSource.jsx'
import Questionnaire from '../components/Questionnaire.jsx'
import UnansweredQuestions from '../components/UnansweredQuestions.jsx'
import AnsweredQuestions from '../components/AnsweredQuestions.jsx'
import AvatarSettings from '../components/AvatarSettings.jsx'
import Preview from '../components/Preview.jsx'
import EmbedSnippet from '../components/EmbedSnippet.jsx'

const PRIMARY = '#c8102f'

const NAV_ITEMS = [
  { key: 'knowledge', label: 'Knowledge Sources' },
  { key: 'add', label: 'Add Source' },
  { key: 'questionnaire', label: 'Questionnaire' },
  { key: 'visitor', label: 'Visitor Questions' },
  { key: 'answered', label: 'Answered Questions' },
  { key: 'settings', label: 'Settings' },
  { key: 'preview', label: 'Preview' },
  { key: 'embed', label: 'Embed' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('knowledge')
  const name = localStorage.getItem('avatar_name') || 'User'

  useEffect(() => {
    if (!localStorage.getItem('avatar_token')) {
      navigate('/login')
    }
  }, [navigate])

  function handleLogout() {
    localStorage.removeItem('avatar_token')
    localStorage.removeItem('avatar_user_id')
    localStorage.removeItem('avatar_embed_token')
    localStorage.removeItem('avatar_name')
    navigate('/login')
  }

  function renderSection() {
    switch (activeSection) {
      case 'knowledge': return <KnowledgeSources />
      case 'add': return <AddSource />
      case 'questionnaire': return <Questionnaire />
      case 'visitor': return <UnansweredQuestions />
      case 'answered': return <AnsweredQuestions />
      case 'settings': return <AvatarSettings />
      case 'preview': return <Preview />
      case 'embed': return <EmbedSnippet />
      default: return null
    }
  }

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>Avatar</span>
          <span style={{ color: PRIMARY, fontWeight: 700, fontSize: 20 }}>AI</span>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>{name.charAt(0).toUpperCase()}</div>
          <span style={styles.userName}>{name}</span>
        </div>
        <nav style={styles.nav}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              style={{
                ...styles.navItem,
                ...(activeSection === item.key ? styles.navItemActive : {}),
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <div style={styles.mainInner}>
          {renderSection()}
        </div>
      </main>
    </div>
  )
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: 220,
    background: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 10,
  },
  sidebarLogo: {
    display: 'flex',
    gap: 4,
    padding: '20px 20px 16px',
    borderBottom: '1px solid #2a2a2a',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 20px',
    borderBottom: '1px solid #2a2a2a',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: PRIMARY,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  userName: {
    color: '#ccc',
    fontSize: 13,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '12px 10px',
    flex: 1,
  },
  navItem: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    textAlign: 'left',
    padding: '9px 12px',
    borderRadius: 5,
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 400,
    transition: 'background 0.15s, color 0.15s',
  },
  navItemActive: {
    background: PRIMARY,
    color: '#fff',
    fontWeight: 600,
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid #333',
    color: '#888',
    margin: '12px 14px',
    padding: '8px',
    borderRadius: 5,
    fontSize: 13,
    cursor: 'pointer',
  },
  main: {
    marginLeft: 220,
    flex: 1,
    background: '#f5f5f5',
    minHeight: '100vh',
  },
  mainInner: {
    padding: '32px 36px',
    maxWidth: 900,
  },
}

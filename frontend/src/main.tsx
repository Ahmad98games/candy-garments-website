import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { trackEvent } from './api/client'
import { logError } from './utils/logger'
import './index.css'

// Global Uncaught Exception Handlers
if (typeof window !== 'undefined') {
  window.onerror = (message, source, lineno, colno, error) => {
    logError(error || String(message), { source, line: lineno, column: colno });
  };

  window.onunhandledrejection = (event) => {
    logError(event.reason || 'Unhandled Promise Rejection', { source: 'UnhandledRejection' });
  };
}

function ensureSessionId() {
  let sid = localStorage.getItem('sid')
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('sid', sid)
  }
  return sid
}

const sessionId = ensureSessionId()
trackEvent({ type: 'app_start', path: location.pathname, sessionId, referrer: document.referrer, screen: { width: screen.width, height: screen.height } })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
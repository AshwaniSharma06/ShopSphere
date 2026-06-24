import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Global error handlers to capture client-side crashes
window.onerror = function (message, source, lineno, colno, error) {
  fetch('/api/v1/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'error', message, source, lineno, colno, stack: error?.stack })
  }).catch(() => {});
};

window.addEventListener('unhandledrejection', function (event) {
  fetch('/api/v1/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'unhandled_rejection', message: event.reason?.message || String(event.reason), stack: event.reason?.stack })
  }).catch(() => {});
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

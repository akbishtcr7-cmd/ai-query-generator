import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Prevent the browser from auto-restoring the previous scroll position
// when navigating between pages in this single-page app. Without this,
// the browser can silently scroll back to wherever you last were on a
// page (e.g. the bottom of the chat), overriding our own scroll-to-top
// logic in Layout.jsx.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
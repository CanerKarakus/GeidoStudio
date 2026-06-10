import React from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async'
import './styles/global.scss'
import './i18n'

const rootElement = document.getElementById('root');

if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
} else {
  createRoot(rootElement).render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
}

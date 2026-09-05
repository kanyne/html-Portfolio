import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

/**
 * The portable build (`npm run build:portable`) is opened straight off disk via
 * file://, where history-based routing cannot work — so it uses a hash router.
 * Normal hosted builds keep clean URLs.
 */
const Router = import.meta.env.VITE_PORTABLE ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);

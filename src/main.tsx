import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
  if (descriptor && !descriptor.set && descriptor.configurable) {
    Object.defineProperty(window, 'fetch', {
      ...descriptor,
      set: () => {},
    });
  }
} catch (e) {
  // ignore
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

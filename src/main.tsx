import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { TopicProvider } from './context/TopicContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <TopicProvider>
      <App />
    </TopicProvider>
  </React.StrictMode>,
);

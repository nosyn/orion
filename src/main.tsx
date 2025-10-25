import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import { startSessionWatcher } from './lib/ipc';

// start the session watcher once
startSessionWatcher();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

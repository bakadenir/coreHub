// =====================================================
// coreHub - Main Application Entry Point
// =====================================================

import './styles/main.css';
import { App } from './app';

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    const app = new App(appContainer);
    app.init();
  }
});

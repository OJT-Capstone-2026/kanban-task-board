import { storage } from './storage.js';

export const theme = {
  currentTheme: 'dark',

  init() {
    this.currentTheme = storage.loadTheme();
    this.applyTheme(this.currentTheme);
    this.bindEvents();
  },

  applyTheme(themeName) {
    const root = document.documentElement;
    if (themeName === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
    storage.saveTheme(themeName);
    this.updateToggleIcon();
  },

  toggle() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    // Add temporary transitioning class to prevent transition glitches
    document.documentElement.classList.add('theme-transitioning');
    this.applyTheme(this.currentTheme);
    
    // Remove transition helper class after CSS transition finishes (e.g., 400ms)
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 400);

    // Dispatch global custom event for components that might want to update drawings (like canvas charts)
    window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: this.currentTheme } }));
  },

  updateToggleIcon() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (!icon) return;

    if (this.currentTheme === 'dark') {
      icon.className = 'fas fa-sun';
      btn.setAttribute('aria-label', 'Switch to Light Mode');
    } else {
      icon.className = 'fas fa-moon';
      btn.setAttribute('aria-label', 'Switch to Dark Mode');
    }
  },

  bindEvents() {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
    }
  }
};

import { board } from './board.js';

export const search = {
  init() {
    const searchInput = document.getElementById('global-search');
    if (!searchInput) return;

    // Listen to input changes in real-time
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      board.setFilter('searchQuery', query);
    });

    // Support CMD+K / CTRL+K keyboard shortcut focus
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
};

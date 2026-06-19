/**
 * COMMAND PALETTE MODULE
 * Enterprise-grade command palette with glassmorphism design
 * Implements fuzzy search, keyboard shortcuts, and quick actions
 */

import { modal } from './modal.js';
import { taskManager } from './taskManager.js';
import { board } from './board.js';

export const commandPalette = {
  isOpen: false,
  searchQuery: '',
  selectedIndex: 0,
  filteredActions: [],
  shortcutLegendOpen: false,

  // Available actions in the command palette
  actions: [
    {
      id: 'new-task',
      title: 'Create New Task',
      description: 'Open modal to create a new task',
      keywords: ['create', 'new', 'add', 'task'],
      icon: '➕',
      shortcut: 'N',
      handler: () => modal.openCreateModal()
    },
    {
      id: 'search-tasks',
      title: 'Search Tasks',
      description: 'Focus on the global search input',
      keywords: ['search', 'find', 'filter'],
      icon: '🔍',
      shortcut: '/',
      handler: () => {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
          searchInput.focus();
          commandPalette.close();
        }
      }
    },
    {
      id: 'clear-filters',
      title: 'Clear All Filters',
      description: 'Reset all active filters',
      keywords: ['clear', 'reset', 'filters', 'remove'],
      icon: '🗑️',
      shortcut: null,
      handler: () => {
        board.clearFilters();
        commandPalette.close();
      }
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Dark Mode',
      description: 'Switch between light and dark theme',
      keywords: ['theme', 'dark', 'light', 'mode'],
      icon: '🌓',
      shortcut: null,
      handler: () => {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.click();
        commandPalette.close();
      }
    },
    {
      id: 'export-data',
      title: 'Export Tasks',
      description: 'Download all tasks as JSON file',
      keywords: ['export', 'download', 'backup', 'save'],
      icon: '💾',
      shortcut: null,
      handler: () => {
        taskManager.exportTasks();
        commandPalette.close();
      }
    },
    {
      id: 'import-data',
      title: 'Import Tasks',
      description: 'Upload and import tasks from JSON file',
      keywords: ['import', 'upload', 'restore', 'load'],
      icon: '📥',
      shortcut: null,
      handler: () => {
        const importInput = document.getElementById('import-input');
        if (importInput) {
          importInput.click();
          commandPalette.close();
        }
      }
    },
    {
      id: 'show-stats',
      title: 'View Analytics',
      description: 'Show task statistics and analytics',
      keywords: ['stats', 'analytics', 'metrics', 'dashboard'],
      icon: '📊',
      shortcut: null,
      handler: () => {
        const analyticsSection = document.getElementById('analytics-section');
        if (analyticsSection) {
          analyticsSection.scrollIntoView({ behavior: 'smooth' });
          commandPalette.close();
        }
      }
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View all available keyboard shortcuts',
      keywords: ['shortcuts', 'keys', 'help', 'commands'],
      icon: '⌨️',
      shortcut: '?',
      handler: () => {
        commandPalette.close();
        setTimeout(() => commandPalette.openShortcutLegend(), 100);
      }
    }
  ],

  // Keyboard shortcuts configuration
  shortcuts: [
    { key: 'k', ctrlOrCmd: true, description: 'Open Command Palette', action: 'toggle-palette' },
    { key: 'n', ctrlOrCmd: false, description: 'New Task', action: 'new-task' },
    { key: 'e', ctrlOrCmd: false, description: 'Edit Selected Task', action: 'edit-task' },
    { key: 'd', ctrlOrCmd: false, description: 'Delete Selected Task', action: 'delete-task' },
    { key: '/', ctrlOrCmd: false, description: 'Focus Search', action: 'search' },
    { key: 'Escape', ctrlOrCmd: false, description: 'Close Modal/Palette', action: 'close' },
    { key: '?', ctrlOrCmd: false, description: 'Show Shortcuts', action: 'help' }
  ],

  /**
   * Initialize the command palette
   */
  init() {
    this.createPaletteHTML();
    this.createShortcutLegendHTML();
    this.bindKeyboardEvents();
    this.bindPaletteEvents();
  },

  /**
   * Create the command palette HTML structure
   */
  createPaletteHTML() {
    const existing = document.getElementById('command-palette-overlay');
    if (existing) existing.remove();

    const paletteHTML = `
      <div id="command-palette-overlay" class="command-palette-overlay">
        <div class="command-palette-container">
          <div class="command-palette-header">
            <div class="command-palette-icon">⚡</div>
            <input 
              type="text" 
              id="command-palette-input" 
              class="command-palette-input" 
              placeholder="Type a command or search..."
              autocomplete="off"
              spellcheck="false"
            />
            <div class="command-palette-close" id="command-palette-close">
              <span>ESC</span>
            </div>
          </div>
          <div class="command-palette-results" id="command-palette-results">
            <div class="command-palette-empty">
              Type to search for commands...
            </div>
          </div>
          <div class="command-palette-footer">
            <div class="command-palette-hint">
              <kbd>↑↓</kbd> Navigate
              <kbd>Enter</kbd> Execute
              <kbd>ESC</kbd> Close
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', paletteHTML);
  },

  /**
   * Create the keyboard shortcut legend HTML
   */
  createShortcutLegendHTML() {
    const existing = document.getElementById('shortcut-legend-overlay');
    if (existing) existing.remove();

    const shortcutsHTML = this.shortcuts.map(shortcut => {
      const keyDisplay = shortcut.ctrlOrCmd 
        ? `<kbd class="key-combo"><span class="key-mod">${this.isMac() ? 'Cmd' : 'Ctrl'}</span> + <span class="key-main">${shortcut.key.toUpperCase()}</span></kbd>`
        : `<kbd class="key-single">${shortcut.key === 'Escape' ? 'ESC' : shortcut.key.toUpperCase()}</kbd>`;
      
      return `
        <div class="shortcut-item">
          ${keyDisplay}
          <span class="shortcut-description">${shortcut.description}</span>
        </div>
      `;
    }).join('');

    const legendHTML = `
      <div id="shortcut-legend-overlay" class="shortcut-legend-overlay">
        <div class="shortcut-legend-container">
          <div class="shortcut-legend-header">
            <h2>⌨️ Keyboard Shortcuts</h2>
            <button class="shortcut-legend-close" id="shortcut-legend-close">×</button>
          </div>
          <div class="shortcut-legend-content">
            ${shortcutsHTML}
          </div>
          <div class="shortcut-legend-footer">
            <p>Press <kbd>?</kbd> anytime to toggle this guide</p>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', legendHTML);
  },

  /**
   * Bind keyboard event listeners
   */
  bindKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input field (except for command palette trigger)
      const isInputFocused = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      
      // Command Palette Toggle (Cmd/Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
        return;
      }

      // If command palette is open, handle its shortcuts
      if (this.isOpen) {
        this.handlePaletteKeydown(e);
        return;
      }

      // If shortcut legend is open, close on ESC
      if (this.shortcutLegendOpen && e.key === 'Escape') {
        e.preventDefault();
        this.closeShortcutLegend();
        return;
      }

      // Global shortcuts (only when not typing in inputs)
      if (!isInputFocused && !this.isOpen) {
        this.handleGlobalShortcut(e);
      }
    });
  },

  /**
   * Handle global keyboard shortcuts
   */
  handleGlobalShortcut(e) {
    const key = e.key.toLowerCase();

    switch (key) {
      case 'n':
        e.preventDefault();
        modal.openCreateModal();
        break;
      
      case 'e':
        e.preventDefault();
        this.editFirstSelectedTask();
        break;
      
      case 'd':
        e.preventDefault();
        this.deleteFirstSelectedTask();
        break;
      
      case '/':
        e.preventDefault();
        const searchInput = document.getElementById('global-search');
        if (searchInput) searchInput.focus();
        break;
      
      case 'escape':
        e.preventDefault();
        this.closeAllModals();
        break;
      
      case '?':
        e.preventDefault();
        this.openShortcutLegend();
        break;
    }
  },

  /**
   * Handle keyboard navigation within the command palette
   */
  handlePaletteKeydown(e) {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        this.selectNext();
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        this.selectPrevious();
        break;
      
      case 'Enter':
        e.preventDefault();
        this.executeSelected();
        break;
    }
  },

  /**
   * Bind command palette UI events
   */
  bindPaletteEvents() {
    // Input search
    const input = document.getElementById('command-palette-input');
    if (input) {
      input.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.search();
      });
    }

    // Close button
    const closeBtn = document.getElementById('command-palette-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Overlay click to close
    const overlay = document.getElementById('command-palette-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    }

    // Shortcut legend close button
    const legendCloseBtn = document.getElementById('shortcut-legend-close');
    if (legendCloseBtn) {
      legendCloseBtn.addEventListener('click', () => this.closeShortcutLegend());
    }

    // Shortcut legend overlay click to close
    const legendOverlay = document.getElementById('shortcut-legend-overlay');
    if (legendOverlay) {
      legendOverlay.addEventListener('click', (e) => {
        if (e.target === legendOverlay) this.closeShortcutLegend();
      });
    }
  },

  /**
   * Toggle command palette visibility
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  /**
   * Open command palette
   */
  open() {
    this.isOpen = true;
    this.searchQuery = '';
    this.selectedIndex = 0;
    
    const overlay = document.getElementById('command-palette-overlay');
    const input = document.getElementById('command-palette-input');
    
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 100);
    }
    
    this.renderAllActions();
  },

  /**
   * Close command palette
   */
  close() {
    this.isOpen = false;
    this.searchQuery = '';
    this.selectedIndex = 0;
    
    const overlay = document.getElementById('command-palette-overlay');
    
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  /**
   * Search and filter actions using fuzzy matching
   */
  search() {
    if (!this.searchQuery.trim()) {
      this.renderAllActions();
      return;
    }

    this.filteredActions = this.actions.filter(action => {
      return this.fuzzyMatch(action, this.searchQuery);
    });

    this.selectedIndex = 0;
    this.renderResults();
  },

  /**
   * Fuzzy match algorithm for searching
   */
  fuzzyMatch(action, query) {
    const searchText = query.toLowerCase();
    const titleMatch = action.title.toLowerCase().includes(searchText);
    const descMatch = action.description.toLowerCase().includes(searchText);
    const keywordMatch = action.keywords.some(kw => kw.toLowerCase().includes(searchText));
    
    // Simple fuzzy scoring
    if (titleMatch || descMatch || keywordMatch) {
      return true;
    }

    // Character-by-character fuzzy match
    const title = action.title.toLowerCase();
    let queryIndex = 0;
    
    for (let i = 0; i < title.length && queryIndex < searchText.length; i++) {
      if (title[i] === searchText[queryIndex]) {
        queryIndex++;
      }
    }
    
    return queryIndex === searchText.length;
  },

  /**
   * Render all available actions
   */
  renderAllActions() {
    this.filteredActions = [...this.actions];
    this.renderResults();
  },

  /**
   * Render search results
   */
  renderResults() {
    const resultsContainer = document.getElementById('command-palette-results');
    if (!resultsContainer) return;

    if (this.filteredActions.length === 0) {
      resultsContainer.innerHTML = `
        <div class="command-palette-empty">
          <span class="empty-icon">🔍</span>
          <p>No commands found</p>
          <small>Try a different search term</small>
        </div>
      `;
      return;
    }

    const resultsHTML = this.filteredActions.map((action, index) => {
      const isSelected = index === this.selectedIndex;
      const shortcutHTML = action.shortcut 
        ? `<kbd class="action-shortcut">${action.shortcut}</kbd>` 
        : '';
      
      return `
        <div class="command-palette-action ${isSelected ? 'selected' : ''}" data-action-id="${action.id}">
          <div class="action-icon">${action.icon}</div>
          <div class="action-content">
            <div class="action-title">${this.highlightMatch(action.title, this.searchQuery)}</div>
            <div class="action-description">${action.description}</div>
          </div>
          ${shortcutHTML}
        </div>
      `;
    }).join('');

    resultsContainer.innerHTML = resultsHTML;

    // Bind click events to actions
    resultsContainer.querySelectorAll('.command-palette-action').forEach((el, index) => {
      el.addEventListener('click', () => {
        this.selectedIndex = index;
        this.executeSelected();
      });
    });

    // Ensure selected item is visible
    this.scrollToSelected();
  },

  /**
   * Highlight matching characters in search results
   */
  highlightMatch(text, query) {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  /**
   * Select next action in the list
   */
  selectNext() {
    if (this.filteredActions.length === 0) return;
    
    this.selectedIndex = (this.selectedIndex + 1) % this.filteredActions.length;
    this.renderResults();
  },

  /**
   * Select previous action in the list
   */
  selectPrevious() {
    if (this.filteredActions.length === 0) return;
    
    this.selectedIndex = this.selectedIndex - 1;
    if (this.selectedIndex < 0) {
      this.selectedIndex = this.filteredActions.length - 1;
    }
    this.renderResults();
  },

  /**
   * Execute the currently selected action
   */
  executeSelected() {
    if (this.filteredActions.length === 0) return;
    
    const selectedAction = this.filteredActions[this.selectedIndex];
    if (selectedAction && selectedAction.handler) {
      selectedAction.handler();
      this.close();
    }
  },

  /**
   * Scroll to ensure selected item is visible
   */
  scrollToSelected() {
    const resultsContainer = document.getElementById('command-palette-results');
    if (!resultsContainer) return;

    const selectedEl = resultsContainer.querySelector('.command-palette-action.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  },

  /**
   * Open keyboard shortcuts legend
   */
  openShortcutLegend() {
    this.shortcutLegendOpen = true;
    const overlay = document.getElementById('shortcut-legend-overlay');
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  /**
   * Close keyboard shortcuts legend
   */
  closeShortcutLegend() {
    this.shortcutLegendOpen = false;
    const overlay = document.getElementById('shortcut-legend-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  /**
   * Helper: Check if running on Mac
   */
  isMac() {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  },

  /**
   * Helper: Edit first selected/visible task
   */
  editFirstSelectedTask() {
    const firstCard = document.querySelector('.kanban-card');
    if (firstCard) {
      const taskId = firstCard.dataset.taskId;
      if (taskId) modal.openEditModal(taskId);
    }
  },

  /**
   * Helper: Delete first selected/visible task
   */
  deleteFirstSelectedTask() {
    const firstCard = document.querySelector('.kanban-card');
    if (firstCard) {
      const taskId = firstCard.dataset.taskId;
      if (taskId) modal.openDeleteConfirmModal(taskId);
    }
  },

  /**
   * Helper: Close all open modals
   */
  closeAllModals() {
    const modals = document.querySelectorAll('.modal.open');
    modals.forEach(modal => modal.classList.remove('open'));
    this.close();
  }
};

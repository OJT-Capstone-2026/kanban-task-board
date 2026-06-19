import { board } from './board.js';
import { analytics } from './analytics.js';
import { calendar } from './calendar.js';
import { settings } from './settings.js';
import { taskManager } from './taskManager.js';

export const viewManager = {
  currentView: 'kanban',

  init() {
    this.bindEvents();
    // Default view
    this.switchView('kanban');
  },

  switchView(viewName) {
    if (!viewName) return;
    this.currentView = viewName;

    // 1. Toggle view container visibility
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => {
      if (v.id === `view-${viewName}`) {
        v.classList.add('active');
      } else {
        v.classList.remove('active');
      }
    });

    // 2. Toggle active state in sidebar navigation
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    navLinks.forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 3. Trigger view-specific render logic
    const tasks = taskManager.getTasks();
    if (viewName === 'kanban') {
      board.render(tasks);
    } else if (viewName === 'dashboard') {
      analytics.render(tasks);
    } else if (viewName === 'calendar') {
      calendar.render(tasks);
    } else if (viewName === 'settings') {
      settings.render();
    }

    // Adapt header controls to views (e.g. search bar visibility)
    const searchWrapper = document.querySelector('.search-wrapper');
    if (searchWrapper) {
      if (viewName === 'settings' || viewName === 'dashboard') {
        searchWrapper.style.opacity = '0.3';
        searchWrapper.style.pointerEvents = 'none';
      } else {
        searchWrapper.style.opacity = '1';
        searchWrapper.style.pointerEvents = 'auto';
      }
    }
  },

  bindEvents() {
    // Listen for sidebar nav clicks
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-view]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        this.switchView(view);
      });
    });

    // Sidebar activity toggle - triggers drawer instead of routing
    const activityToggle = document.getElementById('sidebar-activity-toggle');
    if (activityToggle) {
      activityToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const drawer = document.getElementById('activity-drawer');
        if (drawer) drawer.classList.add('open');
      });
    }

    // Subscribe to state change notifications from taskManager to trigger updates on the current view
    taskManager.subscribe(({ tasks }) => {
      if (this.currentView === 'kanban') {
        board.render(tasks);
      } else if (this.currentView === 'dashboard') {
        analytics.render(tasks);
      } else if (this.currentView === 'calendar') {
        calendar.render(tasks);
      }
    });
  }
};

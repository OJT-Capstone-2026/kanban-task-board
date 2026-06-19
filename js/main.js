import { theme } from './modules/theme.js';
import { taskManager } from './modules/taskManager.js';
import { board } from './modules/board.js';
import { dragdrop } from './modules/dragdrop.js';
import { search } from './modules/search.js';
import { filters } from './modules/filters.js';
import { stats } from './modules/stats.js';
import { activity } from './modules/activity.js';
import { modal } from './modules/modal.js';
import { viewManager } from './modules/viewManager.js';
import { calendar } from './modules/calendar.js';
import { settings } from './modules/settings.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme Engine (sets class to HTML quickly to avoid light flashes)
  theme.init();

  // 2. Initialize Data Store
  taskManager.init();

  // 3. Initialize Board and Drag/Drop Systems
  board.init();
  dragdrop.init();

  // 4. Initialize Analytics Panel
  stats.init();

  // 5. Initialize Activity Logs and Sidebars
  activity.init();

  // 6. Hook Filters, Search, and Form Modals
  filters.init();
  search.init();
  modal.init();

  // 7. Initialize Calendar, Settings, and SPA Routing
  calendar.init();
  settings.init();
  viewManager.init();

  // Setup mobile-specific layout bindings
  setupMobileSidebar();

  // Log successful loading sequence
  console.log('TaskFlow Pro - Enterprise Kanban Board Bootstrapped Successfully.');
});

function setupMobileSidebar() {
  const toggleBtn = document.getElementById('mobile-sidebar-toggle');
  const nav = document.querySelector('.sidebar-nav');
  const footer = document.querySelector('.sidebar-footer');
  
  if (toggleBtn && nav && footer) {
    toggleBtn.addEventListener('click', () => {
      const isVisible = window.getComputedStyle(nav).display !== 'none';
      if (isVisible) {
        nav.style.display = 'none';
        footer.style.display = 'none';
      } else {
        nav.style.display = 'flex';
        footer.style.display = 'flex';
      }
    });
  }
}

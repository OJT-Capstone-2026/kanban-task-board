import { taskManager } from './taskManager.js';

export const activity = {
  init() {
    // Subscribe to state changes to update the activity feed
    taskManager.subscribe(({ activityLog }) => this.render(activityLog));
    
    // Bind drawer open/close toggles
    this.bindDrawerEvents();

    // Initial render
    this.render(taskManager.activityLog);
  },

  bindDrawerEvents() {
    const toggleBtn = document.getElementById('activity-toggle-btn');
    const closeBtn = document.getElementById('activity-close-btn');
    const drawer = document.getElementById('activity-drawer');

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        drawer.classList.add('open');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    }

    // Close on ESC key press
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
      }
    });
  },

  getRelativeTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  },

  render(activityLog) {
    const listContainer = document.getElementById('activity-list-container');
    if (!listContainer) return;

    if (!activityLog || activityLog.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: var(--spacing-xl) 0; color: var(--text-tertiary);">
          <i class="fas fa-history" style="font-size: 1.5rem; opacity: 0.3; margin-bottom: 8px;"></i>
          <p style="font-size: 0.8rem;">No activity logged yet</p>
        </div>
      `;
      return;
    }

    const actionIcons = {
      create: 'fa-plus',
      update: 'fa-pen',
      move: 'fa-exchange-alt',
      delete: 'fa-trash-alt'
    };

    listContainer.innerHTML = activityLog.map(item => {
      const icon = actionIcons[item.actionType] || 'fa-info-circle';
      const timeStr = this.getRelativeTime(item.timestamp);
      
      return `
        <div class="activity-item">
          <div class="activity-icon-container ${item.actionType}">
            <i class="fas ${icon}"></i>
          </div>
          <div class="activity-detail">
            <div class="activity-desc">
              <strong>${item.taskTitle}</strong> ${item.details ? ` - ${item.details}` : ''}
            </div>
            <div class="activity-time" data-timestamp="${item.timestamp}">${timeStr}</div>
          </div>
        </div>
      `;
    }).join('');
  }
};

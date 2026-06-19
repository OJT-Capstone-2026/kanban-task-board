import { taskManager } from './taskManager.js';
import { dragdrop } from './dragdrop.js';
import { modal } from './modal.js';

export const board = {
  currentFilters: {
    searchQuery: '',
    priority: '',
    assignee: ''
  },
  renderedCardIds: new Set(), // Track rendered card IDs for new task animations

  init() {
    // Subscribe to task state changes
    taskManager.subscribe(({ tasks }) => this.render(tasks));

    // Bind filter control inputs
    this.bindFilterEvents();
    
    // Bind mobile column navigation tabs
    this.bindMobileTabs();

    // Initial render
    this.render(taskManager.getTasks());
  },

  setFilter(key, value) {
    this.currentFilters[key] = value;
    this.render(taskManager.getTasks());
  },

  clearFilters() {
    this.currentFilters = {
      searchQuery: '',
      priority: '',
      assignee: ''
    };

    // Reset dropdown elements if present
    const prioritySelect = document.getElementById('filter-priority');
    const assigneeSelect = document.getElementById('filter-assignee');
    const searchInput = document.getElementById('global-search');
    
    if (prioritySelect) prioritySelect.value = '';
    if (assigneeSelect) assigneeSelect.value = '';
    if (searchInput) searchInput.value = '';

    this.render(taskManager.getTasks());
  },

  bindFilterEvents() {
    const prioritySelect = document.getElementById('filter-priority');
    const assigneeSelect = document.getElementById('filter-assignee');
    const clearBtn = document.getElementById('clear-filters-btn');

    if (prioritySelect) {
      prioritySelect.addEventListener('change', (e) => this.setFilter('priority', e.target.value));
    }
    if (assigneeSelect) {
      assigneeSelect.addEventListener('change', (e) => this.setFilter('assignee', e.target.value));
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearFilters());
    }
  },

  bindMobileTabs() {
    const tabBtns = document.querySelectorAll('.mobile-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetStatus = btn.dataset.status;
        const columns = document.querySelectorAll('.board-column');
        columns.forEach(col => {
          if (col.dataset.status === targetStatus) {
            col.classList.add('mobile-visible');
          } else {
            col.classList.remove('mobile-visible');
          }
        });
      });
    });
  },

  // Generates avatar markup based on assignee name
  getAvatarMarkup(name) {
    if (!name || name === 'Unassigned') {
      return `<div class="assignee-avatar-mini" style="background: var(--text-tertiary);" title="Unassigned"><i class="fas fa-user"></i></div>`;
    }
    
    const parts = name.split(' ');
    const initials = parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
    
    // Generate beautiful deterministic gradient based on name hash
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    const gradient = `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${(hue + 40) % 360}, 75%, 45%))`;

    return `<div class="assignee-avatar-mini" style="background: ${gradient};" title="${name}">${initials}</div>`;
  },

  createCardElement(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.id = task.id;
    
    // Add entry animation if task is newly loaded in this session
    if (!this.renderedCardIds.has(task.id)) {
      card.classList.add('new-task-anim');
      this.renderedCardIds.add(task.id);
      // Remove class after animation finishes
      setTimeout(() => card.classList.remove('new-task-anim'), 600);
    }

    // Determine overdue status
    let dueDateHtml = '';
    if (task.dueDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const due = new Date(task.dueDate);
      due.setHours(0,0,0,0);
      
      const isOverdue = due < today && task.status !== 'done';
      const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      dueDateHtml = `
        <div class="card-due-date ${isOverdue ? 'overdue' : ''}">
          <i class="far fa-calendar-alt"></i>
          <span>${formattedDate}${isOverdue ? ' (Overdue)' : ''}</span>
        </div>
      `;
    }

    // Compute subtasks stats
    let subtasksHtml = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const total = task.subtasks.length;
      const completed = task.subtasks.filter(s => s.completed).length;
      const percentage = Math.round((completed / total) * 100);

      subtasksHtml = `
        <div class="card-subtasks-wrapper">
          <div class="subtasks-label-row">
            <span><i class="fas fa-check-square"></i> Subtasks</span>
            <span>${completed}/${total} (${percentage}%)</span>
          </div>
          <div class="subtasks-progress-bar-bg">
            <div class="subtasks-progress-bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }

    // Generate tags list HTML
    const tagsHtml = (task.tags || []).map(tag => `<span class="card-tag">${tag}</span>`).join('');

    card.innerHTML = `
      <div class="card-header-row">
        <div class="card-tags">${tagsHtml}</div>
        <span class="priority-badge ${task.priority}">
          <i class="fas fa-circle"></i> ${task.priority}
        </span>
      </div>
      <h4 class="card-title">${task.title}</h4>
      <p class="card-description">${task.description || 'No description provided.'}</p>
      ${subtasksHtml}
      <div class="card-footer-row">
        ${dueDateHtml || '<div></div>'}
        <div class="card-assignee-box">
          ${this.getAvatarMarkup(task.assignee)}
        </div>
      </div>
    `;

    // Click handler to open edit task dialog
    card.addEventListener('click', (e) => {
      // Don't trigger edit modal if user was clicking buttons or dragging
      if (e.target.closest('.assignee-avatar-mini') || card.classList.contains('dragging')) return;
      window.dispatchEvent(new CustomEvent('edit-task-request', { detail: { taskId: task.id } }));
    });

    return card;
  },

  render(tasks) {
    // 1. Check for board-wide empty state (no tasks at all in workspace)
    const allTasks = taskManager.getTasks();
    const emptyStateEl = document.getElementById('board-empty-state');
    const columnsContainerEl = document.querySelector('.board-columns-container');

    if (allTasks.length === 0) {
      if (emptyStateEl) {
        emptyStateEl.style.display = 'flex';
        // Bind create button once
        const btn = document.getElementById('btn-empty-state-create');
        if (btn && !btn.dataset.bound) {
          btn.dataset.bound = 'true';
          btn.addEventListener('click', () => {
            modal.openCreateModal();
          });
        }
      }
      if (columnsContainerEl) columnsContainerEl.style.display = 'none';

      // Update count badges to 0
      document.querySelectorAll('.column-count-badge').forEach(b => b.textContent = '0');
      document.querySelectorAll('.mobile-tab-btn .tab-count').forEach(b => b.textContent = '0');

      window.dispatchEvent(new CustomEvent('boardrendered', { detail: { tasks: [] } }));
      return;
    } else {
      if (emptyStateEl) emptyStateEl.style.display = 'none';
      if (columnsContainerEl) columnsContainerEl.style.display = 'flex';
    }

    const columns = {
      todo: document.querySelector('[data-status="todo"] .cards-list'),
      inprogress: document.querySelector('[data-status="inprogress"] .cards-list'),
      done: document.querySelector('[data-status="done"] .cards-list')
    };

    // Make sure DOM has columns loaded
    if (!columns.todo || !columns.inprogress || !columns.done) return;

    // Clear all columns
    Object.keys(columns).forEach(status => {
      columns[status].innerHTML = '';
    });

    // Apply filters
    const filteredTasks = tasks.filter(task => {
      // Search filter
      const searchMatch = !this.currentFilters.searchQuery || 
        task.title.toLowerCase().includes(this.currentFilters.searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(this.currentFilters.searchQuery.toLowerCase()) ||
        (task.tags || []).some(t => t.toLowerCase().includes(this.currentFilters.searchQuery.toLowerCase()));

      // Priority filter
      const priorityMatch = !this.currentFilters.priority || task.priority === this.currentFilters.priority;

      // Assignee filter
      const assigneeMatch = !this.currentFilters.assignee || task.assignee === this.currentFilters.assignee;

      return searchMatch && priorityMatch && assigneeMatch;
    });

    // Group tasks by status
    const grouped = { todo: [], inprogress: [], done: [] };
    filteredTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    // Render cards and update metrics count
    Object.keys(columns).forEach(status => {
      const container = columns[status];
      const columnTasks = grouped[status];
      
      // Update count badge
      const countBadge = document.querySelector(`[data-status="${status}"] .column-count-badge`);
      if (countBadge) countBadge.textContent = columnTasks.length;

      // Update mobile tab counts
      const mobileTabBadge = document.querySelector(`.mobile-tab-btn[data-status="${status}"] .tab-count`);
      if (mobileTabBadge) mobileTabBadge.textContent = columnTasks.length;

      if (columnTasks.length === 0) {
        // Empty State Render
        container.innerHTML = `
          <div class="column-empty-state">
            <i class="fas fa-clipboard-list"></i>
            <div class="column-empty-text">No tasks matches</div>
          </div>
        `;
      } else {
        columnTasks.forEach(task => {
          const card = this.createCardElement(task);
          container.appendChild(card);
          dragdrop.makeDraggable(card); // Hook drag events

          // Apply drop bounce animation if this was recently dropped
          if (dragdrop.recentlyDroppedCardId === task.id) {
            card.classList.add('drop-bounce-anim');
            dragdrop.recentlyDroppedCardId = null; // Clear so it only triggers once
            setTimeout(() => {
              card.classList.remove('drop-bounce-anim');
            }, 600);
          }
        });
      }
    });

    // Let the rest of the application know the board rendered (stats update, filters options update, etc.)
    window.dispatchEvent(new CustomEvent('boardrendered', { detail: { tasks: filteredTasks } }));
  }
};

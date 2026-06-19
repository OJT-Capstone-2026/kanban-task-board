import { taskManager } from './taskManager.js';

export const modal = {
  currentEditingTaskId: null,
  modalSubtasks: [], // Local state for subtasks currently in the form
  deletingTaskId: null,

  init() {
    this.bindEvents();
    this.bindShortcuts();
    this.bindCommandPalette();
  },

  // --- MODAL CONTROLS ---
  openCreateModal(prefillData = {}) {
    this.currentEditingTaskId = null;
    this.modalSubtasks = [];
    this.prefilledStatus = prefillData.status || null;
    
    const modalEl = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const titleText = document.getElementById('modal-title-text');
    
    if (form) form.reset();
    if (titleText) titleText.textContent = 'Create New Task';
    
    this.renderModalSubtasks();
    this.clearErrors();

    // Prefill fields
    if (prefillData.dueDate) {
      const dueDateInput = document.getElementById('task-due-date-input');
      if (dueDateInput) dueDateInput.value = prefillData.dueDate;
    }
    
    // Reset tags input
    const tagsInput = document.getElementById('task-tags-input');
    if (tagsInput) tagsInput.value = '';

    // Hide delete button in create mode
    const deleteBtn = document.getElementById('btn-delete-task');
    if (deleteBtn) deleteBtn.style.display = 'none';

    if (modalEl) modalEl.classList.add('open');
    
    // Focus title input
    setTimeout(() => {
      const titleInput = document.getElementById('task-title-input');
      if (titleInput) titleInput.focus();
    }, 100);
  },

  openEditModal(taskId) {
    const task = taskManager.getTask(taskId);
    if (!task) return;

    this.currentEditingTaskId = taskId;
    this.modalSubtasks = JSON.parse(JSON.stringify(task.subtasks || [])); // Deep clone
    
    const modalEl = document.getElementById('task-modal');
    const titleText = document.getElementById('modal-title-text');
    if (titleText) titleText.textContent = 'Edit Task Details';
    
    this.clearErrors();

    // Populate inputs
    document.getElementById('task-title-input').value = task.title;
    document.getElementById('task-desc-input').value = task.description || '';
    document.getElementById('task-priority-input').value = task.priority || 'medium';
    document.getElementById('task-due-date-input').value = task.dueDate || '';
    document.getElementById('task-assignee-input').value = task.assignee || '';
    document.getElementById('task-tags-input').value = (task.tags || []).join(', ');

    this.renderModalSubtasks();

    // Show delete button in edit mode
    const deleteBtn = document.getElementById('btn-delete-task');
    if (deleteBtn) deleteBtn.style.display = 'inline-flex';

    if (modalEl) modalEl.classList.add('open');
  },

  closeModal() {
    const modalEl = document.getElementById('task-modal');
    if (modalEl) modalEl.classList.remove('open');
    this.currentEditingTaskId = null;
    this.modalSubtasks = [];
  },

  openDeleteConfirmModal(taskId) {
    this.deletingTaskId = taskId;
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) deleteModal.classList.add('open');
  },

  closeDeleteConfirmModal() {
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) deleteModal.classList.remove('open');
    this.deletingTaskId = null;
  },

  // --- SUBTASK BUILDER LOGIC ---
  addSubtask() {
    const input = document.getElementById('new-subtask-input');
    if (!input) return;

    const title = input.value.trim();
    if (!title) return;

    const newSub = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      completed: false
    };

    this.modalSubtasks.push(newSub);
    input.value = '';
    input.focus();
    this.renderModalSubtasks();
  },

  toggleSubtask(subId) {
    const sub = this.modalSubtasks.find(s => s.id === subId);
    if (sub) {
      sub.completed = !sub.completed;
      this.renderModalSubtasks();
    }
  },

  deleteSubtask(subId) {
    this.modalSubtasks = this.modalSubtasks.filter(s => s.id !== subId);
    this.renderModalSubtasks();
  },

  renderModalSubtasks() {
    const list = document.getElementById('modal-subtasks-list');
    if (!list) return;

    if (this.modalSubtasks.length === 0) {
      list.innerHTML = `<div style="text-align:center;font-size:0.75rem;color:var(--text-tertiary);padding:4px 0;">No subtasks added yet.</div>`;
      return;
    }

    list.innerHTML = this.modalSubtasks.map(sub => `
      <div class="subtask-chip-item ${sub.completed ? 'completed' : ''}">
        <span>${sub.title}</span>
        <div class="subtask-chip-actions">
          <button type="button" class="subtask-chip-btn check" data-action="toggle" data-id="${sub.id}" title="Toggle status">
            <i class="fas ${sub.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
          </button>
          <button type="button" class="subtask-chip-btn" data-action="delete" data-id="${sub.id}" title="Delete subtask">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Bind item action clicks
    list.querySelectorAll('.subtask-chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const subId = btn.dataset.id;
        if (action === 'toggle') this.toggleSubtask(subId);
        if (action === 'delete') this.deleteSubtask(subId);
      });
    });
  },

  // --- FORM VALIDATION & SUBMIT ---
  validateForm() {
    let isValid = true;
    this.clearErrors();

    const titleInput = document.getElementById('task-title-input');
    if (!titleInput.value.trim()) {
      titleInput.closest('.form-group').classList.add('error');
      isValid = false;
    }

    return isValid;
  },

  clearErrors() {
    document.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));
  },

  handleFormSubmit(e) {
    if (e) e.preventDefault();

    if (!this.validateForm()) return;

    const title = document.getElementById('task-title-input').value;
    const description = document.getElementById('task-desc-input').value;
    const priority = document.getElementById('task-priority-input').value;
    const dueDate = document.getElementById('task-due-date-input').value;
    const assigneeInput = document.getElementById('task-assignee-input').value.trim();
    const assignee = assigneeInput || 'Unassigned';
    
    const tagsInput = document.getElementById('task-tags-input').value;
    const tags = tagsInput
      ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const taskData = {
      title,
      description,
      priority,
      dueDate,
      assignee,
      tags,
      subtasks: this.modalSubtasks
    };

    if (this.currentEditingTaskId) {
      // Update Mode
      const updated = taskManager.updateTask(this.currentEditingTaskId, taskData);
      if (updated) this.showToast('success', 'Task Updated', `Saved changes to "${updated.title}"`);
    } else {
      // Create Mode
      taskData.status = this.prefilledStatus || 'todo';
      const added = taskManager.addTask(taskData);
      if (added) this.showToast('success', 'Task Created', `Added new task "${added.title}"`);
    }

    this.closeModal();
  },

  handleConfirmDelete() {
    if (!this.deletingTaskId) return;

    const task = taskManager.getTask(this.deletingTaskId);
    const title = task ? task.title : 'Task';

    // Query card element in DOM for deletion animation
    const cardEl = document.querySelector(`.task-card[data-id="${this.deletingTaskId}"]`);
    
    if (cardEl) {
      cardEl.classList.add('delete-task-anim');
      setTimeout(() => {
        taskManager.deleteTask(this.deletingTaskId);
        this.showToast('danger', 'Task Deleted', `Removed "${title}" permanently.`);
        this.closeDeleteConfirmModal();
        this.closeModal(); // Close main modal too if it was open
      }, 300);
    } else {
      taskManager.deleteTask(this.deletingTaskId);
      this.showToast('danger', 'Task Deleted', `Removed "${title}" permanently.`);
      this.closeDeleteConfirmModal();
      this.closeModal();
    }
  },

  // --- TOAST NOTIFICATIONS ---
  showToast(type, title, message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      danger: 'fa-trash-alt'
    };
    const icon = icons[type] || 'fa-info-circle';

    toast.innerHTML = `
      <i class="fas ${icon}" style="font-size: 1.2rem;"></i>
      <div>
        <strong style="display:block; font-size:0.85rem;">${title}</strong>
        <span style="font-size:0.75rem; color:var(--text-secondary);">${message}</span>
      </div>
    `;

    container.appendChild(toast);

    // Auto-remove toast
    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  },

  // --- COMMAND PALETTE OVERLAY SYSTEM ---
  bindCommandPalette() {
    const overlay = document.getElementById('cmd-palette-overlay');
    const input = document.getElementById('cmd-search-input');
    const list = document.getElementById('cmd-list-container');
    if (!overlay || !input || !list) return;

    // Toggle Command Palette on Cmd+Shift+K or Ctrl+Shift+K
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggleCommandPalette();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.toggleCommandPalette(false);
    });

    input.addEventListener('input', () => this.filterCommandPaletteOptions());

    // Navigation and Action binding within Command Palette
    input.addEventListener('keydown', (e) => {
      const items = list.querySelectorAll('.cmd-item');
      if (items.length === 0) return;

      let selectedIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedIndex !== -1) items[selectedIndex].classList.remove('selected');
        selectedIndex = (selectedIndex + 1) % items.length;
        items[selectedIndex].classList.add('selected');
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedIndex !== -1) items[selectedIndex].classList.remove('selected');
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        items[selectedIndex].classList.add('selected');
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex !== -1) {
          items[selectedIndex].click();
        }
      }
    });
  },

  toggleCommandPalette(forceState = null) {
    const overlay = document.getElementById('cmd-palette-overlay');
    const input = document.getElementById('cmd-search-input');
    if (!overlay) return;

    const isOpen = forceState !== null ? forceState : !overlay.classList.contains('open');

    if (isOpen) {
      overlay.classList.add('open');
      input.value = '';
      this.populateCommandPalette();
      setTimeout(() => input.focus(), 100);
    } else {
      overlay.classList.remove('open');
    }
  },

  populateCommandPalette() {
    const list = document.getElementById('cmd-list-container');
    if (!list) return;

    const commands = [
      { name: 'Create New Task', icon: 'fa-plus', shortcut: 'N', action: () => this.openCreateModal() },
      { name: 'View Active Tasks (Kanban)', icon: 'fa-columns', shortcut: '', action: () => {} },
      { name: 'Open Activity Timeline', icon: 'fa-history', shortcut: '', action: () => document.getElementById('activity-toggle-btn').click() },
      { name: 'Toggle Dark / Light Theme', icon: 'fa-adjust', shortcut: '', action: () => document.getElementById('theme-toggle-btn').click() },
      { name: 'Clear Active Board Filters', icon: 'fa-filter-slash', shortcut: '', action: () => document.getElementById('clear-filters-btn').click() }
    ];

    // Add search index for tasks themselves
    const tasks = taskManager.getTasks();
    tasks.forEach(t => {
      commands.push({
        name: `Open Task: "${t.title}"`,
        icon: 'fa-tasks',
        shortcut: t.priority.toUpperCase(),
        action: () => this.openEditModal(t.id)
      });
    });

    list.innerHTML = commands.map((c, i) => `
      <div class="cmd-item ${i === 0 ? 'selected' : ''}" data-index="${i}">
        <div class="cmd-item-left">
          <i class="fas ${c.icon}"></i>
          <span>${c.name}</span>
        </div>
        ${c.shortcut ? `<span class="cmd-item-kbd">${c.shortcut}</span>` : ''}
      </div>
    `).join('');

    // Add click listeners to items
    const items = list.querySelectorAll('.cmd-item');
    items.forEach((item, idx) => {
      item.addEventListener('click', () => {
        this.toggleCommandPalette(false);
        commands[idx].action();
      });
      
      item.addEventListener('mouseenter', () => {
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      });
    });
  },

  filterCommandPaletteOptions() {
    const input = document.getElementById('cmd-search-input');
    const list = document.getElementById('cmd-list-container');
    if (!input || !list) return;

    const query = input.value.toLowerCase().trim();
    const items = list.querySelectorAll('.cmd-item');

    let hasSelected = false;

    items.forEach(item => {
      const text = item.querySelector('span').textContent.toLowerCase();
      const match = text.includes(query);
      item.style.display = match ? 'flex' : 'none';
      item.classList.remove('selected');
      
      if (match && !hasSelected) {
        item.classList.add('selected');
        hasSelected = true;
      }
    });
  },

  // --- SHORTCUTS BINDINGS ---
  bindShortcuts() {
    window.addEventListener('keydown', (e) => {
      const activeElement = document.activeElement;
      const isInputFocused = activeElement.tagName === 'INPUT' || 
                             activeElement.tagName === 'TEXTAREA' || 
                             activeElement.tagName === 'SELECT';

      // 1. ESC key: Close modals/menus
      if (e.key === 'Escape') {
        const modalEl = document.getElementById('task-modal');
        const deleteModal = document.getElementById('delete-modal');
        const cmdPalette = document.getElementById('cmd-palette-overlay');
        
        if (cmdPalette && cmdPalette.classList.contains('open')) {
          e.preventDefault();
          this.toggleCommandPalette(false);
        } else if (deleteModal && deleteModal.classList.contains('open')) {
          e.preventDefault();
          this.closeDeleteConfirmModal();
        } else if (modalEl && modalEl.classList.contains('open')) {
          e.preventDefault();
          this.closeModal();
        }
      }

      // 2. 'N' key (when not typing in form): Open Create Modal
      if (e.key.toLowerCase() === 'n' && !isInputFocused && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        this.openCreateModal();
      }

      // 3. CTRL+S or CMD+S (when modal is open): Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        const modalEl = document.getElementById('task-modal');
        if (modalEl && modalEl.classList.contains('open')) {
          e.preventDefault();
          this.handleFormSubmit();
        }
      }
    });

    // Custom requests sent by board.js click on task cards
    window.addEventListener('edit-task-request', (e) => {
      if (e.detail && e.detail.taskId) {
        this.openEditModal(e.detail.taskId);
      }
    });
  },

  bindEvents() {
    const createBtn = document.getElementById('create-task-btn');
    const colCreateBtns = document.querySelectorAll('.btn-add-task-col');
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelFormBtn = document.getElementById('btn-cancel-task');
    const form = document.getElementById('task-form');
    const deleteBtn = document.getElementById('btn-delete-task');
    const confirmDeleteBtn = document.getElementById('btn-confirm-delete');
    const cancelDeleteBtn = document.getElementById('btn-cancel-delete');
    const addSubtaskBtn = document.getElementById('btn-add-subtask');
    const newSubtaskInput = document.getElementById('new-subtask-input');

    if (createBtn) {
      createBtn.addEventListener('click', () => this.openCreateModal());
    }

    colCreateBtns.forEach(btn => {
      btn.addEventListener('click', () => this.openCreateModal());
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (cancelFormBtn) {
      cancelFormBtn.addEventListener('click', () => this.closeModal());
    }

    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (this.currentEditingTaskId) {
          this.openDeleteConfirmModal(this.currentEditingTaskId);
        }
      });
    }

    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => this.handleConfirmDelete());
    }

    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', () => this.closeDeleteConfirmModal());
    }

    if (addSubtaskBtn) {
      addSubtaskBtn.addEventListener('click', () => this.addSubtask());
    }

    if (newSubtaskInput) {
      newSubtaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault(); // Stop form submission
          this.addSubtask();
        }
      });
    }
  }
};

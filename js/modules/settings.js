import { taskManager } from './taskManager.js';
import { initialTasks } from '../data/initialTasks.js';
import { modal } from './modal.js';

export const settings = {
  init() {
    this.bindEvents();
    this.loadWorkspaceName();
  },

  render() {
    // Populate Workspace Name Input
    const workspaceInput = document.getElementById('settings-workspace-name');
    if (workspaceInput) {
      const storedName = localStorage.getItem('taskflow_workspace_name') || 'TaskFlow Pro';
      workspaceInput.value = storedName;
    }
  },

  loadWorkspaceName() {
    const storedName = localStorage.getItem('taskflow_workspace_name') || 'TaskFlow Pro';
    this.updateWorkspaceNameUI(storedName);
  },

  updateWorkspaceNameUI(name) {
    // Update logo span
    const logoSpan = document.querySelector('.logo span');
    if (logoSpan) logoSpan.textContent = name;

    // Update hero h2
    const heroH2 = document.querySelector('.hero-info h2');
    if (heroH2) heroH2.textContent = name.toUpperCase();
  },

  bindEvents() {
    // 1. Rename Workspace Name Form Submit
    const form = document.getElementById('settings-workspace-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('settings-workspace-name');
        if (input) {
          const newName = input.value.trim();
          if (newName) {
            localStorage.setItem('taskflow_workspace_name', newName);
            this.updateWorkspaceNameUI(newName);
            modal.showToast('success', 'Workspace Renamed', `Title updated to "${newName}"`);
          }
        }
      });
    }

    // 2. Export Data Button
    const exportBtn = document.getElementById('btn-settings-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = {
          tasks: taskManager.getTasks(),
          activityLog: taskManager.activityLog
        };
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `taskflow-pro-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 0);
        modal.showToast('success', 'Export Completed', 'JSON backup file successfully generated.');
      });
    }

    // 3. Import Data File Input Selection
    const importInput = document.getElementById('settings-import-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            let tasksToSet = [];
            let activityToSet = [];

            // Support object wrapped backup or plain tasks array
            if (importedData && Array.isArray(importedData.tasks)) {
              tasksToSet = importedData.tasks;
              activityToSet = importedData.activityLog || [];
            } else if (Array.isArray(importedData)) {
              tasksToSet = importedData;
            } else {
              throw new Error('Invalid JSON schema');
            }

            // Simple validation: check if items look like tasks
            const isValid = tasksToSet.every(t => typeof t === 'object' && t.id && t.title && t.status);
            if (!isValid && tasksToSet.length > 0) {
              throw new Error('Tasks are missing required schema fields');
            }

            taskManager.setTasksAndActivity(tasksToSet, activityToSet);
            modal.showToast('success', 'Import Successful', `Restored ${tasksToSet.length} tasks and ${activityToSet.length} activities.`);
            
            // Clear input selection
            importInput.value = '';
          } catch (err) {
            console.error('Import error:', err);
            modal.showToast('danger', 'Import Failed', 'Selected file is not a valid TaskFlow Pro JSON backup.');
            importInput.value = '';
          }
        };
        reader.readAsText(file);
      });
    }

    // 4. Restore Defaults (Seed) Button
    const seedBtn = document.getElementById('btn-settings-seed');
    if (seedBtn) {
      seedBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to restore the default workspace tasks? This will overwrite current tasks.')) {
          taskManager.setTasksAndActivity(initialTasks, []);
          modal.showToast('success', 'Database Restored', 'Seeded default tasks successfully.');
        }
      });
    }

    // 5. Clear Activity Logs Button
    const clearLogsBtn = document.getElementById('btn-settings-clear-logs');
    if (clearLogsBtn) {
      clearLogsBtn.addEventListener('click', () => {
        if (confirm('Clear activity logs timeline history permanently?')) {
          taskManager.clearActivity();
          modal.showToast('warning', 'Logs Cleared', 'Activity history has been cleared.');
        }
      });
    }

    // 6. Hard Wipe database
    const resetBtn = document.getElementById('btn-settings-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('WARNING: This will permanently delete all tasks, history logs, theme choices, and workspace settings. Proceed with hard wipe?')) {
          localStorage.clear();
          taskManager.setTasksAndActivity([], []);
          this.loadWorkspaceName(); // reset title back to default
          modal.showToast('danger', 'Database Wiped', 'All localStorage data was deleted.');
        }
      });
    }
  }
};

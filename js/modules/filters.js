import { taskManager } from './taskManager.js';

export const filters = {
  init() {
    // Listen to when the board renders to update available filter items
    window.addEventListener('boardrendered', () => {
      this.populateAssignees();
    });
  },

  populateAssignees() {
    const assigneeSelect = document.getElementById('filter-assignee');
    if (!assigneeSelect) return;

    // Get current value to preserve selection
    const currentValue = assigneeSelect.value;

    // Get unique list of assignees from the current task list
    const tasks = taskManager.getTasks();
    const assignees = new Set(tasks.map(t => t.assignee).filter(Boolean));

    // Reset list and add default option
    assigneeSelect.innerHTML = '<option value="">All Assignees</option>';

    // Sort and append assignees
    Array.from(assignees).sort().forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      if (name === currentValue) {
        option.selected = true;
      }
      assigneeSelect.appendChild(option);
    });
  }
};

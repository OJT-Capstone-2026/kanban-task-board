import { taskManager } from './taskManager.js';
import { modal } from './modal.js';

export const calendar = {
  currentDate: new Date(),

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const prevBtn = document.getElementById('btn-cal-prev');
    const nextBtn = document.getElementById('btn-cal-next');
    const todayBtn = document.getElementById('btn-cal-today');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.currentDate = new Date();
        this.render();
      });
    }
  },

  render(tasks) {
    if (!tasks) tasks = taskManager.getTasks();

    const grid = document.getElementById('calendar-days-grid');
    const monthYearLabel = document.getElementById('calendar-month-year');
    if (!grid || !monthYearLabel) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Set Month Year Label
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    monthYearLabel.textContent = `${monthNames[month]} ${year}`;

    // Clear grid
    grid.innerHTML = '';

    // Calculate dates
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    // 42 slots in grid (6 weeks)
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < 42; i++) {
      const cell = document.createElement('div');
      cell.classList.add('calendar-day-cell');

      let dayNum;
      let cellDate = new Date(year, month, 1);

      if (i < firstDayIndex) {
        // Prev Month padding
        dayNum = prevTotalDays - (firstDayIndex - i - 1);
        cell.classList.add('outside-month');
        cellDate = new Date(year, month - 1, dayNum);
      } else if (i < firstDayIndex + totalDays) {
        // Current Month
        dayNum = i - firstDayIndex + 1;
        cellDate = new Date(year, month, dayNum);
        
        // Highlight today
        if (cellDate.getDate() === today.getDate() && 
            cellDate.getMonth() === today.getMonth() && 
            cellDate.getFullYear() === today.getFullYear()) {
          cell.classList.add('today');
        }
      } else {
        // Next Month padding
        dayNum = i - (firstDayIndex + totalDays) + 1;
        cell.classList.add('outside-month');
        cellDate = new Date(year, month + 1, dayNum);
      }

      // Day Number Label
      const label = document.createElement('span');
      label.classList.add('day-number');
      label.textContent = dayNum;
      cell.appendChild(label);

      // Format Date Key (YYYY-MM-DD)
      const yr = cellDate.getFullYear();
      const mo = String(cellDate.getMonth() + 1).padStart(2, '0');
      const dy = String(cellDate.getDate()).padStart(2, '0');
      const dateKey = `${yr}-${mo}-${dy}`;

      cell.dataset.date = dateKey;

      // Filter tasks for this date
      const dayTasks = tasks.filter(t => t.dueDate === dateKey);

      // Render Task Chips Container
      const chipsContainer = document.createElement('div');
      chipsContainer.classList.add('calendar-chips-container');

      dayTasks.forEach(task => {
        const chip = document.createElement('div');
        chip.classList.add('calendar-task-chip', `priority-${task.priority}`, `status-${task.status}`);
        chip.textContent = task.title;
        chip.title = `${task.title} (${task.priority} priority - ${task.status})`;
        
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent('edit-task-request', { detail: { taskId: task.id } }));
        });

        chipsContainer.appendChild(chip);
      });

      cell.appendChild(chipsContainer);

      // Click cell to create new task
      cell.addEventListener('click', (e) => {
        // If clicked on day cell but not chip, trigger create modal
        if (e.target.closest('.calendar-task-chip')) return;
        modal.openCreateModal({ dueDate: dateKey });
      });

      grid.appendChild(cell);
    }
  }
};

import { taskManager } from './taskManager.js';

export const stats = {
  previousValues: {
    total: 0,
    active: 0,
    completionRate: 0,
    productivity: 0
  },

  init() {
    // Listen to board renderings to update statistics
    window.addEventListener('boardrendered', () => {
      this.updateStats();
    });

    this.updateStats();
  },

  updateStats() {
    const tasks = taskManager.getTasks();
    const total = tasks.length;
    
    // Active Projects: unique tags in tasks that are not done
    const activeTags = new Set();
    tasks.filter(t => t.status !== 'done').forEach(t => {
      if (t.tags) t.tags.forEach(tag => activeTags.add(tag));
    });
    const activeProjects = activeTags.size || 0;

    // Completion Rate: Done tasks / Total tasks
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    // Team Productivity: Completed subtasks / Total subtasks across all active tasks
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    tasks.forEach(t => {
      if (t.subtasks && t.subtasks.length > 0) {
        totalSubtasks += t.subtasks.length;
        completedSubtasks += t.subtasks.filter(s => s.completed).length;
      }
    });
    const productivity = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    // Animate the values in the UI
    this.animateValue('stat-total-tasks', this.previousValues.total, total);
    this.animateValue('stat-active-projects', this.previousValues.active, activeProjects);
    this.animateValue('stat-completion-rate', this.previousValues.completionRate, completionRate, '%');
    this.animateValue('stat-productivity', this.previousValues.productivity, productivity, '%');

    // Update Progress Rings
    this.setProgressRing('ring-completion', completionRate);
    this.setProgressRing('ring-productivity', productivity);

    // Save current values for the next animation transition
    this.previousValues = {
      total,
      active: activeProjects,
      completionRate,
      productivity
    };
  },

  animateValue(elementId, start, end, suffix = '') {
    const obj = document.getElementById(elementId);
    if (!obj) return;
    
    if (start === end) {
      obj.textContent = `${end}${suffix}`;
      return;
    }

    // Add CSS bounce pulse animation
    obj.classList.add('counter-pulse');
    setTimeout(() => obj.classList.remove('counter-pulse'), 400);

    const duration = 800; // ms
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(start + easeProgress * (end - start));
      
      obj.textContent = `${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        obj.textContent = `${end}${suffix}`;
      }
    }

    requestAnimationFrame(updateCounter);
  },

  setProgressRing(ringId, percent) {
    const circle = document.getElementById(ringId);
    if (!circle) return;

    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    
    // Animate dashoffset
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }
};

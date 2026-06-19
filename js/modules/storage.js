import { initialTasks } from '../data/initialTasks.js';

const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks',
  ACTIVITY: 'taskflow_activity',
  THEME: 'taskflow_theme'
};

export const storage = {
  loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (data) {
        return JSON.parse(data);
      }
      // If no tasks exist, initialize with mock tasks
      this.saveTasks(initialTasks);
      return initialTasks;
    } catch (error) {
      console.error("Failed to load tasks from localStorage:", error);
      return initialTasks;
    }
  },

  saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error("Failed to save tasks to localStorage:", error);
      return false;
    }
  },

  loadActivity() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load activity log from localStorage:", error);
      return [];
    }
  },

  saveActivity(activityLog) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activityLog));
      return true;
    } catch (error) {
      console.error("Failed to save activity log to localStorage:", error);
      return false;
    }
  },

  loadTheme() {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    } catch (error) {
      console.error("Failed to load theme preference:", error);
      return 'dark';
    }
  },

  saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      return true;
    } catch (error) {
      console.error("Failed to save theme preference:", error);
      return false;
    }
  }
};

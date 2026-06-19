import { storage } from './storage.js';

export const taskManager = {
  tasks: [],
  activityLog: [],
  listeners: [], // Observer pattern subscribers

  init() {
    this.tasks = storage.loadTasks();
    this.activityLog = storage.loadActivity();
  },

  // Observer Pattern: Subscribe to updates
  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
  },

  // Notify all observers of state change
  notify() {
    this.listeners.forEach(listener => listener({
      tasks: this.tasks,
      activityLog: this.activityLog
    }));
  },

  getTasks() {
    return this.tasks;
  },

  getTask(id) {
    return this.tasks.find(t => t.id === id);
  },

  addTask(taskData) {
    const newTask = {
      id: `task-${Date.now()}`,
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      priority: taskData.priority || 'medium',
      status: taskData.status || 'todo',
      dueDate: taskData.dueDate || '',
      assignee: taskData.assignee || 'Unassigned',
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || []
    };

    this.tasks.push(newTask);
    storage.saveTasks(this.tasks);

    this.logActivity('create', newTask.title, `Assigned to ${newTask.assignee}`);
    this.notify();
    return newTask;
  },

  updateTask(id, updatedData) {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return null;

    const oldTask = this.tasks[taskIndex];
    const updatedTask = {
      ...oldTask,
      title: updatedData.title.trim(),
      description: (updatedData.description || '').trim(),
      priority: updatedData.priority,
      dueDate: updatedData.dueDate,
      assignee: updatedData.assignee,
      tags: updatedData.tags || [],
      subtasks: updatedData.subtasks || []
    };

    // If status changed in update data, apply it
    if (updatedData.status) {
      updatedTask.status = updatedData.status;
    }

    this.tasks[taskIndex] = updatedTask;
    storage.saveTasks(this.tasks);

    this.logActivity('update', updatedTask.title, `Modified properties`);
    this.notify();
    return updatedTask;
  },

  deleteTask(id) {
    const task = this.getTask(id);
    if (!task) return false;

    this.tasks = this.tasks.filter(t => t.id !== id);
    storage.saveTasks(this.tasks);

    this.logActivity('delete', task.title, `Removed permanently`);
    this.notify();
    return true;
  },

  moveTask(id, newStatus) {
    const task = this.getTask(id);
    if (!task) return false;

    const oldStatus = task.status;
    if (oldStatus === newStatus) return false;

    task.status = newStatus;
    storage.saveTasks(this.tasks);

    const formattedStatus = {
      todo: 'To Do',
      inprogress: 'In Progress',
      done: 'Done'
    };

    this.logActivity('move', task.title, `Moved from ${formattedStatus[oldStatus]} to ${formattedStatus[newStatus]}`);
    this.notify();
    return true;
  },

  logActivity(actionType, taskTitle, details) {
    const activityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      actionType, // 'create' | 'update' | 'move' | 'delete'
      taskTitle,
      details,
      timestamp: new Date().toISOString()
    };

    this.activityLog.unshift(activityItem);
    
    // Cap at 50 logs to conserve storage size
    if (this.activityLog.length > 50) {
      this.activityLog = this.activityLog.slice(0, 50);
    }

    storage.saveActivity(this.activityLog);
  },

  setTasksAndActivity(tasks, activityLog) {
    this.tasks = JSON.parse(JSON.stringify(tasks || []));
    this.activityLog = JSON.parse(JSON.stringify(activityLog || []));
    storage.saveTasks(this.tasks);
    storage.saveActivity(this.activityLog);
    this.notify();
  },

  clearActivity() {
    this.activityLog = [];
    storage.saveActivity(this.activityLog);
    this.notify();
  }
};

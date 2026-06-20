import { taskManager } from './taskManager.js';

export const analytics = {
  render(tasks) {
    if (!tasks) tasks = taskManager.getTasks();
    
    // 1. Calculate General Metrics
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const inprogress = tasks.filter(t => t.status === 'inprogress').length;
    const completed = tasks.filter(t => t.status === 'done').length;
    
    // Calculate Overdue
    const today = new Date();
    today.setHours(0,0,0,0);
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      const parts = t.dueDate.split('-');
      const due = new Date(parts[0], parts[1] - 1, parts[2]);
      due.setHours(0,0,0,0);
      return due < today;
    }).length;

    // 2. Update Stats Counter elements (with basic animation fallback or direct values)
    this.updateVal('stat-total-tasks', total);
    this.updateVal('stat-inprogress-tasks', inprogress);
    this.updateVal('stat-completed-tasks', completed);
    this.updateVal('stat-overdue-tasks', overdue);

    // 3. Render Progress Rings (Productivity Insights)
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    this.updateProgressRing('ring-completion', completionRate, 'stat-completion-rate');

    let totalSubtasks = 0;
    let completedSubtasks = 0;
    tasks.forEach(t => {
      if (t.subtasks && t.subtasks.length > 0) {
        totalSubtasks += t.subtasks.length;
        completedSubtasks += t.subtasks.filter(s => s.completed).length;
      }
    });
    const subtaskRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    this.updateProgressRing('ring-productivity', subtaskRate, 'stat-productivity');

    // 4. Productivity Bullet Summaries
    const insightTrend = document.getElementById('insight-completion-trend');
    if (insightTrend) {
      insightTrend.textContent = `${completionRate}% of workspace tasks completed`;
    }

    // Most Active User (the assignee who has completed the most tasks)
    const assigneeDoneCounts = {};
    tasks.filter(t => t.status === 'done').forEach(t => {
      const name = t.assignee || 'Unassigned';
      assigneeDoneCounts[name] = (assigneeDoneCounts[name] || 0) + 1;
    });
    let activeUser = 'None';
    let maxDone = -1;
    Object.keys(assigneeDoneCounts).forEach(name => {
      if (assigneeDoneCounts[name] > maxDone && name !== 'Unassigned') {
        maxDone = assigneeDoneCounts[name];
        activeUser = name;
      }
    });
    if (activeUser === 'None' && tasks.length > 0) {
      // Fallback: assignee with most tasks overall
      const assigneeAllCounts = {};
      tasks.forEach(t => {
        const name = t.assignee || 'Unassigned';
        assigneeAllCounts[name] = (assigneeAllCounts[name] || 0) + 1;
      });
      Object.keys(assigneeAllCounts).forEach(name => {
        if (assigneeAllCounts[name] > maxDone && name !== 'Unassigned') {
          maxDone = assigneeAllCounts[name];
          activeUser = name;
        }
      });
    }
    const insightUser = document.getElementById('insight-active-user');
    if (insightUser) {
      insightUser.textContent = activeUser !== 'None' ? `${activeUser} (${maxDone} closed)` : 'No active assignees';
    }

    // Weekly Completed Count (completed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyDone = taskManager.activityLog.filter(log => {
      if (log.actionType === 'move' && log.details.includes('Moved from') && log.details.includes('to Done')) {
        const logDate = new Date(log.timestamp);
        return logDate >= sevenDaysAgo;
      }
      return false;
    }).length;

    const insightWeekly = document.getElementById('insight-weekly-progress');
    if (insightWeekly) {
      insightWeekly.textContent = `${weeklyDone} tasks resolved this week`;
    }

    // 5. Render SVG Priority Donut Chart
    const high = tasks.filter(t => t.priority === 'high').length;
    const medium = tasks.filter(t => t.priority === 'medium').length;
    const low = tasks.filter(t => t.priority === 'low').length;

    this.updateVal('legend-count-high', high);
    this.updateVal('legend-count-medium', medium);
    this.updateVal('legend-count-low', low);
    this.updateVal('donut-total-count', total);

    const donutHigh = document.getElementById('donut-segment-high');
    const donutMedium = document.getElementById('donut-segment-medium');
    const donutLow = document.getElementById('donut-segment-low');

    if (donutHigh && donutMedium && donutLow) {
      if (total === 0) {
        donutHigh.setAttribute('stroke-dasharray', '0 100');
        donutMedium.setAttribute('stroke-dasharray', '0 100');
        donutLow.setAttribute('stroke-dasharray', '0 100');
      } else {
        const pH = (high / total) * 100;
        const pM = (medium / total) * 100;
        const pL = (low / total) * 100;

        // Cumulative offsets
        let offset = 25; // Start at top (12 o'clock is 25 in SVG circle space)
        
        donutHigh.setAttribute('stroke-dasharray', `${pH} ${100 - pH}`);
        donutHigh.setAttribute('stroke-dashoffset', `${offset}`);
        
        offset -= pH;
        donutMedium.setAttribute('stroke-dasharray', `${pM} ${100 - pM}`);
        donutMedium.setAttribute('stroke-dashoffset', `${offset}`);

        offset -= pM;
        donutLow.setAttribute('stroke-dasharray', `${pL} ${100 - pL}`);
        donutLow.setAttribute('stroke-dashoffset', `${offset}`);
      }
    }

    // 6. Render CSS Bar Chart (Status Distribution)
    const maxStatusVal = Math.max(todo, inprogress, completed, 1);
    
    this.updateVal('bar-val-todo', todo);
    this.updateVal('bar-val-inprogress', inprogress);
    this.updateVal('bar-val-done', completed);

    const fillTodo = document.getElementById('bar-fill-todo');
    const fillInprogress = document.getElementById('bar-fill-inprogress');
    const fillDone = document.getElementById('bar-fill-done');

    if (fillTodo) fillTodo.style.height = `${(todo / maxStatusVal) * 100}%`;
    if (fillInprogress) fillInprogress.style.height = `${(inprogress / maxStatusVal) * 100}%`;
    if (fillDone) fillDone.style.height = `${(completed / maxStatusVal) * 100}%`;

    // 7. Render Weekly Activity Line Graph (SVG)
    this.renderWeeklyActivityGraph();

    // 8. Render Team Performance Breakdown Table
    this.renderTeamPerformance(tasks);
  },

  updateVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  updateProgressRing(ringId, percent, textId) {
    const circle = document.getElementById(ringId);
    if (circle) {
      const radius = circle.r.baseVal.value;
      const circumference = radius * 2 * Math.PI;
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      
      const offset = circumference - (percent / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }
    
    const textEl = document.getElementById(textId);
    if (textEl) textEl.textContent = `${percent}%`;
  },

  renderWeeklyActivityGraph() {
    const svg = document.getElementById('weekly-activity-svg');
    const linePath = document.getElementById('graph-line-path');
    const areaPath = document.getElementById('graph-area-path');
    const dotsContainer = document.getElementById('graph-dots-container');
    const labelsContainer = document.getElementById('weekly-graph-labels');
    if (!svg || !linePath || !areaPath || !dotsContainer || !labelsContainer) return;

    // Generate last 7 days arrays
    const days = [];
    const counts = [];
    const dateLabels = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      days.push(d);
      
      // Get abbreviation
      dateLabels.push(dayNames[d.getDay()]);
      
      // Count activity logs for this day
      const count = taskManager.activityLog.filter(log => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0,0,0,0);
        return logDate.getTime() === d.getTime();
      }).length;
      counts.push(count);
    }

    // Set labels HTML
    labelsContainer.innerHTML = dateLabels.map(label => `<div>${label}</div>`).join('');

    // Chart dimensions
    const width = 350;
    const height = 120;
    const paddingLeft = 15;
    const paddingRight = 15;
    const plotWidth = width - paddingLeft - paddingRight;
    const maxVal = Math.max(...counts, 4); // Min ceiling of 4 for spacing

    const points = [];
    counts.forEach((c, idx) => {
      const x = paddingLeft + (idx / 6) * plotWidth;
      const y = height - 20 - (c / maxVal) * 80;
      points.push({ x, y, count: c });
    });

    // Generate Path Data
    const lineD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${lineD} L ${points[6].x} ${height - 10} L ${points[0].x} ${height - 10} Z`;

    linePath.setAttribute('d', lineD);
    areaPath.setAttribute('d', areaD);

    // Draw dots & tooltips
    dotsContainer.innerHTML = points.map((p, idx) => `
      <g class="graph-point-group" style="cursor: pointer;">
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--bg-app)" stroke="var(--accent)" stroke-width="2" class="graph-dot"></circle>
        <circle cx="${p.x}" cy="${p.y}" r="8" fill="transparent" class="graph-dot-trigger"></circle>
        <title>Day ${idx + 1}: ${p.count} actions</title>
      </g>
    `).join('');
  },

  renderTeamPerformance(tasks) {
    const tbody = document.getElementById('team-performance-tbody');
    if (!tbody) return;

    // Group assignees
    const assignees = {};
    
    // Seed standard assignees from task list
    tasks.forEach(t => {
      const name = t.assignee || 'Unassigned';
      if (!assignees[name]) {
        assignees[name] = {
          name,
          active: 0,
          completed: 0,
          totalSubtasks: 0,
          completedSubtasks: 0
        };
      }

      if (t.status === 'done') {
        assignees[name].completed++;
      } else {
        assignees[name].active++;
      }

      if (t.subtasks && t.subtasks.length > 0) {
        assignees[name].totalSubtasks += t.subtasks.length;
        assignees[name].completedSubtasks += t.subtasks.filter(s => s.completed).length;
      }
    });

    const entries = Object.values(assignees).sort((a, b) => b.completed - a.completed);

    if (entries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-tertiary);">No assignee data available yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = entries.map(u => {
      const subtaskPct = u.totalSubtasks > 0 ? Math.round((u.completedSubtasks / u.totalSubtasks) * 100) : 0;
      
      // Determine avatar deterministic gradient
      let avatarHtml = '';
      if (u.name === 'Unassigned') {
        avatarHtml = `<div class="assignee-avatar-mini" style="background: var(--text-tertiary);"><i class="fas fa-user"></i></div>`;
      } else {
        const initials = u.name.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);
        let hash = 0;
        for (let i = 0; i < u.name.length; i++) {
          hash = u.name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        const gradient = `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${(hue + 40) % 360}, 75%, 45%))`;
        avatarHtml = `<div class="assignee-avatar-mini" style="background: ${gradient};">${initials}</div>`;
      }

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              ${avatarHtml}
              <span style="font-weight: 500;">${u.name}</span>
            </div>
          </td>
          <td style="text-align: center; font-weight: 600;">${u.active}</td>
          <td style="text-align: center; font-weight: 600; color: var(--success);">${u.completed}</td>
          <td>
            <div class="table-progress-wrapper" style="display: flex; align-items: center; gap: 8px;">
              <div class="subtasks-progress-bar-bg" style="width: 80px; flex-shrink:0;">
                <div class="subtasks-progress-bar-fill" style="width: ${subtaskPct}%;"></div>
              </div>
              <span style="font-size: 0.72rem; color: var(--text-secondary); min-width: 25px;">${subtaskPct}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
};

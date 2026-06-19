export const initialTasks = [
  {
    id: "task-1",
    title: "Implement OAuth2.0 Authentication Flow",
    description: "Integrate Okta/Auth0 providers to secure access. Ensure proper session storage and token renewal workflows.",
    priority: "high",
    status: "todo",
    dueDate: "2026-06-25",
    assignee: "Marcus Vance",
    tags: ["Security", "Backend"],
    subtasks: [
      { id: "sub-1-1", title: "Configure Okta application settings", completed: true },
      { id: "sub-1-2", title: "Create JS login helper hooks", completed: false },
      { id: "sub-1-3", title: "Implement silent token refresh", completed: false }
    ]
  },
  {
    id: "task-2",
    title: "Refactor State Management & Rendering Engine",
    description: "Migrate state updates to clean observer pattern to reduce DOM manipulation. Build dynamic render cache.",
    priority: "medium",
    status: "inprogress",
    dueDate: "2026-06-22",
    assignee: "Sienna Brooks",
    tags: ["Refactor", "Performance"],
    subtasks: [
      { id: "sub-2-1", title: "Write Event Bus structure", completed: true },
      { id: "sub-2-2", title: "Implement incremental DOM patcher", completed: true },
      { id: "sub-2-3", title: "Verify memory leaks during drag-and-drop", completed: false }
    ]
  },
  {
    id: "task-3",
    title: "Design System Glassmorphism Components",
    description: "Develop base cards, dialogs, sidebars, and overlays utilizing backdrop filters and premium gradients.",
    priority: "low",
    status: "done",
    dueDate: "2026-06-18",
    assignee: "Leo Sterling",
    tags: ["Design System", "UI/UX"],
    subtasks: [
      { id: "sub-3-1", title: "Establish HSL color variables", completed: true },
      { id: "sub-3-2", title: "Design Apple-style frosted-glass panels", completed: true },
      { id: "sub-3-3", title: "Audit contrast ratios for WCAG AA compliance", completed: true }
    ]
  },
  {
    id: "task-4",
    title: "Configure CI/CD Pipelines with GitHub Actions",
    description: "Write workflows for unit testing, style linting, and automatic staging deployments on push to main.",
    priority: "high",
    status: "todo",
    dueDate: "2026-06-28",
    assignee: "Aria Thorne",
    tags: ["DevOps", "CI/CD"],
    subtasks: [
      { id: "sub-4-1", title: "Add ESLint check script", completed: false },
      { id: "sub-4-2", title: "Set up preview environment triggers", completed: false }
    ]
  },
  {
    id: "task-5",
    title: "Generate Database Indexes for Analytics Engine",
    description: "Profile slow analytics calls and implement compound indexes for task performance tracking tables.",
    priority: "medium",
    status: "inprogress",
    dueDate: "2026-06-24",
    assignee: "Marcus Vance",
    tags: ["Database", "Optimization"],
    subtasks: [
      { id: "sub-5-1", title: "Analyze execution plans using EXPLAIN", completed: true },
      { id: "sub-5-2", title: "Build composite index on status + updated_at", completed: false }
    ]
  }
];

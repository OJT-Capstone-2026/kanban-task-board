## Development Team

### Team Members

- Aditya Vawhal 
- Arman Patel

### Project Contributions

#### Aditya Vawhal
- Core Kanban Board Development
- Drag and Drop Implementation
- Local Storage Management
- Application Architecture

#### Arman Patel
- Project Documentation
- Testing and Validation
- Repository Collaboration
- UI Review
- Deployment Verification

# TaskFlow Pro – Kanban Task Management System

> A premium, enterprise-grade Kanban board built with **zero frameworks** — pure HTML5, CSS3, and vanilla ES6+ JavaScript.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Tech](https://img.shields.io/badge/stack-vanilla%20JS-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Create / Edit / Delete Tasks** | Full CRUD with form validation and animated feedback |
| **Drag & Drop** | Native HTML5 Drag and Drop API with mobile touch support |
| **localStorage Persistence** | Entire board state, activity log, and theme survive refreshes |
| **Dark / Light Theme** | Premium theme toggle with smooth CSS transitions |
| **Search** | Instant real-time filtering by title, description, and tags |
| **Filters** | Filter by priority level and assignee name |
| **Statistics Dashboard** | Animated counters and SVG progress rings |
| **Activity Timeline** | Sliding drawer logging every create, update, move, and delete |
| **Command Palette** | Spotlight-style launcher (⌘⇧K) for quick navigation |
| **Toast Notifications** | Non-intrusive success/error alerts |
| **Keyboard Shortcuts** | `N` → New Task, `Esc` → Close, `Ctrl+S` → Save |
| **Responsive Design** | Mobile column tabs, collapsible sidebar, touch drag support |
| **Subtask Progress** | Per-card progress bars with checklist builder |
| **3D Card Hover Effects** | CSS perspective transforms for premium depth feel |
| **Glassmorphism** | Backdrop-filter blur panels inspired by macOS |

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- A local HTTP server (required for ES6 modules)

### Run Locally

```bash
# Option 1: Python
cd "Kanban Task Board"
python3 -m http.server 8080

# Option 2: Node.js
npx serve .

# Option 3: VS Code
# Install "Live Server" extension → Right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8080` in your browser.

> ⚠️ Opening `index.html` directly via `file://` will fail because browsers block ES6 module imports from the file protocol.

---

## 📁 Project Structure

```
Kanban Task Board/
├── index.html                 # Application shell and markup
├── css/
│   ├── variables.css          # Design tokens and theme variables
│   ├── base.css               # Resets, typography, buttons
│   ├── layout.css             # Grid, sidebar, header, metrics
│   ├── board.css              # Kanban columns and task cards
│   ├── modal.css              # Dialog overlays and forms
│   ├── animations.css         # Keyframes, toasts, command palette
│   └── responsive.css         # Breakpoint media queries
├── js/
│   ├── main.js                # Application bootstrap
│   ├── data/
│   │   └── initialTasks.js    # Seed data for first-time users
│   └── modules/
│       ├── storage.js         # localStorage abstraction layer
│       ├── taskManager.js     # State management (Observer pattern)
│       ├── board.js           # Board rendering controller
│       ├── dragdrop.js        # HTML5 Drag & Drop + touch support
│       ├── search.js          # Real-time search filtering
│       ├── filters.js         # Priority and assignee filters
│       ├── stats.js           # Dashboard analytics engine
│       ├── activity.js        # Activity timeline renderer
│       ├── theme.js           # Dark/Light mode controller
│       └── modal.js           # Dialogs, forms, toasts, shortcuts
├── docs/
│   └── architecture.md        # Detailed architecture documentation
└── README.md
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `N` | Open Create Task modal |
| `Escape` | Close any open modal or drawer |
| `Ctrl/⌘ + S` | Save task (when modal is open) |
| `Ctrl/⌘ + K` | Focus search input |
| `Ctrl/⌘ + Shift + K` | Open Command Palette |

---

## 🏗️ Architecture

This project follows **enterprise modular architecture** with clear separation of concerns:

- **State Layer** — `taskManager.js` is the single source of truth
- **Persistence Layer** — `storage.js` wraps all localStorage operations
- **Rendering Layer** — `board.js` builds DOM from state
- **Interaction Layer** — `dragdrop.js`, `modal.js`, `search.js`, `filters.js`
- **Analytics Layer** — `stats.js`, `activity.js`
- **Presentation Layer** — 7 modular CSS files with CSS custom properties

See [`docs/architecture.md`](docs/architecture.md) for full details including data flow diagrams and design decision rationale.

---

## 🎨 Design System

### Typography
- **Primary**: Inter (UI text, inputs, labels)
- **Secondary**: Poppins (headings, badges, buttons)

### Color Palette
- Light accent: `#2563EB` / Dark accent: `#60A5FA`
- Success: `#10B981` / Warning: `#F59E0B` / Danger: `#EF4444`
- All colors use HSL for opacity flexibility

### Visual Effects
- Glassmorphism panels with `backdrop-filter: blur()`
- Multi-layered box shadows for realistic depth
- CSS 3D transforms on card hover (`perspective`, `rotateX`, `translateZ`)
- Elastic spring animations via custom `cubic-bezier` curves

---

## 📱 Responsive Breakpoints

| Viewport | Behavior |
|---|---|
| **1440px+** | Full layout with wider columns |
| **1024px** | 2-column metric grid |
| **768px** | Icon-only sidebar |
| **< 767px** | Mobile layout with column tab switcher, collapsible sidebar |
| **320px** | Compact typography and spacing |

---

## 📝 License

MIT License — Free for educational and commercial use.

# AGENTS.md

## Project Overview

This project is a Visual Thinking Workspace designed to help users transform ideas into structured execution through a flexible node-based system.

The product combines:
- visual mindmapping
- structured task management
- rapid idea capture
- multi-view planning
- knowledge organization

into a single productivity environment optimized for clarity, focus, and cognitive flow.

Core Philosophy:
- thinking should feel spatial, connected, and fluid
- execution should emerge naturally from organized thoughts
- the interface should reduce cognitive friction, not increase it

The system is built around a shared graph-based data model where:
- every node represents a meaningful unit of thinking
- the same data can be viewed through multiple perspectives
- users can move seamlessly between brainstorming, planning, and execution

Primary UX Principles:
- visual-first interaction
- minimal friction
- keyboard-friendly workflows
- responsive and mobile-capable experience
- offline reliability
- scalable mental organization

The platform is designed as a foundation for a future Visual Thinking OS rather than a traditional task manager.
---

# Product Goal

Help users:
- externalize thoughts quickly and clearly
- organize complex ideas visually
- break down large goals into actionable structures
- navigate between brainstorming and execution without losing context
- maintain focus while working with large interconnected information spaces

The product should support different modes of thinking:
- rapid ideation
- structured planning
- task execution
- reflection and review

The long-term goal is to create a calm, spatial, and cognitively ergonomic productivity system that users can rely on daily as an external thinking environment.

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router |
| UI | shadcn/ui + Tailwind CSS 4 |
| Graph Engine | React Flow |
| Backend | Firebase |
| Database | Firestore (Enabled Offline Persistence) |
| Auth | Firebase Auth |
| PWA | Web Manifest + Service Worker (Custom Cache Strategy) |
| Utilities | date-fns, lodash, uuid, dnd-kit |
| Hosting | Vercel |

---

# Deployment Strategy

## Free Tier Only

### Frontend Hosting
- Vercel Free

### Backend
- Firebase Free Plan (Spark)

### Database
- Firestore Free Tier

---

# Product Scope (MVP)

## Included

### Authentication
- Google Login

### Multi-View System
- Mindmap View (Primary)
- Kanban View (Modern dnd-kit powered task board with Drag Overlay)

### Rich Node Content System
- Markdown notes with live preview
- Interactive Checklist items
- Link management with titles and URLs
- Timestamp tracking (Created/Updated)

### Brainstorm Mode
- Keyboard-driven rapid idea capture (Space to trigger)
- Lightweight "Idea" node variant
- Zero-friction sub-idea creation
- Focus on speed and flow

### Focus Mode
- Isolated thinking workflows (Subtree isolation)
- Dim unrelated nodes (95% dimming)
- Breadcrumb navigation for orientation
- Automatic viewport centering on focused subtree

### Quick Capture Inbox System
- Rapid thought capture (Alt + I shortcut)
- Decoupled storage for uncategorized ideas
- Dedicated Inbox Panel for processing items into the board
- Seamless transition from raw thought to organized task

### Sync & Persistence System
- Real-time Cloud Sync with visual status indicator (Synced / Saving / Error)
- Full data persistence (Types, Colors, Hierarchy, Content)
- Firestore Offline Persistence for reliable work in all conditions

### Semantic Node Type System
- Config-driven types: Action, Idea, Issue, Decision, Question, Reference
- User-selectable Color Overrides (priority over type defaults)
- Clean UI: Removed redundant structural roles (Parent/Child) from toolbar
- Visual cues and icons for instant recognition

### Mindmap Board
- Fixed "Start" Node: Immutable root for project clarity
- Simplified Start Toolbar: Focused only on adding children
- Interaction: Double-click to edit title (Desktop & Mobile)
- **Manual Pinning**: User-controlled node positioning (Toggle via toolbar) to preserve spatial memory
- Mobile Optimized: Large touch targets and simplified toolbars
- Node Resizing: Manual + Auto-resize based on text
- Auto Layout (Dagre-driven): Respects pinned nodes and avoids mental map disruption

### Board Templates
- Project Planning, Study Roadmap, Startup MVP, Weekly Planning

### Persistence & Offline
- Auto save to Firestore
- Firestore Offline Persistence (Sync when back online)
- PWA Support (Installable, Offline Shell)

### Responsive
- Enhanced touch targets for Mobile
- Floating toolbars for small screens
- View switcher integrated in Header
- Mobile Kanban: Horizontal column swipe (85% width) and full-page vertical scroll
- Responsive: Enhanced touch targets for mobile and view switcher in header

---

# Out of Scope (for MVP)

Do NOT build initially:
- Real-time collaboration (Multiplayer)
- AI auto-planning
- Complex permissions / Sharing boards
- Multi-workspace
- Analytics dashboard
- Notifications
- File attachments

---

# Folder Structure

```txt
src/
├── app/             # App Router pages & metadata
├── components/
│   ├── ui/          # shadcn components
│   ├── flow/        # React Flow containers & toolbars
│   ├── nodes/       # Custom Node implementations
│   ├── views/       # Kanban view components
│   └── layout/      # Layout-specific (ViewSwitcher, PWA Reg, etc.)
├── features/
│   ├── auth/        # Auth logic & components
│   ├── board/       # Board templates & logic
│   └── task/        # Task-specific logic
├── lib/
│   ├── firebase/    # Firebase config & persistence
│   ├── utils/       # Common utilities
│   └── reactflow/   # Layouting & Flow helpers
├── hooks/           # Custom hooks (shortcuts, mobile, etc.)
├── stores/          # Zustand stores (useTaskStore)
├── services/        # Firebase data services
├── types/           # TypeScript interfaces
└── styles/          # Global styles
```

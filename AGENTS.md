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
| Frontend | Next.js 16 App Router |
| UI | shadcn/ui + Tailwind CSS 4 |
| Graph Engine | React Flow |
| Backend | Firebase |
| Database | Firestore (Enabled Offline Persistence) |
| Auth | Firebase Auth |
| PWA | Serwist (High-performance Workbox-based PWA) |
| Utilities | date-fns, lodash, uuid, dnd-kit |
| Hosting | Vercel |

---

# Deployment Strategy

## Free Tier Only

### Frontend Hosting
- Vercel Free (Supports Turbopack build)

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
- Kanban View (Modern dnd-kit powered task board with Drag Overlay). **Optimized**: Only renders "Task" type nodes to maintain focus on execution.

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
- **Semantic-Agnostic Traversal**: Show all connected nodes regardless of relationship type (Subtask, Related, Blocks, etc.).
- **Spotlight Effect**: Gaussian blur and dimming applied to non-focused nodes (10% opacity) for deep immersion.
- **Elevated Context**: Focused nodes dynamically increase Z-Index to stay visually dominant.
- **Graceful Recovery**: Automatic focus transition to parent when a focused node is deleted.
- **Respectful Zoom**: Initial fit-to-view on activation, then respects manual user zoom without aggressive overrides.
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
- **Keyboard-First Flow**: 
    - `Tab`: Rapidly create child nodes.
    - `Enter`: Create sibling nodes.
    - `Shift + Tab`: Navigate to parent.
    - `Arrows`: Hierarchical navigation between siblings, parents, and children.
- **Subtree Dragging**: Moving a parent node automatically moves its entire descendant tree, preserving branch-specific mental geography. Independent of edge relationship types.
- **Subtree Collapse**: Fold/unfold branches to manage complexity. Culled nodes are removed from render cycle for performance.
- **Semantic Zoom**: Node detail intelligently scales based on zoom level (Macro/Mid/Micro thresholds). Macro view renders minimal color-coded blocks for peak performance and clarity.
- **Visual Hierarchy**: 
    - **Typographical Scaling**: Font sizes and weights automatically adjust based on node depth (Root > Parent > Child).
    - **Done Fading**: Nodes and text marked as "Done" automatically fade and de-saturate to reduce visual noise.
    - **Edge Cleanup**: Relationship lines are thinner and more transparent by default. **Color Sync**: Arrow markers perfectly match edge stroke colors.
- **Compact Toolbars**: Refined, lightweight Productivity and Node toolbars for maximum canvas space and minimal distraction.
- **Descendant Badge**: Visual indicators (e.g., `+5`) on collapsed nodes to show hidden content scale.
- **Smart Framing**: Automatically centers viewport on the centroid of parent and child during creation to preserve visual context.
- **Creation Focus**: Automatically centers viewport on newly created nodes to maintain workflow continuity.
- **Graph Integrity**: Prevention of self-connecting loops to ensure data structure validity.
- **Color Inheritance**: Children automatically inherit parent colors for semantic consistency.
- **Inline Editing UX**: Auto-resizing textareas, instant focus on creation, and cursor stability.
- **Search Palette (Cmd+K)**: Instant node search and jump-to-focus navigation. Includes **Recent History** section for rapid context switching.
- **Spatial Bookmarks**: Save and jump to specific camera views using `Alt + 1-9` (Jump) and `Alt + Ctrl + 1-9` (Set). Solves the "getting lost" problem in massive boards.
- **Root Indicator**: Subtle "Return to Start" guidance when the root node is off-screen.
- **Zoom-to-Thinking**: Double-click canvas to instantly fit and reorient the view.
- **Progressive Disclosure**: Node toolbars and connection handles only appear when selected or hovered, reducing visual noise.
- **Manual Pinning**: User-controlled node positioning (Toggle via toolbar) to preserve spatial memory
- Mobile Optimized: Large touch targets and simplified toolbars
- Node Resizing: Manual + Auto-resize based on text
- Auto Layout (Dagre-driven): Respects pinned nodes and avoids mental map disruption

### Board Templates
- Project Planning, Study Roadmap, Startup MVP, Weekly Planning

### Persistence & Offline
- Auto save to Firestore
- Firestore Offline Persistence (Sync when back online)
- **Serwist PWA**: Robust TypeScript-based Service Worker with Network-First navigation and an explicit Offline Fallback page.

### Mobile & Tablet UX Architecture
- **Adaptive Interaction Model**: 
    - **Pan Mode**: Default interaction (nodesDraggable: false) to prevent accidental moves.
    - **Edit Mode**: Triggered via long-press (500ms) for precise node dragging with haptic feedback.
- **Contextual Action Sheets**:
    - **MobileNodeActions**: Replaces floating toolbars with a thumb-zone optimized Bottom Sheet.
    - **Quick Actions**: Add child, delete, change type, and color pickers all reachable within one-handed range.
- **Mobile Command Bar**:
    - Viewport-anchored navigation for Search, Inbox, and Quick Capture.
    - Elevated FAB for "Rapid Ideation" entry point.
- **Viewport Constraints**:
    - **Spatial Sanity**: Implementation of `translateExtent` (with 1000px padding) to prevent drifting into infinite empty space.
    - **Safe Zoom**: Fixed zoom bounds for mobile (`0.4` to `1.5`) to ensure legibility and touch-target reliability.
- **Mobile Performance Optimization**:
    - **GPU-Safe Effects**: Removal of expensive Gaussian blur and filters on mobile. Replaced with lightweight `grayscale` and `opacity` toggles for Focus Mode and dimmed states.
    - **Node Culling**: Strict `onlyRenderVisibleElements` enabled for mobile to optimize DOM overhead.
    - **Animation Throttling**: Disabled animated edges and faster transitions to maintain 60fps on mobile devices.

### Responsive
- Enhanced touch targets for Mobile (min 56px for primary actions).
- **Mobile Command Bar**: Bottom-anchored navigation and capture bar.
- **Contextual Bottom Sheets**: Dynamic action panels for node management.
- View switcher integrated in Header
- Mobile Kanban: Horizontal column swipe (85% width) and full-page vertical scroll

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
├── app/             # App Router pages, metadata, and Service Worker (sw.ts)
├── components/
│   ├── ui/          # shadcn components
│   ├── flow/        # React Flow containers & toolbars
│   ├── nodes/       # Custom Node implementations
│   ├── views/       # Kanban view components
│   └── layout/      # Layout-specific (ViewSwitcher, SyncStatus, etc.)
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

---

# Sub-Agents

## flow_engineer
Expert in ReactFlow and Zustand state management.
- Handles complex node/edge interactions.
- Manages spatial engines and layout logic.
- Implements custom flow behaviors and performance optimizations.
- Focuses on the "Spatial Thinking" logic.

## ui_specialist
Expert in Next.js, Shadcn UI, and Tailwind CSS.
- Builds polished components and layouts.
- Ensures design consistency and accessibility.
- Handles responsive design and mobile optimizations.
- Focuses on "Interaction Polish" and aesthetics.


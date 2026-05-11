# AGENTS.md

## Project Overview

Project นี้คือ Visual Mindmap Task Manager สำหรับจัดการงานแบบ node-based โดยใช้:
- Next.js (App Router)
- Firebase Auth
- Firebase Firestore (with Offline Persistence)
- shadcn/ui + Tailwind CSS 4
- React Flow (Custom Nodes with Auto-Resize)
- PWA (Installable + Offline Shell)

Core Concept:
- ใช้ mindmap เป็น primary UX ร่วมกับระบบ Multi-view (Kanban, Timeline, Document)
- ทุก node คือ task ที่แชร์ข้อมูลร่วมกันทุกมุมมอง
- มีระบบ Board Templates เพื่อความรวดเร็วในการเริ่มต้น
- รองรับการใช้งาน Offline (PWA + Firestore Persistence)
- เน้น responsive + clean UX และความลื่นไหลในการใช้งาน

---

# Product Goal

ช่วยผู้ใช้:
- วางแผนงานแบบ visual thinking และสลับมุมมองตามความเหมาะสมของเนื้องาน
- แตกงานใหญ่เป็นงานย่อยผ่านลำดับขั้น (Root -> Parent -> Child)
- เห็น dependency และ hierarchy ของงานได้อย่างชัดเจนผ่าน Mindmap หรือ Document view
- ติดตามความคืบหน้าผ่าน Kanban และ Timeline view
- จัดการ project ส่วนตัวได้ง่ายขึ้นทั้งบน Desktop และ Mobile

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
| Utilities | date-fns, lodash, uuid |
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
- Kanban View (Status tracking)
- Timeline View (Chronological audit)
- Document View (Hierarchical outline)

### Rich Node Content System
- Side Panel for detailed editing
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

### Semantic Node Type System
- Config-driven types: Action, Idea, Issue, Decision, Question, Reference
- Type-specific visual styling and icons
- Visual cues for quick identification
- Scalable architecture for future types

### Mindmap Board
- Create / Delete / Edit nodes
- Visual Hierarchy (Root, Parent, Child design variants)
- Node Toolbar (Flat UI for immediate access)
- Node Resizing (Manual + Auto-resize based on text)
- Drag node / Zoom / Pan / Center Viewport
- Auto Layout (Dagre-driven)

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
│   ├── views/       # Kanban, Timeline, Document view components
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

# Visual Thinking Workspace

## Product Vision, Cognitive UX และ Development Roadmap

---

# Vision

Visual Thinking Workspace คือระบบสำหรับช่วย “คิดให้ชัดขึ้น” ผ่านพื้นที่แบบ visual + spatial

เป้าหมายไม่ใช่การเป็น:

* task manager
* note app
* productivity tool ทั่วไป

แต่คือการเป็น:

> “External Thinking Environment”

พื้นที่ที่ช่วยให้ผู้ใช้:

* ปล่อยความคิดออกมาได้เร็ว
* เห็นความสัมพันธ์ของไอเดีย
* จัดการความซับซ้อน
* เปลี่ยนความคิดให้กลายเป็น action
* โฟกัสได้โดยไม่หลง context

---

# Core Philosophy

ระบบควรรู้สึก:

* ลื่น
* calm
* spatial
* low-friction
* cognitively lightweight

Interface ควรช่วย “ลด cognitive load”
ไม่ใช่เพิ่ม complexity

---

# Core Thinking Loop

Product ทั้งหมดควร reinforce loop นี้

```txt id="x3ovh0"
Capture
→ Expand
→ Connect
→ Structure
→ Focus
→ Execute
→ Reflect
```

---

# 1. Capture — จับความคิดให้เร็วที่สุด

## Goal

ให้ผู้ใช้โยนความคิดเข้า system ได้เร็วมาก
ก่อนที่ความคิดจะหายไป

---

## UX Principle

* friction ต่ำมาก
* เปิดมาแล้วพิมพ์ได้เลย
* ไม่ถามเยอะ
* ไม่บังคับ organize ตั้งแต่แรก

---

## Features

* Quick Add
* Global Shortcut
* Floating Input
* Inbox Capture
* Keyboard-first Input

---

## Desired Feeling

> “คิดอะไรออกก็โยนเข้าไปได้ทันที”

---

# 2. Expand — แตกความคิดออกเป็นโครงสร้าง

## Goal

ให้ผู้ใช้แตก idea ออกเป็น:

* sub-thought
* task
* note
* question
* decision
* dependency

ได้แบบลื่นและต่อเนื่อง

---

## Interaction Model

| Action         | Result                |
| -------------- | --------------------- |
| Tab            | สร้าง Child Node      |
| Enter          | สร้าง Sibling Node    |
| Auto Focus     | focus input ใหม่ทันที |
| Inline Editing | แก้ใน node ได้เลย     |

---

## UX Principle

* ไม่ interrupt flow
* ไม่เปิด modal
* keyboard-first
* branching ต้องเร็วมาก

---

## Desired Feeling

> “ความคิดแตกออกมาได้ตามธรรมชาติ”

---

# 3. Connect — เชื่อมโยงความสัมพันธ์ของความคิด

## Goal

ทำให้ user เห็นความสัมพันธ์ของ idea
ไม่ใช่แค่ tree hierarchy

---

## Relationship Types

* Semantic Links
* Relationship Edges
* References
* Dependencies
* Contradictions
* Associations

---

## UX Principle

* การ connect ต้องง่าย
* visual ต้องอ่านง่าย
* relationship ต้องช่วยคิด ไม่ใช่รก

---

## Desired Feeling

> “เห็นว่าแต่ละ idea เกี่ยวข้องกันยังไง”

---

# 4. Structure — เปลี่ยน chaos ให้เป็น clarity

## Goal

ช่วย user จัดระเบียบความคิด
โดยไม่บังคับ workflow แข็งเกินไป

---

## Structural Features

* Grouping
* Clustering
* Tagging
* Semantic Hierarchy
* Auto Organization

---

## UX Principle

* structure ควรค่อยๆเกิดขึ้น
* system ควรช่วย organize
* ไม่ rigid

---

## Desired Feeling

> “เริ่มเห็นภาพรวมชัดขึ้น”

---

# 5. Focus — โฟกัสเฉพาะสิ่งสำคัญ

## Goal

ให้ user เข้า deep thinking mode ได้
โดยไม่สูญเสีย context

---

## Focus Features

* Temporary Workspace
* Zoom-to-Thinking
* Command Focus
* Subtree Isolation
* Context Preservation
* Reduced UI Chrome

---

## UX Principle

* ลด distraction
* ลด visual noise
* focus เฉพาะ context นี้

---

## Desired Feeling

> “คิดลึกได้โดยไม่หลง”

---

# 6. Execute — เปลี่ยนความคิดเป็น action

## Goal

ให้ thought transition ไปเป็น task/action ได้ตามธรรมชาติ

---

## Execution Features

* Node → Action
* Visual Tasks
* Kanban Integration
* Action-oriented Nodes

---

## UX Principle

* execution ควรต่อจาก thinking
* ไม่แยกขาดกัน
* อย่าให้ product กลายเป็น task manager

---

## Desired Feeling

> “idea เปลี่ยนเป็น action ได้ทันที”

---

# 7. Reflect — ทบทวนและเห็น evolution ของความคิด

## Goal

ช่วยให้ user เห็น:

* ความคืบหน้า
* idea evolution
* decision trail
* completed thinking paths

---

## Reflection Features

* Completed Thinking Paths
* Archived Branches
* Historical Context
* Idea Evolution
* Decision History

---

## UX Principle

* preserve thinking history
* support long-term cognition
* ทำให้เห็น growth ของความคิด

---

## Desired Feeling

> “เห็นว่าความคิดตัวเอง evolve ยังไง”

---

# Spatial Memory Philosophy

Spatial memory คือ core ของ UX

ระบบต้อง respect mental map ของ user

---

# Stable Layout Philosophy

## Core Rule

เมื่อ user จัด node เองแล้ว:

* ห้าม layout เด้งมั่ว
* ห้าม reorganize อัตโนมัติ
* ห้ามทำลาย spatial memory

---

## Auto-layout ควรใช้เฉพาะ

* initial organization
* reduce chaos
* assist structure

---

# Spatial Zones

Workspace ควร support mental geography

| Zone   | Purpose         |
| ------ | --------------- |
| Left   | Raw Ideas       |
| Center | Active Thinking |
| Right  | Execution       |
| Bottom | Archive         |

---

## Goal

ให้ user จำตำแหน่ง context ได้โดยธรรมชาติ

---

# UX Direction

---

# Desktop UX

## Keyboard-first

ระบบควร optimize สำหรับ keyboard workflow

---

## Features

* Command Palette
* Contextual Shortcuts
* Quick Navigation
* Fast Node Creation
* Keyboard Focus Control

---

# Reduce UI Noise

Interface ต้อง calm

---

## ลด

* panel เยอะๆ
* toolbar ใหญ่ๆ
* floating controls ที่รก
* unnecessary UI chrome

---

## Goal

> interface ควร “หายไป” ตอน user กำลังคิด

---

# Progressive Disclosure

Feature ขั้นสูงไม่ควรแสดงทั้งหมดทันที

---

## Principles

* hide complexity ก่อน
* reveal ตาม context
* show only when needed

---

## Goal

ลด cognitive overload

---

# Mobile UX

## Goal

Mobile เน้น:

* quick capture
* lightweight thinking
* fast interaction

---

## Mobile Priorities

* touch-friendly
* simplified UI
* responsive node interaction
* reduced toolbar complexity

---

# Priority 1 — Node Interaction Polish

Node interaction คือ core UX ของ product

ต้อง polish เยอะที่สุด

---

# Editing Experience

## Requirements

* Instant Edit
* No Modal
* Inline Editing
* Smooth Keyboard Flow
* Minimal Clicks

---

# Creation Experience

## Requirements

* Fast Sibling Creation
* Fast Child Creation
* Drag-to-Connect
* Quick Typing Flow
* Rapid Branch Expansion

---

# Navigation Experience

## Requirements

* Keyboard Navigation
* Zoom-to-Node
* Search-to-Focus
* Fast Context Switching
* Spatial Orientation Preservation

---

# Product Design Priorities

Product ต้อง optimize สำหรับ:

* thinking flow
* spatial UX
* interaction polish
* cognitive ergonomics
* clarity under complexity

---

# Development Roadmap

---

# Phase 1 — Core Thinking Flow Foundation

## Goal

ทำให้ “คิดลื่น” ก่อนทุกอย่าง

---

## Focus

### Capture

* Quick Add
* Floating Input
* Keyboard Shortcut
* Inbox

### Expand

* Tab = Child
* Enter = Sibling
* Inline Editing
* Auto Focus

### Navigation

* Keyboard Navigation
* Zoom to Node
* Search to Focus
* **Focus-First Progressive Exploration**: A cinematic navigation system that only renders 2 levels of depth from the current focus root, allowing for calm and intentional discovery of large mindmaps.

### Layout

* Stable Layout
* Manual Pinning
* Preserve Spatial Memory

---

## Success Criteria

* user เปิดมาแล้วพิมพ์ได้ทันที
* branching เร็วมาก
* interaction ไม่มี friction
* node ไม่เด้งมั่ว

---

# Phase 2 — Spatial Thinking System

## Goal

ทำให้ system “คิดแบบ spatial” จริง

---

## Focus

### Connection System

* Semantic Links
* Relationship Edges
* Dependency Mapping

### Spatial UX

* Spatial Zones
* Focus Workspace
* Semantic Clustering
* Visual Hierarchy

### Cognitive UX

* Reduce UI Noise
* Progressive Disclosure
* Focus Mode Refinement

---

## Success Criteria

* user เห็น context ง่าย
* complexity ยังอ่านได้
* workspace เริ่มมี mental geography

---

# Phase 3 — Structured Execution Layer

## Goal

เปลี่ยน thinking → execution แบบ seamless

---

## Focus

### Action System

* Node to Task
* Kanban Integration
* Actionable Nodes

### Organization

* Tags
* Grouping
* Clustering
* Auto Organization

---

## Success Criteria

* task flow ไม่แยกจาก thinking
* organize ได้โดยไม่ rigid
* execution ยัง feel visual

---

# Phase 4 — Reflection & Long-term Thinking

## Goal

สร้าง long-term cognitive system

---

## Focus

### Reflection

* Idea Evolution
* Archived Branches
* Decision Trails
* Thinking History

### Long-term Context

* Historical Navigation
* Knowledge Recall
* Context Rehydration

---

## Success Criteria

* user เริ่มใช้เป็น second brain
* เห็น evolution ของความคิด
* context ไม่สูญหายตามเวลา

---

# Phase 5 — Intelligence Layer (Future)

## Goal

เพิ่ม AI โดยไม่ทำลาย thinking flow

---

## Important Rule

AI ต้อง:

* support thinking
* ไม่ takeover thinking

---

## Possible Features

* semantic grouping
* idea summarization
* relationship suggestions
* context recall
* thinking assistance

---

## Avoid

* AI auto-planning เต็มระบบ
* over-automation
* replacing user cognition

---

# Product References

## Visual / Spatial Systems

* Miro
* Milanote
* Heptabase
* Scrintal
* Obsidian

---

## Cognitive / Flow UX

* Craft
* Linear
* Workflowy

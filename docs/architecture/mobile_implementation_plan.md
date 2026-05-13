# Mobile & Tablet UX Implementation Plan (Revised)

This document translates the mobile/tablet UX redesign strategy into production-safe engineering architecture and implementation phases.

The primary goal is to shift mobile UX from "Graph Management" toward "Capture, Navigation, and Triage", while preserving desktop-level spatial thinking workflows.

---

# Core Engineering Principles

## 1. Mobile UX != Desktop UX Shrunk Down

Mobile interactions must optimize for:

* one-handed usage
* low precision input
* fast capture
* low cognitive load
* safe gestures

Desktop interactions remain optimized for:

* precision
* keyboard workflows
* free-form graph manipulation

---

## 2. Separate Domain State from UI State

Do NOT place mobile interaction/UI state inside task domain stores.

### Correct separation

```txt
Task Store
- nodes
- edges
- task mutations

Viewport Store
- zoom
- translate extent
- viewport position

Mobile UI Store
- selected node
- bottom sheet
- interaction state
- mobile overlays
```

---

## 3. Prefer Explicit Interaction States Over Boolean Modes

Avoid:

```ts
interactionMode: "pan" | "edit"
```

Prefer:

```ts
type MobileInteractionState =
  | "idle"
  | "panning"
  | "node-selected"
  | "editing-text"
  | "dragging-node"
```

This scales significantly better as gesture complexity increases.

---

## 4. Mobile Features Must Be Feature-Flagged

All major mobile UX redesigns must ship behind flags.

Example:

```ts
mobileUXV2: true
tabletLayoutV2: false
```

This allows:

* rollback safety
* staged rollout
* A/B testing
* migration fallback

---

# Part 1: Architecture Changes

## New Stores

### `stores/useMobileUIStore.ts`

```ts
interface MobileUIState {
  selectedNodeId: string | null;

  interactionState:
    | "idle"
    | "panning"
    | "node-selected"
    | "editing-text"
    | "dragging-node";

  isBottomSheetOpen: boolean;
  isQuickCaptureOpen: boolean;

  setSelectedNodeId: (id: string | null) => void;
  setInteractionState: (
    state: MobileInteractionState
  ) => void;
}
```

---

### `stores/useViewportStore.ts`

```ts
interface ViewportState {
  translateExtent: CoordinateExtent;
  minZoom: number;
  maxZoom: number;
}
```

---

# Part 2: Device Detection Architecture

## New Hook

### `hooks/useDeviceSpec.ts`

```ts
interface DeviceSpec {
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
  hasStylus: boolean;
  isLowEndDevice: boolean;
}
```

Avoid relying exclusively on viewport width.

---

# Part 3: Mobile Interaction System

## State Machine

```txt
[Idle]
  -> drag canvas
      -> [Panning]
      -> release
      -> [Idle]

  -> tap node
      -> [Node Selected]
      -> opens bottom sheet

  -> tap node text
      -> [Editing Text]

  -> long press node
      -> [Dragging Node]
```

---

## Gesture Rules

### Mobile

| Gesture       | Behavior      |
| ------------- | ------------- |
| 1-finger drag | Pan canvas    |
| Pinch         | Zoom viewport |
| Tap node      | Select node   |
| Tap text      | Edit text     |
| Long press    | Drag node     |

### Tablet + Stylus

| Gesture          | Behavior                    |
| ---------------- | --------------------------- |
| Pencil draw line | Create edge                 |
| Scribble         | Convert handwriting to text |

---

# Part 4: React Flow Integration

## ReactFlow Rules

```tsx
<ReactFlow
  panOnDrag={true}
  nodesDraggable={
    interactionState === "dragging-node"
  }
  onlyRenderVisibleElements
  minZoom={0.4}
  maxZoom={1.5}
/>
```

---

## Important Constraint

Do NOT use:

```tsx
onNodeContextMenu
```

for long press handling on mobile.

Browser behavior is inconsistent.

Instead use:

```ts
useLongPress()
```

with:

* custom timeout
* haptic feedback
* cancellation on movement

---

# Part 5: Mobile Navigation Redesign

## Remove

```txt
components/flow/MobileToolbar.tsx
```

ONLY after:

* MobileCommandBar is stable
* feature flag validated
* rollback path exists

---

## New Components

### `components/mobile/MobileCommandBar.tsx`

Bottom anchored command bar containing:

* Search
* Inbox
* Quick Capture FAB

---

### `components/mobile/BottomSheetContainer.tsx`

Shared mobile sheet wrapper using:

* Vaul
  or
* Radix Dialog

Supports:

* snap points
* safe areas
* drag gestures

---

### `components/mobile/MobileNodeActions.tsx`

Rendered inside BottomSheetContainer.

Contains:

* node actions
* metadata
* child creation
* delete
* node type selection

---

### `components/mobile/QuickCaptureOverlay.tsx`

Fullscreen capture overlay optimized for:

* voice input
* rapid text capture
* Inbox-first workflows

---

# Part 6: Performance Architecture

## Mobile Blur Removal

Replace:

```css
blur-[1px]
```

with:

```css
opacity-20 grayscale
```

on mobile devices.

Reason:

* drastically lower GPU cost
* improved frame consistency
* lower battery usage

---

## Rendering Constraints

Always enable:

```tsx
onlyRenderVisibleElements
```

on mobile.

---

## Viewport Calculation Rules

`translateExtent` calculations must be:

* memoized
* debounced
* recalculated only when node positions materially change

Avoid:

```ts
useEffect(() => {}, [nodes])
```

Prefer:

```ts
[nodePositionHash]
```

---

# Part 7: Tablet Architecture

Tablet UX is NOT scaled mobile UX.

Tablet UX is:

* multi-pane
* drag-and-drop
* keyboard-first
* stylus-enhanced

---

## Tablet Layout

```tsx
<div className="w-screen h-screen flex">
  {isTablet && sidebarOpen && (
    <aside className="w-80 border-r">
      <InboxPanel variant="persistent" />
    </aside>
  )}

  <main className="flex-1 relative">
    <MindmapBoard />
  </main>
</div>
```

---

## Important

After sidebar transitions:

```ts
reactFlow.fitView()
```

must be triggered carefully to avoid:

* viewport jumps
* resize flickering
* layout thrashing

Use debounced resize handling.

---

# Part 8: Execution Phases

## Phase 1 — Stability & Performance

### Ticket 1.1

Viewport constraints:

* minZoom
* maxZoom
* translateExtent

### Ticket 1.2

Performance optimization:

* remove blur
* enable render culling
* reduce animation cost

### Ticket 1.3

Introduce mobile interaction state machine.

### Ticket 1.4

Implement custom long-press gesture system.

---

## Phase 2 — Mobile Navigation System

### Ticket 2.1

Build BottomSheetContainer.

### Ticket 2.2

Build MobileNodeActions.

### Ticket 2.3

Disable floating NodeToolbar on mobile.

### Ticket 2.4

Build MobileCommandBar.

---

## Phase 3 — Capture Workflows

### Ticket 3.1

Implement QuickCaptureOverlay.

### Ticket 3.2

Add Inbox-first mobile capture flow.

### Ticket 3.3

Add voice input support.

---

## Phase 4 — Tablet Productivity

### Ticket 4.1

Persistent split-pane layout.

### Ticket 4.2

Cross-pane drag-and-drop.

### Ticket 4.3

Keyboard parity improvements.

### Ticket 4.4

Stylus support.

---

# Part 9: Risks & Anti-Patterns

## Avoid

### 1. Semantic Zoom

Pinch gestures must ONLY control viewport zoom.

Never bind hierarchy expansion to pinch.

---

### 2. Infinite Canvas Drift

Always constrain viewport bounds.

---

### 3. Desktop Modal Patterns on Mobile

Use:

* bottom sheets
* fullscreen overlays

Avoid:

* centered dialogs

---

### 4. Premature Tablet Complexity

Tablet workflows should only begin after:

* mobile gestures stabilize
* performance issues resolved
* capture workflows validated

---

# Part 10: Recommended Technical Stack

| Problem           | Recommendation                     |
| ----------------- | ---------------------------------- |
| Bottom Sheet      | Vaul                               |
| Gesture Detection | use-long-press                     |
| State             | Zustand                            |
| Drag & Drop       | dnd-kit                            |
| Animation         | Framer Motion                      |
| Feature Flags     | Config Store / localStorage        |
| Haptics           | Capacitor Haptics or Vibration API |

---

# Final Goal

Mobile:

* capture-first
* low friction
* safe navigation
* low cognitive load

Tablet:

* productivity workspace
* multi-pane workflows
* stylus + keyboard optimized

Desktop:

* full graph manipulation
* spatial organization
* power-user workflows

---
category: Components
title: Modal
---

# Modal

Built on top of Ant Design Modal, HiTalent Design Modal adds drag-to-move, maximize for immersive viewing, and minimize-to-dock — delivering a desktop-class window experience.

## Why this component

Ant Design's Modal falls short in desktop-grade complex interactions: it can't be dragged (blocking critical information behind it), can't go fullscreen for long content, and closing the modal destroys form data requiring re-entry. HiTalent Design Modal upgrades the modal into a true desktop workspace window through built-in drag, maximize, and minimize-to-dock capabilities. The DOM is preserved when minimized, keeping form state intact.

## Demos

### Basic Usage

<code src="./demo/basic.tsx" title="Basic Usage" description="The simplest Modal usage: control visibility with `open`, handle cancel and confirm actions via `onCancel` and `onOk`."></code>

### Form Submission

<code src="./demo/form-submit.tsx" title="Form Submission" description="Combine Ant Design form validation with Modal's `confirmLoading` prop for async form submission with validation. Form state is automatically reset on close."></code>

### Advanced Window Management

<code src="./demo/advanced.tsx" title="Advanced Window Management (Minimize without Destroy)" description="Enable `minimizable`, `maximizable`, and `draggable` for a desktop-class window experience. When minimized, the modal docks to a corner — form data is perfectly preserved and can be restored at any time."></code>

### Imperative Control (Ref API)

<code src="./demo/imperative-control.tsx" title="Imperative Control (Ref API)" description="Use `useRef<ModalRef>` to get a Modal instance and call `minimize()`, `restore()`, `maximize()`, `unmaximize()` from outside the component for flexible programmatic window management."></code>

### Multi-Window Minimize

<code src="./demo/multiple-minimize.tsx" title="Multi-Window & Auto Arrange" description="Open multiple modals, minimize them all, and watch them auto-arrange in the dock corner — no overlapping. Each minimized card can also be dragged independently."></code>

## API

<API src="./type.ts" identifier="ModalProps" hideTitle></API>

## ModalRef

<API src="./type.ts" identifier="ModalRef" hideTitle></API>

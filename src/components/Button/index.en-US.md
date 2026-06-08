---
category: Components
title: Button
---

# Button

Extends Ant Design Button with enhanced icon positioning, automatic async loading, and built-in debounce support — all while preserving the full native API.

## Why this component

Ant Design's Button is feature-rich, but complex business scenarios still require manual state management: toggling `loading` for async submissions, building debounce logic for rapid clicks, and icon position limited to `left`. MyUI Button bakes these high-frequency needs into component props, letting developers focus on business logic instead of state management.

## Demos

### Basic Usage

<code src="./demo/basic.tsx" title="Basic Usage" description="Inherits all native Ant Design Button props. Supports multiple types (primary, dashed, text, link), states (danger, disabled), sizes (small, middle, large), and icon integration."></code>

### Icon Position

<code src="./demo/icon-position.tsx" title="Icon Position" description="Control icon placement with `iconPosition`: `left` (default), `right`, `top`, or `bottom`."></code>

### Auto Loading

<code src="./demo/auto-loading.tsx" title="Auto Loading" description="When `autoLoading` is enabled (default), if `onClick` returns a Promise, the button automatically enters loading state and blocks further clicks until the Promise resolves."></code>

### Controlled Loading

<code src="./demo/controlled-loading.tsx" title="Controlled Loading" description="Disable `autoLoading` and control the loading state externally via the `loading` prop. Useful when you need conditional checks (e.g., form validation) before showing loading."></code>

### Debounce Click

<code src="./demo/debounce.tsx" title="Debounce" description="Set `debounce` to a positive millisecond value to limit the button to one click within the specified time window, preventing duplicate submissions."></code>

## API

<API src="./type.ts" identifier="ButtonProps" hideTitle></API>

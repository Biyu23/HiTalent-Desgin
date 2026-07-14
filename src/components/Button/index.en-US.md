---
category: Components
title: Button
---

# Button

A wrapper around Ant Design Button that adds `autoLoading`, `throttle`, and `tooltip` capabilities, while keeping the full native API.

## Why this component

In daily work, buttons often need loading state for async actions, duplicate-click prevention, and explanations when disabled. Button bakes these into component props so you don't have to wire them up manually.

## Demos

### Auto Loading

<code src="./demo/auto-loading.tsx" title="Auto Loading" description="When `onClick` returns a Promise, the button enters loading state automatically and blocks further clicks until the Promise settles."></code>

### Controlled Loading

<code src="./demo/controlled-loading.tsx" title="Controlled Loading" description="Turn off `autoLoading` and control loading state externally via the `loading` prop."></code>

### Throttle Click

<code src="./demo/throttle.tsx" title="Throttle" description="Set `throttle` to a millisecond value. The first click fires immediately; subsequent clicks within the cooldown are ignored."></code>

### Tooltip

<code src="./demo/tooltip.tsx" title="Tooltip" description="When `tooltip` is set, a Tooltip is shown on hover. Pass a string for quick text, or a `TooltipProps` object for full control over placement and behavior."></code>

## API

<API src="./type.ts" identifier="ButtonProps" hideTitle></API>

---
category: Components
title: Button
toc: content
---

# Button

Adds async loading, click throttling, and disabled explanations while preserving the complete Ant Design Button API.

## When to use

- An action returns a Promise and the button should manage its own loading state.
- A high-frequency action must ignore repeated clicks during a cooldown.
- A disabled button still needs to explain why the action is unavailable.

Use Ant Design Button directly when none of these behaviors are required.

## Core capabilities

- `autoLoading` follows the Promise returned by `onClick`.
- `throttle` runs the first click immediately and ignores clicks during the cooldown.
- `tooltip` accepts either a quick string or complete TooltipProps.
- Native props, refs, and styling behavior remain compatible.

## Demos

<code src="./demo/auto-loading.tsx" title="Auto Loading" description="When onClick returns a Promise, the button enters loading state and restores itself when the Promise settles."></code>

<code src="./demo/controlled-loading.tsx" title="Controlled Loading" description="Disable autoLoading and let external state control the complete loading lifecycle through the loading prop."></code>

<code src="./demo/throttle.tsx" title="Throttle Clicks" description="Set throttle in milliseconds. The first click runs immediately and repeated clicks during the cooldown are ignored."></code>

<code src="./demo/tooltip.tsx" title="Disabled Explanation" description="Attach a tooltip to explain a disabled action or provide concise supporting context."></code>

## Notes

- `autoLoading` cannot wait for async work when `onClick` does not return its Promise.
- When a form owns the full submission state, disable `autoLoading` and use controlled `loading`.
- `throttle` reduces repeated UI events; it does not replace server-side idempotency.

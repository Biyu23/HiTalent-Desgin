---
category: Components
title: Button
toc: content
---

# Button

Extends Ant Design Button with async loading, click throttling, and tooltip capabilities.

## When to use

- An action returns a Promise and the button should automatically manage its own loading lifecycle.
- High-frequency click operations need to ignore clicks within a cooldown period (throttling).
- A button needs quick tooltip hints in normal or disabled states.

## Demos

<code src="./demo/auto-loading.tsx" title="Auto Loading" description="Automatically enters loading state when onClick returns a Promise, settling after resolution."></code>

<code src="./demo/throttle.tsx" title="Throttle Clicks" description="Sets throttle in milliseconds. The first click runs immediately, repeated clicks within cooldown are ignored."></code>

<code src="./demo/tooltip.tsx" title="Tooltip" description="Attaches tooltip hints via string title or full TooltipProps object."></code>

## API

### Button

Inherits all properties from [Ant Design Button](https://ant.design/components/button#api), with the following extended properties:

| Property    | Description                                                                                                         | Type                                                                 | Default |
| ----------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------- |
| autoLoading | Automatically enters loading state when `onClick` returns a Promise, settling when resolved/rejected                | `boolean`                                                            | `true`  |
| throttle    | Click cooldown in milliseconds. The first click executes immediately, subsequent clicks within cooldown are ignored | `number`                                                             | `0`     |
| tooltip     | Tooltip configuration. Supports ReactNode title or full `TooltipProps` (excluding children)                         | `ReactNode \| Omit<TooltipProps, 'children'>`                        | -       |
| onClick     | Click handler supporting async Promise for `autoLoading`                                                            | `(event: React.MouseEvent<HTMLElement>) => void \| Promise<unknown>` | -       |

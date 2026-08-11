---
title: useDragBounds
toc: content
---

# useDragBounds

Calculates `react-draggable` bounds from the viewport and element position at drag start, keeping draggable content visible.

## When to use

- A modal, floating panel, or tool window must not leave the browser viewport.
- The Draggable wrapper and visible element differ, so measurement needs a separate ref.

## Basic usage

```tsx | pure
import Draggable from 'react-draggable';
import { useDragBounds } from 'hi-talent-design';

export default () => {
  const { dragRef, bounds, onStart } = useDragBounds();

  return (
    <Draggable nodeRef={dragRef} bounds={bounds} onStart={onStart}>
      <div ref={dragRef}>Draggable region</div>
    </Draggable>
  );
};
```

## Parameter

| Parameter    | Type                           | Description                                             |
| ------------ | ------------------------------ | ------------------------------------------------------- |
| `measureRef` | `React.RefObject<HTMLElement>` | Optional visible node to measure; defaults to `dragRef` |

## Return value

| Field     | Type                              | Description                                            |
| --------- | --------------------------------- | ------------------------------------------------------ |
| `dragRef` | `React.RefObject<HTMLDivElement>` | Pass to both Draggable `nodeRef` and the wrapper `ref` |
| `bounds`  | `{ left; top; right; bottom }`    | Movement bounds calculated from the current viewport   |
| `onStart` | `DraggableProps['onStart']`       | Re-measures and updates bounds at each drag start      |

## Advanced example: measure an inner node

```tsx | pure
const measureRef = useRef<HTMLDivElement>(null);
const { dragRef, bounds, onStart } = useDragBounds(measureRef);

<Draggable nodeRef={dragRef} bounds={bounds} onStart={onStart}>
  <div ref={dragRef}>
    <div ref={measureRef}>The visible node that must stay in view</div>
  </div>
</Draggable>;
```

## Notes

- Bounds are recalculated at every `onStart`, so they use the latest viewport and element position.
- The Hook depends on browser DOM; do not invoke `onStart` during server rendering.
- If the measured node is not mounted, that drag start leaves bounds unchanged.

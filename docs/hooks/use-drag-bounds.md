---
nav:
  title: Hooks
  order: 2
---

# useDragBounds

为 `react-draggable` 组件**动态计算拖拽边界**，确保拖拽元素始终保留在可视窗口内。

## 为什么需要这个 Hook

当弹窗或悬浮窗支持拖拽时，需要限制拖拽范围不超出浏览器窗口。`useDragBounds` 在拖拽开始时（`onStart`）根据元素当前位置和窗口尺寸自动计算 `bounds`，省去手动计算的繁琐。

## 基本用法

```tsx | pure
import { useDragBounds } from 'hi-talent-design';
import Draggable from 'react-draggable';

const MyComponent = () => {
  const { dragRef, bounds, onStart } = useDragBounds();

  return (
    <Draggable nodeRef={dragRef} bounds={bounds} onStart={onStart}>
      <div ref={dragRef}>可拖拽的区域</div>
    </Draggable>
  );
};
```

## 返回值

| 字段      | 类型                                                           | 说明                                                      |
| --------- | -------------------------------------------------------------- | --------------------------------------------------------- |
| `dragRef` | `React.RefObject<HTMLDivElement>`                              | 传给 Draggable 的 `nodeRef` 和被拖拽元素的 `ref`          |
| `bounds`  | `{ left: number; top: number; bottom: number; right: number }` | 动态计算的边界约束，限制元素不超出窗口                    |
| `onStart` | `DraggableProps['onStart']`                                    | 直接传给 Draggable 的 `onStart`，在拖拽开始时重新计算边界 |

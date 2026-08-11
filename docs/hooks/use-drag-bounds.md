---
title: useDragBounds
toc: content
---

# useDragBounds

在拖拽开始时根据视口和元素位置计算 `react-draggable` 边界，让可拖动内容保留在可视区域内。

## 适用场景

- 弹窗、悬浮面板或工具窗口不能被拖出浏览器视口。
- Draggable 包装节点与实际可视节点不一致，需要单独测量。

## 基本用法

```tsx | pure
import Draggable from 'react-draggable';
import { useDragBounds } from 'hi-talent-design';

export default () => {
  const { dragRef, bounds, onStart } = useDragBounds();

  return (
    <Draggable nodeRef={dragRef} bounds={bounds} onStart={onStart}>
      <div ref={dragRef}>可拖拽区域</div>
    </Draggable>
  );
};
```

## 参数

| 参数         | 类型                           | 说明                                             |
| ------------ | ------------------------------ | ------------------------------------------------ |
| `measureRef` | `React.RefObject<HTMLElement>` | 可选；用于测量真实可视节点，不传时测量 `dragRef` |

## 返回值

| 字段      | 类型                              | 说明                                          |
| --------- | --------------------------------- | --------------------------------------------- |
| `dragRef` | `React.RefObject<HTMLDivElement>` | 同时传给 Draggable `nodeRef` 和包装元素 `ref` |
| `bounds`  | `{ left; top; right; bottom }`    | 基于当前视口计算的移动边界                    |
| `onStart` | `DraggableProps['onStart']`       | 每次开始拖动时重新测量并更新边界              |

## 进阶示例：测量内部节点

```tsx | pure
const measureRef = useRef<HTMLDivElement>(null);
const { dragRef, bounds, onStart } = useDragBounds(measureRef);

<Draggable nodeRef={dragRef} bounds={bounds} onStart={onStart}>
  <div ref={dragRef}>
    <div ref={measureRef}>实际需要留在视口内的节点</div>
  </div>
</Draggable>;
```

## 注意事项

- 边界在每次 `onStart` 时计算，因此会读取最新视口尺寸和元素位置。
- Hook 依赖浏览器 DOM，不应在服务端渲染阶段主动调用 `onStart`。
- 若目标节点尚未挂载，当前拖动不会更新边界。

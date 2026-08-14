# Modal 缩放视口边界设计

## 背景

Modal 开启 `resizable` 后，当前右下角缩放逻辑会在指针接近视口右边或底边时，通过 `requestAnimationFrame` 持续扩大窗口，并同步向左或向上移动窗口。该行为会让 Modal 越过浏览器可视区域，撑开页面布局并产生外部滚动条。

现有 `draggable` 行为以浏览器视口为移动边界。缩放应采用相同的边界语义：Modal 达到视口边缘后不能继续向外扩大。

## 目标

- 以浏览器当前可视区域为缩放边界。
- 从右下角缩放时固定 Modal 左上角。
- Modal 右边缘不能超过视口右边缘，底边缘不能超过视口底边缘。
- 达到某一轴的边界后，只停止该轴继续增大；另一轴仍可独立调整。
- 避免缩放导致页面或 Modal 外部容器产生额外滚动条。
- 保留现有最小尺寸、缩小操作、拖动操作和交互清理行为。

## 非目标

- 不增加新的公开属性或 `ModalResizableConfig`。
- 不改变 Modal 的默认尺寸、居中方式或拖动边界。
- 不支持触边后自动移动 Modal、切换缩放方向或继续自动扩张。
- 不重构 `useDragBounds`，也不建立新的通用边界框架。

## 设计

### 边界基准

缩放开始时读取 Modal 可视矩形和浏览器视口尺寸：

- `maxWidth = viewportWidth - rect.left`
- `maxHeight = viewportHeight - rect.top`

其中视口尺寸沿用现有拖动逻辑的语义，以 `document.documentElement.clientWidth` 和 `clientHeight` 为准，并在必要时使用 `window.innerWidth` 和 `innerHeight` 兜底。

最大尺寸不得小于当前最小尺寸，避免在极端位置下产生互相矛盾的约束。若 Modal 在开始缩放时已部分越界，允许用户向内缩小；不会通过本次修复自动改变其位置。

### 尺寸更新

每次 `pointermove` 根据指针增量计算候选尺寸，并分别钳制：

- 宽度限制在 `minWidth` 到 `maxWidth` 之间。
- 高度限制在 `minHeight` 到 `maxHeight` 之间。

宽高独立处理。因此右边已经触边时，仍可继续向下调整高度；底边已经触边时，仍可继续向右调整宽度。向内移动指针时可以立即从边界缩小，不会出现指针回退一段距离后才响应的滞后。

### 删除边缘自动扩张

移除以下行为及其状态：

- 指针接近边缘的阈值判断。
- 触边后的自动扩张方向。
- 基于时间的自动扩张速度。
- 为持续扩张创建的 `requestAnimationFrame` 循环。
- 自动扩大时向左或向上修改窗口位置。

缩放只由实际 pointer 位移驱动。

### 生命周期与交互

保持现有行为不变：

- pointer down 时阻止默认行为和冒泡。
- 缩放期间禁止文本选择，并显示 `nwse-resize` 光标。
- 继续监听 document 级别的 `pointermove`、`pointerup` 和 `pointercancel`。
- 窗口失焦、Modal 失活或组件卸载时结束缩放。
- 结束缩放后恢复 body 原有样式并移除全局监听。
- 缩放期间继续禁止 Modal 拖动。

## 影响范围

主要修改 `src/components/Modal/hooks/useModalResize.ts`。不改变 Modal 的公共 API、Context 接口、样式结构和文档 API 表。

如项目现有测试基础设施适合 hook 交互测试，可补充自动化测试；否则通过 resize demo 进行浏览器交互验证。

## 验收标准

1. 向右拖动缩放把手时，Modal 右边缘到达视口右边后宽度不再增加。
2. 向下拖动时，Modal 底边缘到达视口底边后高度不再增加。
3. 向右下角拖动时，宽高分别受各自边界限制。
4. 单轴触边后，另一轴仍能继续调整直至其边界。
5. 触边后反向拖动可立即缩小，不存在回退滞后。
6. 缩放过程中 Modal 左上角位置不变。
7. 缩放不会新增页面或外部容器滚动条。
8. 最小宽度 320px、最小高度 200px 的现有约束继续生效。
9. Modal 拖动、最大化、最小化、关闭及重新打开行为不受影响。
10. pointer up、pointer cancel、窗口失焦和组件卸载后，全局监听及 body 样式均正确恢复。

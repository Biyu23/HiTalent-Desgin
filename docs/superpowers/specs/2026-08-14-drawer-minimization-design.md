# Drawer 最小化能力设计

## 背景

当前 `Modal` 已支持最小化到全局 Dock，包括受控与非受控状态、8 个停靠方位、多实例堆叠、拖动、恢复、关闭和命令式 Ref API。`Drawer` 当前仅在 Ant Design Drawer 基础上增加方向感知的尺寸调整能力，无法暂时收起并保留任务上下文。

本次为 `Drawer` 增加与 `Modal` 一致的最小化能力，并将现有 Modal 最小化实现提取为内部通用模块。提取后 Modal 与 Drawer 共享同一套状态与 Dock 基础设施，避免形成两套行为相似但逐渐分化的实现。

## 目标

1. Drawer 支持通过标题栏按钮最小化到全局 Dock。
2. 支持受控与非受控最小化状态。
3. 支持通过 `DrawerRef` 命令式最小化和恢复。
4. 支持 8 个停靠方位、多实例堆叠、溢出滚动和独立拖动。
5. Drawer 最小化期间保留内容 DOM、表单状态、滚动位置和用户调整后的尺寸。
6. Modal 与 Drawer 共享最小化基础设施，并可停靠在同一个全局容器中。
7. 保持 Modal 现有公开 API、视觉效果及交互行为不变。
8. 保持 Drawer 现有 resize、`panelRef`、`drawerRender`、语义样式和 Ant Design 兼容能力不变。

## 非目标

- 不为 Drawer 增加最大化或自由拖动能力。
- 不修改 Modal 的最大化、窗口拖动、resize 或 `destroyAll()` 设计。
- 不增加全局任务管理器、持久化恢复或跨 React 根节点协调。
- 不增加键盘移动 Dock 卡片或键盘 resize。
- 不改变未启用 `minimizable` 时 Drawer 的默认外观和销毁策略。

## 方案选择

采用“提取通用最小化基础设施”的方案：将 Modal 私有的最小化状态、Dock Portal、全局容器管理和基础样式提取到内部共享模块，Modal 与 Drawer 分别提供薄适配层。

未选择以下方案：

- 为 Drawer 复制整套实现：改动隔离，但会重复维护状态机、Portal、引用计数和样式。
- 让 Drawer 构造 `ModalContext` 复用现有组件：初期代码少，但会让 Drawer 依赖 Modal 私有上下文，类型和职责边界不合理。

## 公开 API

### DrawerProps

新增以下属性：

```ts
export interface DrawerProps {
  /** 是否支持最小化到全局 Dock，默认 false */
  minimizable?: boolean;
  /** 受控最小化状态 */
  minimized?: boolean;
  /** 最小化卡片的停靠位置，默认 bottom-right */
  minimizePosition?: MinimizePosition;
  /** 最小化状态变化回调 */
  onMinimizeChange?: (minimized: boolean) => void;
  /** 关闭回调；从 Dock 程序化关闭时 event 为 undefined */
  onClose?: (
    event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void;
}
```

`DrawerProps` 从继承的 Ant Design 属性中额外排除 `onClose`，再以上述兼容且更宽的签名重新声明。现有按钮点击和 ESC 关闭仍传入原事件，仅从 Dock 关闭时允许 `undefined`。

`MinimizePosition` 保持现有 8 个取值：

```ts
type MinimizePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';
```

该类型的定义移至内部共享位置，但继续从包入口导出，现有 Modal 用户无需修改导入路径。

### DrawerRef

Drawer 从 `React.FC` 调整为 `forwardRef<DrawerRef, DrawerProps>`，新增：

```ts
export interface DrawerRef {
  /** 最小化 Drawer */
  minimize: () => void;
  /** 从 Dock 恢复 Drawer */
  restore: () => void;
}
```

组件 `ref` 与现有 `panelRef` 职责不同，并可同时使用：

- `ref` 返回 `DrawerRef` 命令式 API。
- `panelRef` 继续返回 Ant Design Drawer 面板 DOM。

### Drawer 语义样式

在现有 `DrawerClassNames` 和 `DrawerStyles` 上新增：

```ts
interface DrawerClassNames {
  minimizeButton?: string;
  minimizedDock?: string;
}

interface DrawerStyles {
  minimizeButton?: React.CSSProperties;
  minimizedDock?: React.CSSProperties;
}
```

共享 Dock 提供默认视觉，使用方可以分别定制 Drawer 的最小化按钮和最小化卡片。

## 内部架构

新增并固定使用以下内部通用目录和文件：

```text
src/components/_util/minimize/
├── type.ts
├── useMinimizeState.ts
├── MinimizedDock.tsx
├── dockContainer.ts
└── index.less
```

### type.ts

负责最小化领域的通用类型：

- `MinimizePosition`
- 通用状态 Hook 的参数和返回值
- `MinimizedDock` 的展示和操作参数

该模块不得依赖 Modal 或 Drawer 类型。

### useMinimizeState.ts

负责受控与非受控状态合并，暴露：

- `isMinimized`
- `minimize()`
- `restore()`
- `reset()`

规则如下：

1. `minimized !== undefined` 时为受控模式。
2. 受控模式不直接改变内部可见状态，只调用 `onMinimizeChange(next)`。
3. 非受控模式更新内部状态，同时调用变化回调。
4. 回调通过同步 Ref 读取，避免闭包持有旧值。
5. 关闭流程调用 `restore()`/`reset()`，使非受控实例下次打开时回到正常状态。

Modal 的最大化互斥规则继续留在 Modal 自己的状态层。共享 Hook 只管理最小化，不理解最大化。

### MinimizedDock.tsx

通用 Dock 通过 Props 接收：

- `open`
- `minimized`
- `title`
- `position`
- `dockPrefixCls`：由调用方通过 `usePrefixCls('minimize')` 取得，专用于共享容器和基础 Dock 样式
- `sourceClassName`：分别传入 Modal 或 Drawer 的兼容类名，以保留组件级定制入口
- `onRestore`
- `onClose`
- 自定义 `className` 和 `style`
- 恢复、关闭和拖动所需的本地化文案

它不读取 `ModalContext` 或 Drawer 私有状态。组件负责：

1. 仅在 `open && minimized` 时挂载 Dock 内容。
2. 通过 Portal 渲染到对应方位的全局滚动容器。
3. 使用 `react-draggable` 支持卡片独立拖动。
4. 展示标题、恢复按钮和关闭按钮。
5. 提供恢复、关闭和拖动把手的无障碍名称。
6. 在 SSR 环境中不访问不存在的 `document`，待客户端挂载后创建容器。

### dockContainer.ts

负责全局 DOM 容器的生命周期：

- 查询已有容器和滚动层。
- 按停靠方位创建容器。
- 维护容器引用计数。
- 最后一个 Dock 实例卸载后移除容器。

容器 ID 和基础类名统一使用 `dockPrefixCls = usePrefixCls('minimize')`，而不是 Modal 或 Drawer 专属前缀。Modal 与 Drawer 还会各自为卡片附加兼容类名，用于组件级语义样式。因此，位于相同 Design ConfigProvider 前缀下、停靠到同一位置的 Modal 和 Drawer 会进入同一个容器，并共享溢出滚动和排列顺序；不同自定义前缀的组件保持隔离。

### index.less

提取以下共享样式：

- 8 方位固定定位。
- Dock 滚动容器、隐藏滚动条和边缘渐隐。
- 最小化卡片基础尺寸、边框、阴影和进入动画。
- 标题截断、操作按钮和拖动光标。

Modal 和 Drawer 保留组件特有的标题栏样式。提取后 Modal 的默认视觉尺寸、间距和动画不发生变化。

## Drawer 集成设计

### 状态与可见性

Drawer 读取以下默认值：

```ts
minimizable = false;
minimizePosition = 'bottom-right';
```

最终传给 Ant Design Drawer 的可见性为：

```ts
open={open && !isMinimized}
```

启用 `minimizable` 时，将 `destroyOnHidden` 解析为 `false`，保证 Drawer 主体在最小化期间不卸载。未启用时完全尊重调用方传入的 `destroyOnHidden`。

Drawer 现有 `manualSizes` 不在最小化或恢复时重置。恢复后继续使用最小化前的 `placement`、受控尺寸或对应轴向的手动尺寸。

### 标题栏

- `minimizable=false` 时继续使用 Ant Design Drawer 的原生标题、`extra`、关闭按钮和 `closeIcon` 渲染路径。
- `minimizable=true` 时使用 Drawer 标题栏适配器。
- 标题内容位于左侧；`extra`、最小化按钮和关闭按钮位于右侧。
- `closable=false` 时不显示关闭按钮。
- 自定义 `closeIcon` 继续作为关闭按钮图标。
- 标题和 `extra` 保持 `ReactNode` 能力。
- 操作按钮点击不会触发其他标题栏交互。

适配器只负责 Drawer 标题布局，不包含 Dock 逻辑。

### drawerRender 与 resize

现有 `drawerRender` 继续只包装 Drawer 面板内容。共享 Dock 渲染在 Drawer 之外，不传入用户的 `drawerRender`。

Resize Handle 仅在以下条件全部满足时渲染并响应：

```text
open && !isMinimized && resizable
```

最小化时停止 resize 交互；恢复后沿用已有尺寸状态。`panelRef` 合并逻辑保持不变。

### 命令式 API

`useImperativeHandle` 暴露稳定的 `minimize` 和 `restore` 方法。方法与标题栏和 Dock 按钮调用同一状态操作，不维护另一套状态。

调用 `minimize()` 不隐式设置 `open=true`。当 Drawer 未打开时更新状态不会渲染 Dock；是否打开仍由调用方的 `open` 决定。

## Modal 迁移设计

Modal 改用共享 `useMinimizeState`、`MinimizedDock` 和容器工具，但保持以下行为：

- 原有 `minimizable`、`minimized`、`minimizePosition` 和 `onMinimizeChange` API 不变。
- `ModalRef.minimize()`、`restore()`、`maximize()` 和 `unmaximize()` 不变。
- 最小化时保留最大化状态，恢复后回到最小化前的最大化状态。
- 调用最大化时自动退出最小化。
- 关闭时重置最小化和最大化状态。
- `Modal.destroyAll()` 可以关闭普通、最大化和最小化实例。
- 现有标题栏、拖动、resize 和最大化样式不变。

Modal 可以保留自己的组合状态 Hook，用它协调最大化与共享最小化操作；不得把最大化逻辑下沉到共享模块。

## 交互流程

### 标题栏最小化

1. 用户点击 Drawer 标题栏最小化按钮。
2. 调用共享状态操作 `minimize()`。
3. 非受控模式写入内部状态；受控模式等待调用方更新 `minimized`。
4. 触发 `onMinimizeChange(true)`。
5. Drawer 主体和遮罩退出显示，内容 DOM 保留。
6. 全局 Dock 对应方位出现最小化卡片。

### 恢复

1. 用户点击 Dock 恢复按钮，或调用 `DrawerRef.restore()`。
2. 触发 `onMinimizeChange(false)`。
3. 非受控状态更新，或由受控调用方更新 `minimized`。
4. Dock 卡片卸载，Drawer 以原 placement 和原尺寸显示。

### 从 Dock 关闭

1. 用户点击最小化卡片关闭按钮。
2. Drawer 先请求退出最小化状态。
3. 调用原有 `onClose`，事件参数允许为 `undefined`，表示程序化关闭。
4. 调用方将 `open` 更新为 `false`。
5. Dock 实例卸载；该方位没有其他实例时清理全局容器。

受控模式下，调用方必须在 `onMinimizeChange` 中同步 `minimized`，与受控 Drawer 的其他属性规则一致。

## 多实例行为

- Modal 与 Drawer 可以同时停靠。
- 相同 `minimizePosition` 的实例进入同一容器，按挂载顺序排列。
- 底部方位从下向上堆叠；顶部和左右方位从上向下堆叠。
- 超出视口时容器允许滚动、隐藏滚动条，并在溢出方向显示渐隐提示。
- 每张卡片拥有独立拖动状态、恢复和关闭操作。
- 容器使用引用计数避免多个实例并发卸载时误删仍在使用的 DOM。

## 国际化与无障碍

扩展 `DrawerLocale`：

- `minimize`
- `restore`
- `close`
- `minimizedDockLabel`
- `minimizedDockDragHandle`

中英文默认语言包同步提供文案。

按钮使用明确的 `aria-label`。Dock 标题应支持文本截断，但不得移除原始可访问名称。拖动只作为增强能力，恢复和关闭始终可通过普通按钮完成。

## 错误和边界处理

- SSR：`document` 不存在时不创建容器、不渲染 Portal，也不抛错。
- 缺少标题：Dock 允许标题为空，操作按钮仍可使用。
- `open=false`：即使 `minimized=true` 也不显示 Dock。
- 受控状态未同步：组件持续遵循传入的 `minimized`，只通过回调发出请求，不私自改变受控视觉状态。
- 停靠位置变化：已最小化实例卸载旧位置 Portal 并进入新位置；旧容器引用归零后清理。
- 多实例卸载：容器引用计数不得降为负值，不得删除仍包含其他实例的容器。
- 用户直接把 `open` 改为 `false`：Dock 随 `open && minimized` 条件隐藏；状态是否复位仍由受控值或下一次正常关闭流程决定，以保持与 Modal 现有语义一致。

## 文档与示例

更新 Drawer 中英文文档，新增：

1. 最小化功能说明和适用场景。
2. 基础最小化示例。
3. 受控 `minimized` 示例。
4. `DrawerRef` 命令式控制示例。
5. Modal 与 Drawer 可共享 Dock 的说明。
6. 新增 Props、Ref、语义样式和 locale 行为说明。
7. 最小化期间 DOM 与 resize 尺寸保留规则。

## 验证方案

仓库当前没有 Drawer/Modal 组件单元测试基础设施，本次不引入新的测试框架。验证分为静态检查、文档构建和手工回归。

### 静态检查

- TypeScript/Father 构建通过。
- ESLint 通过。
- Stylelint 通过。
- Dumi 文档构建通过。

### Drawer 功能验证

1. 非受控 Drawer 可从标题栏最小化、从 Dock 恢复并从 Dock 关闭。
2. 受控 `minimized` 仅在父组件同步状态后改变视觉状态。
3. `DrawerRef.minimize()` 和 `restore()` 与按钮行为一致。
4. 四种 placement 均可最小化并恢复。
5. resize 后最小化再恢复，尺寸保持不变。
6. `closable=false`、自定义 `closeIcon`、`extra` 和空标题均正常。
7. `panelRef`、`drawerRender`、自定义 `classNames` 和 `styles` 不回归。
8. `minimizable=false` 时外观、销毁策略和交互与当前版本一致。

### 共享 Dock 验证

1. 多个 Drawer 在同一位置正确堆叠。
2. Modal 与 Drawer 在同一位置共享容器。
3. 不同位置使用独立容器。
4. 大量实例溢出时可滚动并显示渐隐提示。
5. 单个卡片拖动不影响其他卡片。
6. 逐一关闭实例时引用计数正确，最后一个实例关闭后移除容器。
7. 运行 SSR/文档静态构建时不访问不存在的 DOM。

### Modal 回归验证

1. 非受控和受控最小化行为不变。
2. 8 个方位、多实例停靠和拖动不变。
3. 最大化后最小化，再恢复时仍为最大化状态。
4. 调用 `maximize()` 时退出最小化。
5. `ModalRef` 全部方法行为不变。
6. `Modal.destroyAll()` 仍能关闭全部状态的实例。
7. Modal 拖动、resize、最大化和标题栏样式不回归。

## 完成标准

- Drawer 完整提供声明式、受控和命令式最小化能力。
- Modal 与 Drawer 使用同一套通用 Dock 和容器生命周期实现。
- 两类组件可在同一方位稳定共存和堆叠。
- Drawer 恢复后保留内容状态和用户调整尺寸。
- Modal 公开 API 和既有功能无回归。
- 构建、Lint 与文档构建全部通过，关键交互完成手工验证。

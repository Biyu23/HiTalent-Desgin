---
category: Components
title: ResponsiveButtonGroup 响应式按钮组
toc: content
---

# ResponsiveButtonGroup 响应式按钮组

根据容器宽度自动计算可用空间，将平铺按钮自适应收起至“更多”下拉菜单中。

## 何时使用

- 工具栏、表格头部或卡片操作区包含较多按钮，需要在不同分辨率和容器尺寸下自适应排版。
- 需要按业务权重设定优先级，确保核心主操作（如新建、提交）保持可见，次要操作优先折叠。
- 操作需要在按钮态与下拉菜单态之间平滑切换，并共享异步 Loading、禁用态与 Tooltip 提示。

## 代码演示

<code src="./demo/basic.tsx" title="自适应排版与模式" description="体验容器宽度自适应、优先级排版、最小平铺保留数与异步 Promise Loading 保持状态。"></code>

<code src="./demo/custom-overflow.tsx" title="自定义溢出菜单" description="自定义“更多”按钮图标、文案、徽标及折叠项自定义渲染。"></code>

## API

响应式模式依赖 `ResizeObserver`；不支持时保持全部平铺，可由应用提供 polyfill。
“更多”按钮按全部操作项数量预留空间，数量减少时可能保留少量空隙，以避免临界宽度反复折叠。
`renderOverflowButton` 会用于隐藏测量（传入全部 `items`、`open=false`）；自定义触发器应保持固定宽度，不随 `count`、`collapsedItems` 或 `open` 改变，并避免渲染副作用。
单项与全局点击回调都会执行；返回的异步任务全部结束后才解除 loading、关闭菜单，并通过 `onActionError` 报告失败。

`className`、`style` 设置根容器；插槽仅开放更多按钮和弹层。

### ResponsiveButtonGroupProps

| 属性                    | 说明                                                           | 类型                                                                 | 默认值                 |
| ----------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------- |
| `items`                 | 操作项列表数据源                                               | `readonly ResponsiveButtonGroupItem[]`                               | -                      |
| `mode`                  | 展示模式（自适应 / 强制平铺 / 强制折叠）                       | `'responsive' \| 'expanded' \| 'collapsed'`                          | `'responsive'`         |
| `minVisibleCount`       | 必须保持平铺的最少按钮数（不包含“更多”按钮）                   | `number`                                                             | `0`                    |
| `gap`                   | 按钮之间的间距，单位为像素                                     | `number`                                                             | `8`                    |
| `overflowLabel`         | “更多”触发器按钮自定义展示文案                                 | `ReactNode`                                                          | locale 文案            |
| `overflowIcon`          | “更多”触发器按钮自定义图标                                     | `ReactNode`                                                          | `<EllipsisOutlined />` |
| `showOverflowCount`     | 是否在“更多”按钮上显示当前已折叠的项目数量                     | `boolean`                                                            | `true`                 |
| `overflowButtonProps`   | 透传给“更多”触发器 Button 的属性配置                           | `ButtonProps`                                                        | -                      |
| `overflowDropdownProps` | 透传给溢出 Dropdown 的属性配置                                 | `DropdownProps`                                                      | -                      |
| `overflowMenuProps`     | 透传给溢出 Menu 的属性配置                                     | `MenuProps`                                                          | -                      |
| `renderOverflowButton`  | 自定义“更多”触发器按钮的渲染函数                               | `(info: ResponsiveButtonGroupOverflowRenderInfo) => ReactNode`       | -                      |
| `onItemClick`           | 所有操作项的统一点击回调，返回 Promise 时自动保持 Loading 状态 | `(info: ResponsiveButtonGroupClickInfo) => void \| Promise<unknown>` | -                      |
| `onActionError`         | 异步操作执行出错时的回调                                       | `(error: unknown, info: ResponsiveButtonGroupClickInfo) => void`     | -                      |
| `onVisibleChange`       | 平铺项与折叠项集合发生变化时的回调                             | `(visibleKeys: string[], collapsedKeys: string[]) => void`           | -                      |
| `classNames`            | 支持 `overflowTrigger`、`popup`                                | `ResponsiveButtonGroupClassNames`                                    | -                      |
| `styles`                | 支持 `overflowTrigger`、`popup`                                | `ResponsiveButtonGroupStyles`                                        | -                      |

### ResponsiveButtonGroupItem

| 属性                  | 说明                                                                 | 类型                                                                 | 默认值  |
| --------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | ------- |
| `key`                 | 唯一字符串标识                                                       | `string`                                                             | -       |
| `label`               | 按钮及菜单项展示文案                                                 | `ReactNode`                                                          | -       |
| `icon`                | 按钮及菜单项图标                                                     | `ReactNode`                                                          | -       |
| `priority`            | 收起优先级，数值越小越早收起；相同权重时根据位置从后往前依次收起     | `number`                                                             | `0`     |
| `disabled`            | 是否禁用该项                                                         | `boolean`                                                            | `false` |
| `danger`              | 是否为危险操作项                                                     | `boolean`                                                            | `false` |
| `loading`             | 是否处于加载中（受控）                                               | `boolean`                                                            | `false` |
| `tooltip`             | 提示气泡，平铺按钮与折叠菜单项均生效                                 | `ButtonProps['tooltip']`                                             | -       |
| `buttonProps`         | 单项独立的 Button 属性配置                                           | `ResponsiveButtonGroupButtonProps`                                   | -       |
| `renderCollapsedItem` | 自定义折叠至下拉菜单时的单项渲染                                     | `(info: ResponsiveButtonGroupRenderInfo) => ReactNode`               | -       |
| `onClick`             | 点击回调，返回 Promise 时自动保持 Loading 状态并在完成后自动收起面板 | `(info: ResponsiveButtonGroupClickInfo) => void \| Promise<unknown>` | -       |

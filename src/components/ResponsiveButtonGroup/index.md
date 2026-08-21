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

<code src="./demo/basic.tsx" title="响应式按钮组综合演示" description="拖动滑块体验容器自适应、优先级排版、异步 Loading 状态保持与模式切换。"></code>

<code src="./demo/semantic-styles.tsx" title="语义化样式" description="定制可见区、溢出触发器、菜单 Portal 与菜单项插槽。"></code>

## API

### ResponsiveButtonGroupProps

| 属性                    | 说明                                     | 类型                                        | 默认值                 |
| ----------------------- | ---------------------------------------- | ------------------------------------------- | ---------------------- |
| `items`                 | 操作项列表                               | `readonly ResponsiveButtonGroupItem[]`      | -                      |
| `mode`                  | 展示模式（自适应 / 强制平铺 / 强制折叠） | `'responsive' \| 'expanded' \| 'collapsed'` | `'responsive'`         |
| `minVisibleCount`       | 最少保留的平铺按钮数（不含“更多”）       | `number`                                    | `0`                    |
| `gap`                   | 按钮间距（px）                           | `number`                                    | `8`                    |
| `buttonProps`           | 所有平铺按钮的统一属性                   | `ResponsiveButtonGroupButtonProps`          | -                      |
| `overflowLabel`         | “更多”按钮自定义文案                     | `ReactNode`                                 | locale 文案            |
| `overflowIcon`          | “更多”按钮图标                           | `ReactNode`                                 | `<EllipsisOutlined />` |
| `showOverflowCount`     | 是否在“更多”按钮上显示折叠项数量         | `boolean`                                   | `true`                 |
| `overflowButtonProps`   | “更多”触发器按钮属性                     | `ButtonProps`                               | -                      |
| `overflowDropdownProps` | 透传给 Dropdown 的属性                   | `DropdownProps`                             | -                      |
| `overflowMenuProps`     | 透传给 Menu 的属性                       | `MenuProps`                                 | -                      |
| `renderOverflowButton`  | 自定义“更多”按钮渲染                     | `(info) => ReactNode`                       | -                      |
| `onItemClick`           | 操作点击统一触发回调                     | `(info) => void \| Promise<unknown>`        | -                      |
| `onActionError`         | 异步操作失败回调                         | `(error, info) => void`                     | -                      |
| `onVisibleChange`       | 平铺与折叠项集合变化时的回调             | `(visibleKeys, collapsedKeys) => void`      | -                      |

### ResponsiveButtonGroupItem

| 属性                  | 说明                                                     | 类型                                 | 默认值  |
| --------------------- | -------------------------------------------------------- | ------------------------------------ | ------- |
| `key`                 | 唯一字符串标识                                           | `string`                             | -       |
| `label`               | 按钮及菜单项文案                                         | `ReactNode`                          | -       |
| `icon`                | 按钮及菜单项图标                                         | `ReactNode`                          | -       |
| `priority`            | 收起优先级，数值越小越早收起                             | `number`                             | `0`     |
| `disabled`            | 是否禁用                                                 | `boolean`                            | `false` |
| `danger`              | 是否为危险操作                                           | `boolean`                            | `false` |
| `loading`             | 是否处于加载中（受控）                                   | `boolean`                            | `false` |
| `tooltip`             | 提示气泡，平铺与折叠菜单均生效                           | `ButtonProps['tooltip']`             | -       |
| `buttonProps`         | 单项独立 Button 属性                                     | `ResponsiveButtonGroupButtonProps`   | -       |
| `renderCollapsedItem` | 自定义折叠菜单项内容                                     | `(info) => ReactNode`                | -       |
| `onClick`             | 点击回调，返回 Promise 时自动开启 Loading 并延迟收起面板 | `(info) => void \| Promise<unknown>` | -       |

## 语义化样式

组件项的 `key` 必须是唯一字符串。`rootClassName`、`classNames` 与 `styles` 支持 `root`、`visible`、`overflowTrigger`、`popup`、`menuItem` 插槽。`popup` 对应溢出菜单 Portal 根节点。

响应式测量只渲染每个按钮一次，并额外测量一个候选溢出按钮；不会为所有折叠数量渲染隐藏组合。

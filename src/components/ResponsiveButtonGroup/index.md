---
category: Components
title: ResponsiveButtonGroup 响应式按钮组
toc: content
---

# ResponsiveButtonGroup 响应式按钮组

根据自身容器宽度，在平铺按钮与“更多”菜单之间自动分配操作项。

## 何时使用

- 页面标题、卡片标题或 Table 工具栏中包含较多操作。
- 希望重要操作尽量保持可见，次要操作在空间不足时自动收起。
- 同一个操作需要在按钮态和菜单态之间切换，并共享 disabled、loading 与点击逻辑。

如果按钮数量固定且不需要响应式收起，可以直接使用 Ant Design `Space`、`Flex` 或 `Space.Compact`。

## 收起规则

- `priority` 越小越早收起，默认值为 `0`。
- `priority` 相同时，从视觉左侧开始收起；RTL 布局下会相应反转数据索引方向。
- 可见按钮和折叠菜单始终保持 `items` 的原始顺序。
- `minVisibleCount` 是硬约束；容器过窄时允许横向溢出，也不会继续减少可见按钮。

## 代码演示

<code src="./demo/basic.tsx" title="基础响应式" description="调整容器宽度，观察操作按 priority 自动收起和恢复。"></code>

<code src="./demo/modes.tsx" title="展示模式" description="支持 responsive、expanded 和 collapsed 三种模式。"></code>

<code src="./demo/custom.tsx" title="自定义与异步状态" description="自定义折叠菜单项和更多按钮，并在两种形态间共享 Promise loading。"></code>

## API

### ResponsiveButtonGroupProps

| 属性                    | 说明                                         | 类型                                        | 默认值             |
| ----------------------- | -------------------------------------------- | ------------------------------------------- | ------------------ |
| `items`                 | 操作项                                       | `readonly ResponsiveButtonGroupItem[]`      | -                  |
| `mode`                  | 响应式、强制展开或强制折叠                   | `'responsive' \| 'expanded' \| 'collapsed'` | `'responsive'`     |
| `minVisibleCount`       | 至少保留的平铺按钮数，不包含“更多”           | `number`                                    | `0`                |
| `gap`                   | 按钮间距，单位 px                            | `number`                                    | `8`                |
| `buttonProps`           | 所有业务按钮的公共属性                       | `ResponsiveButtonGroupButtonProps`          | -                  |
| `overflowLabel`         | “更多”按钮文案                               | `ReactNode`                                 | locale 文案        |
| `overflowIcon`          | “更多”按钮图标                               | `ReactNode`                                 | `EllipsisOutlined` |
| `showOverflowCount`     | 是否显示收起数量                             | `boolean`                                   | `true`             |
| `overflowButtonProps`   | “更多”按钮属性                               | `ButtonProps`                               | -                  |
| `overflowDropdownProps` | Dropdown 属性，内部接管 `children` 和 `menu` | `DropdownProps`                             | -                  |
| `overflowMenuProps`     | Menu 属性，内部接管 `items` 和 `onClick`     | `MenuProps`                                 | -                  |
| `renderOverflowButton`  | 自定义“更多”触发内容                         | `(info) => ReactNode`                       | -                  |
| `onItemClick`           | 任一操作触发后的统一回调                     | `(info) => void \| Promise<unknown>`        | -                  |
| `onVisibleChange`       | 平铺与折叠 key 集合变化                      | `(visibleKeys, collapsedKeys) => void`      | -                  |

同时支持 `className`、`style`、`tabIndex`、`data-*` 和 `aria-*` 原生属性。

### ResponsiveButtonGroupItem

| 属性                  | 说明                                       | 类型                                 | 默认值  |
| --------------------- | ------------------------------------------ | ------------------------------------ | ------- |
| `key`                 | 唯一标识                                   | `React.Key`                          | -       |
| `label`               | 按钮及默认菜单文案                         | `ReactNode`                          | -       |
| `icon`                | 按钮及默认菜单图标                         | `ReactNode`                          | -       |
| `priority`            | 收起权重，数值越小越早收起                 | `number`                             | `0`     |
| `disabled`            | 是否禁用                                   | `boolean`                            | `false` |
| `danger`              | 是否为危险操作                             | `boolean`                            | `false` |
| `loading`             | 受控 loading                               | `boolean`                            | `false` |
| `tooltip`             | 平铺按钮提示                               | `ButtonProps['tooltip']`             | -       |
| `buttonProps`         | 单项 Button 属性，优先于公共 `buttonProps` | `ResponsiveButtonGroupButtonProps`   | -       |
| `renderCollapsedItem` | 自定义折叠态内容，不接管菜单行为           | `(info) => ReactNode`                | -       |
| `onClick`             | 操作回调，返回 Promise 时自动管理 loading  | `(info) => void \| Promise<unknown>` | -       |

点击信息中的 `source` 为 `'button'` 或 `'overflow'`，可用于区分操作来自平铺按钮还是“更多”菜单。

## 模式

- `responsive`：根据组件容器的实际宽度自动计算。
- `expanded`：始终平铺全部操作；不足时横向溢出。
- `collapsed`：除 `minVisibleCount` 要求保留的操作外，其余全部收起。

## 注意事项

- 组件依赖真实 DOM 尺寸；SSR 和客户端首次测量前会先平铺全部按钮。
- 第一版只接受 `items`，不自动转换 Upload、Dropdown、Popconfirm 等复合控件。
- `buttonProps` 用于按钮视觉和通用交互配置；链接跳转、表单提交及元素身份属性请统一通过 item `onClick` 实现，避免折叠前后行为不一致。
- `renderCollapsedItem` 和 `renderOverflowButton` 应保持纯渲染，避免根据调用次数产生副作用。
- 自定义“更多”触发内容时，应保留可聚焦元素和清晰的无障碍名称。
- `onClick` 与 `onItemClick` 返回的 Promise 会共同决定该 item 的自动 loading。

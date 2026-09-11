---
category: Components
title: PopoverSelect 气泡选择
toc: content
---

# PopoverSelect 气泡选择

以 Popover 气泡卡片承载选择面板，提供虚拟滚动、搜索过滤、全选、字段映射、多选确认机制与分隔符字符串提交格式。

## 何时使用

- 需要以气泡卡片（Popover）形态呈现选择面板，节省页面空间。
- 选项数量大，需要虚拟滚动保持打开、搜索和滚动流畅。
- 后端字段并非固定的 `label` / `value` 结构，需要直接映射。
- 多选需要确认、取消、清空等草稿确认操作或针对当前搜索结果全选。
- 接口要求提交分隔符字符串字段，同时根据选项恢复数字或字符串值类型。

## 代码演示

<code src="./demo/basic.tsx" title="基础单选" description="支持气泡单选、搜索过滤、一键清空与自定义字段名映射（fieldNames）。"></code>

<code src="./demo/multiple.tsx" title="多选确认与标签截断" description="多选模式支持确认、取消与清空草稿操作，并可通过 maxTagCount 实现超出标签自动 (+N) 截断展示。"></code>

<code src="./demo/string-value.tsx" title="字符串提交与全选" description="valueType='string' 按 valueSeparator 分割和提交字符串，并根据 options 恢复值类型；showSelectAll 支持全选联动当前搜索过滤结果。"></code>

## 候选项拖拽排序

<code src="./demo/sortable.tsx" title="候选项拖拽排序" description="通过独立手柄调整候选项顺序，支持普通列表与虚拟滚动，勾选结果单独确认。"></code>

设置 `sortable` 开启排序，并通过 `onSortChange` 更新 `options`：

```tsx | pure
<PopoverSelect options={options} sortable onSortChange={setOptions} />
```

- `options` 是候选项顺序的数据源；回调返回新的完整数组，保留原始选项对象及自定义字段，组件不会修改传入数组。不回传 `options` 时列表保持原顺序。
- 排序完成后立即触发 `onSortChange`，不触发 `onChange`，也不改变已选值顺序。确认、取消按钮仅作用于选择草稿，不撤销已提交的排序。
- 搜索框有非空白内容时暂停排序，清空搜索后恢复。禁用项不能发起拖拽，但可能因其他项移动而改变位置。
- 手柄支持鼠标、触摸及键盘：聚焦手柄后按空格键开始，上下方向键移动，空格键完成，Escape 取消。
- `optionRender` 可继续自定义选项内容；若 `dropdownRender` 完全替换默认菜单，拖拽交互也由自定义菜单负责。

## API

### 组件分工与扩展

`PopoverSelect` 提供选择状态、搜索、全选和确认流程；`PopoverSelect.Selector` 只负责触发器、弹层开关和宽度跟随，可以独立承载任意内容。

<code src="./demo/custom.tsx" title="自定义菜单、底部与独立弹层" description="渲染回调获得只读状态与语义化操作，复用组件内部确认流程。"></code>

| 扩展点                          | 用途                                                            |
| ------------------------------- | --------------------------------------------------------------- |
| `optionRender(item, info)`      | 自定义选项内容，`info` 包含 `value`、`selected`、`disabled`     |
| `dropdownRender(menu, context)` | 包装或替换候选列表，搜索框和底部仍由面板管理                    |
| `footerRender(footer, context)` | 自定义底部操作；返回 `null` 隐藏底部                            |
| `labelRender(label, info)`      | 自定义已提交值的展示，`info` 包含 `values` 和对应原始 `options` |

`context` 提供 `options`、`displayOptions`（规范化选项，原始对象在 `source`）、`selectedValues`、`searchValue`、`mode`、`confirmRequired`，以及 `toggleValue(value)`、`selectAll(checked)`、`clear()`、`confirm()`、`cancel()`。

开启确认模式时，`context.selectedValues` 是草稿，切换、全选、清空只更新草稿；`confirm()` 提交并关闭，`cancel()` 放弃草稿并请求关闭。外部实际选中值变化时同步草稿，仅重排候选项不会覆盖草稿。即时模式直接提交，`confirm()` 只请求关闭。触发器的清除图标始终直接清空已提交值。

原有单参数 `optionRender`、`dropdownRender` 和无参数 `Selector.content` 回调可继续使用。受控 `open` 需要在 `onOpenChange` 中回传新状态。

### 独立 Selector

```tsx | pure
<PopoverSelect.Selector
  content={({ close }) => <button onClick={close}>完成</button>}
>
  打开自定义面板
</PopoverSelect.Selector>
```

`content` 接受节点或 `({ open, close }) => ReactNode`。Selector 共享 `open`、`defaultOpen`、`onOpenChange`、`afterOpenChange`、`placement`、`getPopupContainer`、`autoAdjustOverflow`、`destroyTooltipOnHide`，并支持 `children`、`hasValue`、`allowClear`、`onClear`、`disabled`、`showArrow`、`ellipsis` 和样式属性。Selector 不管理任何选择数据，清除事件由使用方处理。

### 基础属性

除下表属性外，组件同时支持 `className`、`style`、`rootClassName` 等原生属性。

### PopoverSelectProps

| 属性                   | 说明                                                   | 类型                                        | 默认值                |
| ---------------------- | ------------------------------------------------------ | ------------------------------------------- | --------------------- |
| `options`              | 数据选项列表                                           | `OptionType[]`                              | `[]`                  |
| `sortable`             | 是否开启候选项手柄拖拽排序，搜索时暂停                 | `boolean`                                   | `false`               |
| `onSortChange`         | 排序结束后返回全部原始选项，请更新 `options` 回传      | `(options: OptionType[]) => void`           | -                     |
| `placeholder`          | 选择框提示内容                                         | `ReactNode`                                 | -                     |
| `showSearch`           | 是否显示搜索框进行本地过滤                             | `boolean`                                   | `false`               |
| `allowClear`           | 是否允许一键清除                                       | `boolean`                                   | `false`               |
| `mode`                 | 选择模式，单选或多选                                   | `'single' \| 'multiple'`                    | `'single'`            |
| `value`                | 当前选中值（受控）                                     | `ValueType \| ValueType[] \| string`        | -                     |
| `defaultValue`         | 默认选中值（非受控）                                   | `ValueType \| ValueType[] \| string`        | -                     |
| `onChange`             | 选中值与选项变化回调                                   | `(value, options) => void`                  | -                     |
| `valueType`            | 多选模式下值提交类型，支持数组或分隔符字符串           | `'array' \| 'string'`                       | `'array'`             |
| `valueSeparator`       | 字符串模式下解析与提交值使用的分隔符                   | `string`                                    | `','`                 |
| `fieldNames`           | 后端自定义字段名映射                                   | `PopoverSelectFieldNames<OptionType>`       | -                     |
| `showConfirm`          | 多选时是否显示确认按钮（开启时进入草稿确认流程）       | `boolean`                                   | `mode === 'multiple'` |
| `showCancelBtn`        | 是否显示取消按钮，点击放弃草稿更改                     | `boolean`                                   | `false`               |
| `showClearBtn`         | 是否显示清空按钮，点击清空当前草稿/选中值              | `boolean`                                   | `false`               |
| `showSelectAll`        | 多选时是否显示全选复选框（与当前搜索过滤联动）         | `boolean`                                   | `false`               |
| `maxTagCount`          | 多选时最多展示的标签数量，超出部分截断并显示 `(+N)`    | `number`                                    | -                     |
| `separator`            | 多选展示时的分隔符                                     | `string`                                    | `', '`                |
| `ellipsis`             | 是否支持文本截断与 Tooltip 提示，可自定义 Tooltip 内容 | `boolean \| { tooltip?: string }`           | `true`                |
| `virtual`              | 是否启用虚拟滚动                                       | `boolean`                                   | `true`                |
| `listHeight`           | 下拉列表最大高度，单位 px                              | `number`                                    | `150`                 |
| `listItemHeight`       | 虚拟列表单项高度，单位 px                              | `number`                                    | `34`                  |
| `showArrow`            | 是否显示下拉箭头                                       | `boolean`                                   | `true`                |
| `disabled`             | 是否禁用组件                                           | `boolean`                                   | `false`               |
| `dropdownRender`       | 自定义候选列表渲染                                     | `(menu, context) => ReactElement`           | -                     |
| `optionRender`         | 自定义单个选项内容渲染                                 | `(item, info) => ReactNode`                 | -                     |
| `footerRender`         | 自定义底部操作区                                       | `(footer, context) => ReactNode`            | -                     |
| `labelRender`          | 自定义已提交值展示                                     | `(label, info) => ReactNode`                | -                     |
| `defaultOpen`          | 非受控初始展开状态                                     | `boolean`                                   | `false`               |
| `open`                 | 气泡下拉弹窗展开状态（受控）                           | `boolean`                                   | -                     |
| `onOpenChange`         | 气泡下拉弹窗展开状态变化回调                           | `(open: boolean) => void`                   | -                     |
| `afterOpenChange`      | 气泡弹窗动画完成后的回调                               | `(open: boolean) => void`                   | -                     |
| `placement`            | 气泡框展开方位                                         | `TooltipPlacement`                          | `'bottomLeft'`        |
| `getPopupContainer`    | 浮层渲染挂载父节点                                     | `(triggerNode: HTMLElement) => HTMLElement` | -                     |
| `autoAdjustOverflow`   | 气泡被遮挡时是否自动调整位置                           | `boolean`                                   | `true`                |
| `destroyTooltipOnHide` | 关闭时是否销毁浮层内部 DOM                             | `boolean`                                   | `false`               |
| `classNames`           | 自定义各插槽类名                                       | `PopoverSelectClassNames`                   | -                     |
| `styles`               | 自定义各插槽行内样式                                   | `PopoverSelectStyles`                       | -                     |

### PopoverSelectClassNames

| 属性          | 说明                                           | 类型     |
| ------------- | ---------------------------------------------- | -------- |
| `root`        | 根容器的 className                             | `string` |
| `trigger`     | 触发器按钮的 className                         | `string` |
| `triggerText` | 触发器内部文本容器的 className                 | `string` |
| `actions`     | 触发器右侧操作区（箭头与清除图标）的 className | `string` |
| `popup`       | 弹出气泡容器的 className                       | `string` |
| `search`      | 搜索输入框区域的 className                     | `string` |
| `selectAll`   | 全选复选框区域的 className                     | `string` |
| `menu`        | 选项菜单列表的 className                       | `string` |
| `item`        | 单个选项节点的 className                       | `string` |
| `footer`      | 底部操作按钮区域的 className                   | `string` |
| `empty`       | 空状态区域的 className                         | `string` |

### PopoverSelectStyles

| 属性      | 说明                   | 类型                  |
| --------- | ---------------------- | --------------------- |
| `root`    | 根容器的行内样式       | `React.CSSProperties` |
| `trigger` | 触发器按钮的行内样式   | `React.CSSProperties` |
| `popup`   | 弹出气泡容器的行内样式 | `React.CSSProperties` |
| `menu`    | 选项菜单列表的行内样式 | `React.CSSProperties` |

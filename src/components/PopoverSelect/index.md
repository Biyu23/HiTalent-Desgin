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

## API

除下表属性外，组件同时支持 `className`、`style`、`rootClassName` 等原生属性。

### PopoverSelectProps

| 属性                   | 说明                                                   | 类型                                        | 默认值                |
| ---------------------- | ------------------------------------------------------ | ------------------------------------------- | --------------------- |
| `options`              | 数据选项列表                                           | `OptionType[]`                              | `[]`                  |
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
| `dropdownRender`       | 自定义下拉面板渲染                                     | `(menu: ReactElement) => ReactElement`      | -                     |
| `optionRender`         | 自定义单个选项内容渲染                                 | `(item: OptionType) => ReactNode`           | -                     |
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

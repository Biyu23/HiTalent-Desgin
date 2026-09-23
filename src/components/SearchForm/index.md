---
category: Components
title: SearchForm 搜索表单
toc: content
---

# SearchForm 搜索表单

`SearchForm` 用于承载列表页、文件管理、候选人库等场景的多条件筛选能力。组件支持平铺模式、页面内菜单模式以及联合协同模式，状态统一流转并内置已选条件区（Active Filters）。

## 何时使用

- 筛选字段较少（4~8 个），需要快速在页面顶部平铺检索并支持阈值折叠展开。
- 筛选字段分类明确且数量较多（十几个到几十个），需要在侧栏中展示业务分组与快捷勾选。
- 需要将“常用平铺筛选”与“高级抽屉筛选”组合使用，共用同一套已选标签与查询逻辑。

## 代码演示

<code src="./demo/basic.tsx" title="平铺模式与阈值展开" description="平铺展示筛选表单项，超出默认展示数量时提供平滑的展开更多/收起操作。"></code>

<code src="./demo/inline-form.tsx" title="直接表单布局" description="设置 inlineLayout 为 form，直接展示控件，按容器宽度自动换列，支持搜索、重置和字段校验。"></code>

<code src="./demo/menu.tsx" title="菜单模式与业务分组" description="只封装分组、快捷筛选和字段内容；标题、宽高与滚动区域由业务侧设置。"></code>

<code src="./demo/combined.tsx" title="联合协同模式" description="顶部平铺高频常用筛选，末尾按钮唤起侧边高级抽屉，状态统一互通。"></code>

<code src="./demo/custom-tag.tsx" title="自定义已选条件标签" description="通过 formatTag 自定义已选条件在标签区的渲染文案与折叠逻辑。"></code>

## API

表单值统一由 `Form` 实例管理，外部 `setFieldsValue`、`setFieldValue`、`resetFields` 会同步标签与字段显隐，但不会自动触发查询。组件内部查询会读取完整表单值，包括尚未打开的弹层字段；隐藏字段保留已有值。

平铺弹层使用独立草稿，点击确定时校验当前字段并提交查询；关闭弹层不提交。`children(form)` 始终接收主表单，可读取其他字段实现联动。菜单及抽屉直接修改主表单，`change` 模式下随字段修改查询，`submit` 模式下点击搜索查询。菜单和联合模式提交时会校验可见且未禁用的字段，包括尚未展开的分组与字段；校验失败会展开面板，抽屉保持打开。过期的异步提交不会触发查询或展开面板；重置会取消尚未完成的提交。

删除标签或点击字段清空统一触发 `tag-remove` 查询，并保留自定义 `onClear` 的实际结果。重置和“清空全部”均恢复初始值，同时触发 `onReset` 与 `reset` 查询。`initialValues` 优先于字段 `initialValue`；不再从 `formItemProps.initialValue` 设置默认值。

`menu` 模式在页面内展示分组和操作按钮；只有 `combined` 模式使用抽屉。移除了从未生效的 `span` 属性。默认标签统一显示值的文本形式，业务文案（如布尔值、长数组摘要）请使用 `formatTag`。

`className`、`style` 设置根容器。`classNames` 和 `styles` 均支持 `form`、`actions`、`activeFilters`、`menu`、`drawer`、`quickFilters`、`group`；`actions` 同时用于抽屉操作区。

### 布局与扩展

- 默认 `inlineLayout="popover"`：等高筛选按钮，选中后展示值摘要，确认弹层后查询；`formatTag` 同时控制按钮摘要。
- `inlineLayout="form"`：直接显示表单控件，`inlineMinWidth` 控制最小列宽；窄容器自动单列。搜索会校验可见且未禁用的字段（包含折叠项），校验失败会展开全部字段；折叠不丢值。隐藏字段保留值但不参与此校验。
- `menu` 只输出筛选内容，不内置标题、宽高或滚动容器。`quick` 字段放入顶部“快捷筛选”，默认收起；分组标题右侧为展开箭头，字段右侧为加减号。
- 菜单操作区在正常文档流中。`actionExtra` 支持平铺、菜单和抽屉；同时关闭 `showSearchButton`、`showResetButton` 可完全由业务侧提供操作。
- 设置 `fields[].disabled` 可禁用单个字段及其标签删除；整体重置仍恢复所有初始值。删除标签会额外调用 `onValuesChange`，包括 `onClear` 修改的关联字段。

如需固定高度、内部滚动，由业务侧设置：

```tsx | pure
<SearchForm
  mode="menu"
  fields={fields}
  groups={groups}
  showActiveFilters={false}
  style={{ height: 560 }}
  styles={{ menu: { flex: 1, minHeight: 0, overflowY: 'auto' } }}
/>
```

### SearchForm

| 属性                | 说明                                                                         | 类型                                                                                          | 默认值       |
| ------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------ |
| mode                | 展示模式：`inline`（平铺） \| `menu`（页面内菜单） \| `combined`（联合模式） | `'inline' \| 'menu' \| 'combined'`                                                            | `'inline'`   |
| inlineLayout        | 平铺布局：筛选按钮或直接表单                                                 | `'popover' \| 'form'`                                                                         | `'popover'`  |
| inlineMinWidth      | 直接表单最小列宽（px）                                                       | `number`                                                                                      | `200`        |
| fields              | 筛选项字段定义列表                                                           | `SearchFormFieldItem[]`                                                                       | `[]`         |
| groups              | 业务分组配置（菜单及 combined 抽屉）                                         | `SearchFieldGroup[]`                                                                          | -            |
| form                | 外部传入的 Ant Design Form 实例（支持外部受控操作）                          | `FormInstance`                                                                                | -            |
| initialValues       | 初始默认表单值                                                               | `Record<string, unknown>`                                                                     | -            |
| onSearch            | 触发搜索查询回调                                                             | `(values: Values, info: { source: 'submit' \| 'change' \| 'tag-remove' \| 'reset' }) => void` | -            |
| onReset             | 触发重置回调                                                                 | `() => void`                                                                                  | -            |
| onValuesChange      | 字段值变动回调                                                               | `(changedValues: Partial<Values>, allValues: Values) => void`                                 | -            |
| searchMode          | 搜索触发方式：`submit`（点击搜索统一提交） \| `change`（表单项变动即触发）   | `'submit' \| 'change'`                                                                        | `'submit'`   |
| defaultVisibleCount | 平铺展示模式下默认显示的字段数量阈值，超出部分支持展开/收起                  | `number`                                                                                      | `4`          |
| defaultExpanded     | 是否默认展开全部平铺字段                                                     | `boolean`                                                                                     | `false`      |
| expanded            | 是否受控平铺展开状态                                                         | `boolean`                                                                                     | -            |
| onExpandedChange    | 平铺展开/收起状态变化回调                                                    | `(expanded: boolean) => void`                                                                 | -            |
| showActiveFilters   | 是否展示已选条件区（Active Filters Bar）                                     | `boolean`                                                                                     | `true`       |
| showSearchButton    | 是否展示搜索按钮                                                             | `boolean`                                                                                     | `true`       |
| showResetButton     | 是否展示重置按钮                                                             | `boolean`                                                                                     | `true`       |
| searchText          | 搜索按钮文案                                                                 | `ReactNode`                                                                                   | `'搜索'`     |
| resetText           | 重置按钮文案                                                                 | `ReactNode`                                                                                   | `'重置'`     |
| menuTitle           | 抽屉面板标题（仅 combined 模式）                                             | `ReactNode`                                                                                   | `'搜索条件'` |
| menuTrigger         | 唤起抽屉的按钮文案或节点                                                     | `ReactNode`                                                                                   | `'高级筛选'` |
| actionExtra         | 自定义操作区额外内容渲染                                                     | `ReactNode`                                                                                   | -            |
| disabled            | 是否禁用全部字段                                                             | `boolean`                                                                                     | `false`      |
| classNames          | 语义化类名定制                                                               | `SearchFormClassNames`                                                                        | -            |
| styles              | 语义化样式定制                                                               | `SearchFormStyles`                                                                            | -            |

### SearchFormFieldItem

| 属性            | 说明                                                 | 类型                                                     | 默认值  |
| --------------- | ---------------------------------------------------- | -------------------------------------------------------- | ------- |
| name            | 字段唯一标识，对应 Form 的 name                      | `string`                                                 | -       |
| label           | 字段标签文案                                         | `ReactNode`                                              | -       |
| children        | 字段表单控件渲染内容（元素或接收 form 的渲染函数）   | `ReactNode \| ((form: FormInstance) => ReactNode)`       | -       |
| formItemProps   | 传递给内部 `Form.Item` 的属性                        | `FormItemProps`                                          | -       |
| initialValue    | 初始默认值                                           | `unknown`                                                | -       |
| group           | 所属分组 key（menu 模式有效）                        | `string`                                                 | -       |
| quick           | 是否作为快捷筛选（菜单及抽屉顶部）                   | `boolean`                                                | `false` |
| pinned          | 是否在平铺收起状态下始终固定展示                     | `boolean`                                                | `false` |
| formatTag       | 自定义已选条件标签文案，返回 false/null 时不生成标签 | `(value, allValues, form) => ReactNode \| false \| null` | -       |
| onClear         | 自定义单个 Tag 清除时的回调逻辑                      | `(form: FormInstance) => void`                           | -       |
| hidden          | 是否隐藏字段                                         | `boolean \| ((values, form) => boolean)`                 | -       |
| disabled        | 禁用字段编辑及单独清除                               | `boolean`                                                | `false` |
| defaultExpanded | 菜单字段默认展开                                     | `boolean`                                                | `false` |
| maxTagCount     | 菜单字段最多显示标签数，其余折叠                     | `number`                                                 | `3`     |

### SearchFieldGroup

| 属性            | 说明             | 类型        | 默认值 |
| --------------- | ---------------- | ----------- | ------ |
| key             | 分组唯一标识     | `string`    | -      |
| title           | 分组标题         | `ReactNode` | -      |
| defaultExpanded | 是否默认展开     | `boolean`   | `true` |
| extra           | 分组右侧扩展内容 | `ReactNode` | -      |

### SearchFormRef

| 方法        | 说明                                                                                      | 类型                     |
| ----------- | ----------------------------------------------------------------------------------------- | ------------------------ |
| form        | 获取内部 Ant Design Form 实例                                                             | `FormInstance`           |
| submit      | 手动触发查询；直接表单、菜单及联合模式等待校验，成功返回 true，失败、过期或禁用返回 false | `() => Promise<boolean>` |
| resetFields | 重置所有字段并触发查询                                                                    | `() => void`             |
| openMenu    | 打开侧边抽屉面板                                                                          | `() => void`             |
| closeMenu   | 关闭侧边抽屉面板                                                                          | `() => void`             |

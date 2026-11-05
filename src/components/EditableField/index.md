---
category: Components
title: EditableField 可编辑字段
toc: content
---

# EditableField 可编辑字段

默认只读，鼠标移入后显示编辑入口，点击后展示业务提供的编辑器。

<code src="./demo/basic.tsx">浮层编辑、原位编辑与保存校验</code>

## 交互约定

- **悬停不挤动布局**：高亮只改变背景，编辑按钮绝对定位覆盖在右侧，不改变宽高、边距。长内容末尾可能被按钮遮住；组件不自动添加留白。
- **平滑过渡**：背景与按钮使用主题 motion token，编辑按钮轻移 3px；浮层沿用 Popover 动画，原位编辑单独淡入。
- **浮层编辑（默认）**：只读内容始终保留，编辑器不参与原页面布局。
- **原位编辑**：编辑器替换只读内容，高度由编辑器和操作区决定，不承诺编辑期间高度不变。
- **草稿隔离**：进入编辑时读取最新 value，编辑中外部 value 更新不会覆盖草稿。对象和数组需不可变更新。
- **保存顺序**：执行 onSave，成功后触发 onChange，再退出编辑。调用方须在 onChange 中更新受控 value。
- **失败重试**：onSave 抛出 Error 或返回拒绝的 Promise 时保留草稿，组件不展示错误；业务在 onSave 中自行校验并提示。
- **明确退出**：取消丢弃草稿；移出鼠标、点击外部均不退出，嵌套选择器可以正常操作。保存中禁用保存和取消，编辑器请使用 saving 禁用输入。
- 原内容的链接保持可点击；编辑按钮和编辑区点击不会冒泡触发外层点击事件。
- 组件会增加一个无额外内边距的块级容器。在 flex/grid 表单中，请把原布局需要的 className/style 设置在组件上。

## 最小用法

```tsx | pure
<EditableField
  value={name}
  onChange={setName}
  renderValue={(value) => <>姓名　{value}</>}
  renderEditor={({ value, onChange, saving }) => (
    <Input
      autoFocus
      disabled={saving}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )}
  onSave={(value) => api.saveName(value)}
/>
```

## onSave 返回约定

编辑器的规则、校验时机和错误提示由调用方决定，组件不提供 rules，也不接入 Form。

- 传入 onSave 时必须返回 Promise，pending 期间保持 Loading。
- resolve 表示成功，触发 onChange 并关闭编辑区；resolve 的返回值不参与更新，提交的仍是草稿。
- reject 表示失败，只结束 Loading，保留草稿供修改或重试。
- 不传 onSave 时直接提交。不要用 resolve(false) 表示失败，也不要捕获失败后不重新 reject。

```tsx | pure
onSave={async (value) => {
  // 这里也可以等待调用方自己的 form.validateFields()。
  if (!value.trim()) {
    message.error('请输入名称');
    throw new Error('请输入名称'); // 等同于 Promise.reject(...)
  }
  await api.saveName(value); // 成功后 async 函数自动 resolve
}}
```

## 样式定制

默认使用 Ant Design 的中性背景、文字、圆角和间距 token，随主题切换，不额外定义品牌色。保存按钮沿用主题主色。

`styles` 和 `classNames` 支持 `root / action / editor / footer / popup` 五个区域；popup 对应浮层外框。容器 `style` 优先于 `styles.root`。

```tsx | pure
<EditableField
  value={name}
  onChange={setName}
  renderValue={(value) => value}
  renderEditor={({ value, onChange, saving }) => (
    <Input
      disabled={saving}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )}
  style={{
    '--editable-field-hover-bg': 'var(--field-hover-background)',
    '--editable-field-action-bg': 'var(--field-action-background)',
  }}
  styles={{
    root: { borderRadius: 6 },
    editor: { gap: 16 },
    footer: { justifyContent: 'flex-end' },
  }}
/>
```

以上背景变量由业务定义。不传配置时，悬停背景使用 colorFillTertiary，按钮背景使用 colorBgContainer。编辑入口始终绝对定位，不改变只读字段尺寸。

## API

| 属性                | 说明                                                    | 默认值       |
| ------------------- | ------------------------------------------------------- | ------------ |
| value               | 已提交的受控值，支持泛型                                | 必填         |
| onChange            | 保存成功后更新受控值                                    | 必填         |
| renderValue         | 只读内容渲染                                            | 必填         |
| renderEditor        | 编辑器渲染，参数为 `{ value, onChange, saving }`        | 必填         |
| onSave              | 业务校验和保存，返回 Promise；resolve 成功，reject 失败 | —            |
| mode                | `popup` 或 `inline`                                     | `popup`      |
| disabled            | 禁止进入编辑；默认继承 ConfigProvider                   | —            |
| actionVisibility    | `hover` 或 `always`                                     | `hover`      |
| popupWidth          | 浮层编辑区宽度，受视口宽度限制                          | `320`        |
| placement           | 浮层方向，沿用 Popover                                  | `bottomLeft` |
| getPopupContainer   | 自定义浮层挂载容器                                      | —            |
| styles / classNames | root、action、editor、footer、popup 的样式和类名        | —            |
| className / style   | 字段容器样式                                            | —            |

中英文文案接入 ConfigProvider，可通过 `localeOverrides.EditableField` 覆盖编辑、保存和取消文案。

第一版不包含自动保存、失焦提交和通用表单校验器。需要复合编辑时，通过 renderEditor 组合现有组件即可。

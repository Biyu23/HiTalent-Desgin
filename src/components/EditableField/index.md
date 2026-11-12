---
category: Components
title: EditableField 可编辑字段
toc: content
---

# EditableField 可编辑字段

管理展示与编辑切换，支持原位、Popover、Modal 三种编辑容器。编辑器通过函数式 children 提供，自行管理草稿、校验、保存请求和操作按钮。

<code src="./demo/basic.tsx">悬停入口、自定义按钮、Modal、只读和 Form 接入</code>

## 数据与提交

- `value` 是已确认的受控值；调用方或 Form.Item 负责更新。
- `renderValue(value)` 渲染展示内容，需处理未初始化的 `undefined`。
- `children({ value, submit, cancel })` 仅在编辑期间渲染。用传入的 value 初始化编辑器自己的草稿。
- `submit(nextValue)` 同步触发外层 onChange，然后退出编辑。输入和取消均不触发 onChange。
- `cancel()` 退出并卸载编辑器。再次打开重新初始化；编辑中外部值刷新不会重置使用 useState 初始化的草稿。
- 不提供默认保存、取消按钮，也不提供 onSave、saving 或内部草稿 onChange。
- children 是渲染函数，不能在其中直接调用 Hook；有状态的编辑逻辑放在独立组件中。

```tsx | pure
function NameEditor({ value, submit, cancel }) {
  const [draft, setDraft] = useState(value ?? '');
  return (
    <Space>
      <Input value={draft} onChange={(event) => setDraft(event.target.value)} />
      <Button onClick={cancel}>取消</Button>
      <Button type="primary" onClick={() => submit(draft)}>
        保存
      </Button>
    </Space>
  );
}

<EditableField
  value={name}
  onChange={setName}
  renderValue={(value) => value ?? '未填写'}
>
  {(context) => <NameEditor {...context} />}
</EditableField>;
```

业务需要校验或异步保存时，在编辑器内完成后再调用 submit。onChange 只是同步值通知，不等待其返回的 Promise。请求失败时不调用 submit，编辑器保持打开；错误提示和 loading 也由编辑器负责。

## 编辑入口与只读

- `trigger="action"`：点击右侧编辑按钮打开，默认悬停显示；触屏下常驻显示。
- `actionVisibility="always"`：按钮常驻显示。
- `renderAction({ onClick })`：替换整个右侧按钮，将 onClick 绑定到编辑入口。
- `trigger="value"`：点击展示值打开，不显示右侧按钮。建议此时展示内容使用文本等非交互节点，避免链接与编辑动作冲突。
- `readOnly`：不显示入口，禁止展示区域内链接、按钮的鼠标和键盘操作。只读时可以不传 children。
- `disabled`：操作限制与只读一致，默认继承 Ant Design ConfigProvider 的 componentDisabled；实例 disabled 可覆盖全局设置，readOnly 始终优先。
- 编辑中切换为只读或禁用会关闭编辑器。只读内容通过原生 inert 隔离交互，需要支持 inert 的浏览器；业务渲染到组件之外的独立 Portal 仍应自行遵守权限。

悬停只改变背景和按钮透明度，不改变布局。按钮绝对定位覆盖右侧，长文本可通过 styles.value 预留右侧空间。默认保留 action 模式下展示内容的链接交互；编辑入口和编辑区点击不会冒泡到外层列表。

## 编辑容器

| mode   | 行为                                             |
| ------ | ------------------------------------------------ |
| inline | 在原位置显示编辑器，隐藏展示区，高度随编辑器变化 |
| popup  | 默认；保留展示区，在 Popover 中编辑，不挤动页面  |
| modal  | 保留展示区，在 Ant Design Modal 中编辑           |

三种容器共用相同的 children 协议。关闭时卸载编辑器，下次打开从外部最新值开始。

Popover 默认 bottomLeft、宽度 320px，点击外部不关闭，不拦截嵌套 Select 的交互。通过 popoverProps 配置方向、标题、挂载位置和外框样式。

Modal 默认使用“编辑”作为标题，footer 为 null，不生成额外保存按钮。关闭按钮、Esc 执行取消；遮罩点击不关闭。通过 modalProps 设置 title、width、centered、closable、keyboard、getContainer 和外框样式。需要保存期间禁止关闭时，业务将 saving 状态提升到外层，并设置 closable=false、keyboard=false。

## Ant Design Form

```tsx | pure
<Form initialValues={{ name: '张三' }}>
  <Form.Item name="name">
    <EditableField<string> renderValue={(value) => value ?? '未填写'}>
      {(context) => <NameEditor {...context} />}
    </EditableField>
  </Form.Item>
</Form>
```

Form.Item 注入 value 和 onChange，不需要额外配置 trigger。输入和取消不改变 Form，只有 submit 更新字段值。id 会传到字段根元素，支持 Form 定位。

外层 Form.Item 的 rules 在收集值后校验，不会自动阻止编辑器关闭。需要“校验成功才关闭”时，应在编辑器内校验通过后调用 submit。内联编辑器若使用独立 Antd Form，应设置 component={false}，避免嵌套原生 form 标签。

## API

| 属性                          | 类型 / 说明                                                                                         | 默认值       |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | ------------ |
| value                         | Value，外部已确认值                                                                                 | —            |
| onChange                      | (nextValue: Value) => void，仅确认时通知                                                            | —            |
| renderValue                   | (value: Value \| undefined) => ReactNode                                                            | 必填         |
| children                      | ({ value, submit, cancel }) => ReactNode                                                            | —            |
| readOnly                      | boolean，禁止所有区域内操作                                                                         | false        |
| disabled                      | boolean，默认继承全局禁用                                                                           | —            |
| trigger                       | action / value                                                                                      | action       |
| actionVisibility              | hover / always，仅影响 action 入口                                                                  | hover        |
| renderAction                  | ({ onClick }) => ReactNode                                                                          | 编辑图标按钮 |
| mode                          | inline / popup / modal                                                                              | popup        |
| popupWidth                    | number                                                                                              | 320          |
| popoverProps                  | title、placement、arrow、getPopupContainer、styles、classNames、rootClassName、zIndex               | —            |
| modalProps                    | title、width、centered、closable、keyboard、getContainer、styles、classNames、rootClassName、zIndex | —            |
| styles / classNames           | root、value、action、editor 插槽                                                                    | —            |
| className / style / prefixCls | 容器样式和类名前缀                                                                                  | —            |

使用 Ant Design 主题 token，支持浅色、暗色主题。可通过根样式中的 --editable-field-hover-bg、--editable-field-action-bg 覆盖背景。编辑入口和默认弹窗标题使用 ConfigProvider.localeOverrides.EditableField.edit。

## 从旧接口迁移

renderEditor 改为函数式 children；编辑器自己的 useState 管理草稿；原 onSave 逻辑移到编辑器里，成功后调用 submit。默认 footer 已移除，操作按钮由 children 提供。原 placement、getPopupContainer 移到 popoverProps；浮层外框样式移到 popoverProps.styles / classNames。

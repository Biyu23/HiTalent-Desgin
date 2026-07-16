import type { ComponentDoc } from '../tools/types.js';

/**
 * HiTalent Design 组件注册表
 *
 * 包含所有组件的完整元数据：Props 定义、使用示例、注意事项等。
 * 这是 MCP 工具返回 AI 可消费结构化组件文档的核心数据源。
 */

type AnyComponentDoc = ComponentDoc;

export const componentRegistry: Record<string, AnyComponentDoc> = {
  Button: {
    name: 'Button',
    description:
      '增强版按钮组件，基于 Ant Design Button 封装。支持自动 loading 状态管理、点击节流、以及 Tooltip 提示。当 onClick 返回 Promise 时，按钮会自动进入 loading 状态，Promise 落定后自动恢复。',
    category: 'general',
    features: [
      '自动 loading',
      '点击节流',
      '内置 Tooltip',
      '继承所有 antd Button props',
    ],
    imports: "import { Button } from 'hi-talent-design';",
    props: [
      {
        name: 'autoLoading',
        type: 'boolean',
        default: 'true',
        required: false,
        description:
          '是否自动控制 loading 状态。当 onClick 返回 Promise 时自动进入 loading 态，Promise 落定后自动退出。',
      },
      {
        name: 'throttle',
        type: 'number',
        default: '0',
        required: false,
        description:
          '节流间隔（毫秒）。第一次点击立即触发，冷却期内后续点击被忽略。适用场景：提交按钮防重复点击、抢购按钮。设为 0 表示不节流。',
      },
      {
        name: 'tooltip',
        type: "React.ReactNode | Omit<TooltipProps, 'children'>",
        default: '-',
        required: false,
        description:
          'Tooltip 提示配置。传 ReactNode 时作为 title 快捷设置；传对象时可配置 placement 等完整 TooltipProps。设置后始终展示，不受按钮状态影响。',
      },
      {
        name: 'onClick',
        type: '(event: React.MouseEvent<HTMLElement, MouseEvent>) => void | Promise<unknown>',
        default: '-',
        required: false,
        description:
          '点击事件回调。支持返回 Promise 以配合 autoLoading 自动触发 loading 状态。',
      },
      {
        name: 'loading',
        type: 'boolean',
        default: '-',
        required: false,
        description:
          '（继承自 antd ButtonProps）手动控制 loading 状态。与 autoLoading 可共存，任一为 true 时按钮即进入 loading 态。',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: '-',
        required: false,
        description:
          '（继承自 antd ButtonProps）是否禁用按钮。禁用时 tooltip 仍可正常展示。',
      },
      {
        name: 'type',
        type: "'primary' | 'default' | 'dashed' | 'link' | 'text'",
        default: "'default'",
        required: false,
        description: '（继承自 antd ButtonProps）按钮类型。',
      },
      {
        name: 'danger',
        type: 'boolean',
        default: '-',
        required: false,
        description: '（继承自 antd ButtonProps）是否为危险按钮。',
      },
      {
        name: 'size',
        type: "'large' | 'middle' | 'small'",
        default: "'middle'",
        required: false,
        description: '（继承自 antd ButtonProps）按钮大小。',
      },
      {
        name: 'icon',
        type: 'React.ReactNode',
        default: '-',
        required: false,
        description: '（继承自 antd ButtonProps）按钮图标。',
      },
    ],
    examples: [
      {
        title: '基础用法',
        code: `import { Button } from 'hi-talent-design';

// 自动 loading：onClick 返回 Promise 时自动进入 loading 状态
const handleSubmit = async () => {
  await fetch('/api/submit', { method: 'POST' });
};

<Button type="primary" onClick={handleSubmit}>
  提交
</Button>`,
      },
      {
        title: '节流防重复点击',
        code: `import { Button } from 'hi-talent-design';

// 1 秒冷却期，防止重复提交
<Button
  type="primary"
  throttle={1000}
  onClick={handleSubmit}
>
  提交（1秒防抖）
</Button>`,
      },
      {
        title: '禁用时显示 Tooltip',
        code: `import { Button } from 'hi-talent-design';

// 禁用状态下仍可展示 tooltip
<Button
  type="primary"
  disabled
  tooltip="请先填写必填项"
>
  提交
</Button>

// 完整 TooltipProps 配置
<Button
  danger
  disabled
  tooltip={{
    title: '您没有删除权限',
    placement: 'right',
  }}
>
  删除
</Button>`,
      },
      {
        title: '结合 loading 和 tooltip',
        code: `import { Button } from 'hi-talent-design';

// loading 和 tooltip 可共存
<Button
  type="primary"
  loading={isSaving}
  tooltip="正在保存，请稍候..."
  onClick={handleSave}
>
  保存
</Button>`,
      },
    ],
    notes: [
      '继承所有 antd Button 原生 props（type、size、danger、ghost、shape 等），可直接透传使用',
      'throttle 和 autoLoading 互不冲突：throttle 控制点击频率，autoLoading 根据 Promise 自动管理 loading',
      'Button 使用 React.memo 包裹以优化渲染性能',
    ],
  },

  Modal: {
    name: 'Modal',
    description:
      '增强版弹窗组件，基于 Ant Design Modal 封装。支持标题栏拖拽、最大化（全屏）、最小化到全局悬浮窗（8 个停靠方位），以及命令式 API 控制。最小化时 DOM 不销毁，保留表单状态。',
    category: 'general',
    features: [
      '标题栏拖拽',
      '最大化全屏',
      '最小化悬浮窗',
      '8 方位停靠（四角 + 四边）',
      '命令式 API（ModalRef）',
      '最小化保持 DOM 状态',
      '批量预最小化打开',
    ],
    imports:
      "import { Modal } from 'hi-talent-design';\nimport type { ModalRef } from 'hi-talent-design';",
    props: [
      {
        name: 'draggable',
        type: 'boolean',
        default: 'false',
        required: false,
        description:
          '是否允许拖拽。拖拽把手为标题栏区域，最大化时自动禁用拖拽。',
      },
      {
        name: 'minimizable',
        type: 'boolean',
        default: 'false',
        required: false,
        description:
          '是否支持最小化。最小化后弹窗折叠到全局悬浮窗，DOM 不销毁，保留表单内容和状态。',
      },
      {
        name: 'maximizable',
        type: 'boolean',
        default: 'false',
        required: false,
        description:
          '是否支持最大化。最大化后弹窗全屏展示，覆盖默认 top/max-width/margin 样式。',
      },
      {
        name: 'minimizePosition',
        type: "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right'",
        default: "'bottom-right'",
        required: false,
        description:
          '最小化悬浮窗的停靠位置。支持 8 个方位：四角（top-left, top-right, bottom-left, bottom-right）和四边（top, bottom, left, right）。每个位置共享一个滚动容器，多个弹窗依次排列。',
      },
      {
        name: 'minimized',
        type: 'boolean',
        default: '-',
        required: false,
        description:
          '是否最小化（受控）。设置后可从外部控制最小化状态，配合 onMinimizeChange 实现受控模式。可直接以最小化状态挂载弹窗，避免遮罩叠加。',
      },
      {
        name: 'maximized',
        type: 'boolean',
        default: '-',
        required: false,
        description: '是否最大化（受控）。设置后可从外部控制最大化状态。',
      },
      {
        name: 'onMinimizeChange',
        type: '(minimized: boolean) => void',
        default: '-',
        required: false,
        description: '最小化状态变化回调。',
      },
      {
        name: 'onMaximizedChange',
        type: '(maximized: boolean) => void',
        default: '-',
        required: false,
        description: '最大化状态变化回调。',
      },
      {
        name: 'closable',
        type: 'boolean',
        default: 'true',
        required: false,
        description: '是否显示关闭按钮。标题栏右上角 X 按钮。',
      },
      {
        name: 'title',
        type: 'React.ReactNode',
        default: '-',
        required: false,
        description: '弹窗标题。同时用于标题栏展示和最小化悬浮窗的标识文字。',
      },
      {
        name: 'onCancel',
        type: '(e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void',
        default: '-',
        required: false,
        description:
          '关闭回调。事件可能来自按钮点击（MouseEvent）或 ESC 按键（KeyboardEvent）。',
      },
      {
        name: 'destroyOnHidden',
        type: 'boolean',
        default: '-',
        required: false,
        description:
          '（继承自 antd ModalProps）隐藏时是否销毁 DOM。注意：启用 minimizable 时此属性会被强制设为 false，以确保最小化时保留 DOM 状态。',
      },
      {
        name: 'width',
        type: 'string | number',
        default: '-',
        required: false,
        description:
          "（继承自 antd ModalProps）弹窗宽度。最大化时强制覆盖为 '100%'。",
      },
      {
        name: 'open',
        type: 'boolean',
        default: '-',
        required: true,
        description:
          '（继承自 antd ModalProps）弹窗是否可见。最小化状态时即使 open=true 也不显示弹窗本体。',
      },
    ],
    refAPI: [
      {
        name: 'restore',
        signature: '() => void',
        description: '从最小化状态恢复弹窗到正常显示。',
      },
      {
        name: 'maximize',
        signature: '() => void',
        description: '最大化弹窗。如果当前是最小化状态，则先恢复再最大化。',
      },
      {
        name: 'unmaximize',
        signature: '() => void',
        description: '取消最大化，恢复到普通尺寸。',
      },
      {
        name: 'minimize',
        signature: '() => void',
        description: '最小化弹窗到悬浮窗。',
      },
    ],
    examples: [
      {
        title: '基础弹窗',
        code: `import { useState } from 'react';
import { Modal } from 'hi-talent-design';

const [open, setOpen] = useState(false);

<Modal
  title="基础弹窗"
  open={open}
  onCancel={() => setOpen(false)}
  onOk={() => setOpen(false)}
>
  <p>弹窗内容</p>
</Modal>`,
      },
      {
        title: '桌面级窗口（拖拽 + 最大化 + 最小化）',
        code: `import { useRef, useState } from 'react';
import { Modal } from 'hi-talent-design';
import type { ModalRef } from 'hi-talent-design';

const modalRef = useRef<ModalRef>(null);
const [open, setOpen] = useState(false);

<Modal
  ref={modalRef}
  title="工单详情 #1234"
  open={open}
  draggable
  minimizable
  maximizable
  onCancel={() => setOpen(false)}
>
  {/* 表单内容在最小化时不会丢失 */}
  <Form>...</Form>
</Modal>

// 命令式控制：
// modalRef.current?.minimize();   // 最小化
// modalRef.current?.maximize();   // 最大化
// modalRef.current?.restore();    // 从最小化恢复
// modalRef.current?.unmaximize(); // 取消最大化`,
      },
      {
        title: '预最小化打开',
        code: `import { Modal } from 'hi-talent-design';

// 多个弹窗同时以最小化状态打开，无遮罩叠加
<Modal
  title="工单 #001"
  open
  minimized
  minimizable
  minimizePosition="bottom-right"
>
  <p>工单内容</p>
</Modal>

<Modal
  title="工单 #002"
  open
  minimized
  minimizable
  minimizePosition="bottom-right"
>
  <p>第二个工单内容</p>
</Modal>`,
      },
      {
        title: '表单提交弹窗',
        code: `import { useState } from 'react';
import { Modal, Button } from 'hi-talent-design';

const [open, setOpen] = useState(false);

<Modal
  title="新建用户"
  open={open}
  draggable
  minimizable
  onCancel={() => setOpen(false)}
  footer={
    <>
      <Button onClick={() => setOpen(false)}>取消</Button>
      <Button type="primary" onClick={handleSubmit}>
        确认
      </Button>
    </>
  }
>
  <Form>
    <Form.Item label="姓名" name="name">
      <Input />
    </Form.Item>
  </Form>
</Modal>`,
      },
    ],
    notes: [
      '最小化时 destroyOnHidden 自动强制为 false，确保 DOM 和表单状态不丢失',
      '最大化时弹窗覆盖原生 antd 的 top/max-width/margin/paddingBottom 样式，实现真正全屏',
      '最小化悬浮窗使用 Portal 渲染到 body，每个停靠位置有独立的滚动容器（溢出时显示渐隐滚动效果）',
      '拖拽基于 react-draggable，最大化时自动禁用拖拽',
      '可通过 ModalRef 命令式控制，适合复杂的窗口管理场景',
      '同时开启 minimizable 和 maximizable 时，最大化按钮在标题栏显示，最小化按钮在操作区显示',
      '支持批量预最小化打开多个弹窗，避免遮罩叠加问题',
    ],
  },

  PopoverSelect: {
    name: 'PopoverSelect',
    description:
      '基于弹出层实现的选择器组件，替代 Ant Design Select。支持单选/多选、搜索过滤、虚拟滚动（大数据量）、自定义字段映射、确认提交模式，以及灵活的字符串/数组值输出格式。',
    category: 'general',
    features: [
      '单选/多选模式',
      '搜索过滤',
      '虚拟滚动（rc-virtual-list）',
      '自定义字段映射',
      '确认提交模式',
      '全选功能',
      '字符串/数组值输出',
      '自定义选项渲染',
    ],
    imports: "import { PopoverSelect } from 'hi-talent-design';",
    props: [
      {
        name: 'options',
        type: 'OptionType[]',
        default: '[]',
        required: false,
        description:
          '数据选项列表。每项至少包含 label 和 value，可通过 fieldNames 映射自定义字段名。',
      },
      {
        name: 'mode',
        type: "'single' | 'multiple'",
        default: "'single'",
        required: false,
        description: "选择模式：'single' 单选，'multiple' 多选。",
      },
      {
        name: 'value',
        type: 'ValueType | ValueType[]',
        default: '-',
        required: false,
        description: '当前选中值（受控）。根据 valueType，可传字符串或数组。',
      },
      {
        name: 'defaultValue',
        type: 'ValueType | ValueType[]',
        default: '-',
        required: false,
        description: '默认选中值（非受控）。',
      },
      {
        name: 'onChange',
        type: '(value: ValueType | ValueType[], options?: OptionType[]) => void',
        default: '-',
        required: false,
        description:
          '选中值变更回调。value 类型由 valueType 决定（字符串或数组）。',
      },
      {
        name: 'placeholder',
        type: 'React.ReactNode',
        default: "组件内置国际化文案（中文：'全部'）",
        required: false,
        description: '选择框默认占位提示文字。',
      },
      {
        name: 'showSearch',
        type: 'boolean',
        default: 'false',
        required: false,
        description: '是否显示搜索框。开启后在下拉面板顶部渲染搜索输入框。',
      },
      {
        name: 'allowClear',
        type: 'boolean',
        default: 'false',
        required: false,
        description: '是否允许清除已选值。',
      },
      {
        name: 'fieldNames',
        type: 'FieldNames',
        default: '-',
        required: false,
        description:
          "自定义字段映射。用于适配后端非标准数据结构，如 { label: 'name', value: 'id' }。",
      },
      {
        name: 'virtual',
        type: 'boolean',
        default: 'true',
        required: false,
        description:
          '是否开启虚拟滚动。大数据量时自动启用 rc-virtual-list 优化渲染。',
      },
      {
        name: 'listHeight',
        type: 'number',
        default: '150',
        required: false,
        description: '下拉列表最大高度（px）。',
      },
      {
        name: 'listItemHeight',
        type: 'number',
        default: '32',
        required: false,
        description: '虚拟滚动每项高度（px）。',
      },
      {
        name: 'showConfirm',
        type: 'boolean',
        default: 'true（多选模式下为 true，单选模式下为 false）',
        required: false,
        description:
          '多选模式下是否显示确认提交按钮。开启时选中的值暂存于草稿，点击确认后才提交。',
      },
      {
        name: 'showCancelBtn',
        type: 'boolean',
        default: 'false',
        required: false,
        description: '是否显示取消按钮。',
      },
      {
        name: 'showClearBtn',
        type: 'boolean',
        default: 'false',
        required: false,
        description: '是否显示清空按钮。',
      },
      {
        name: 'showSelectAll',
        type: 'boolean',
        default: 'false',
        required: false,
        description: '多选模式下是否显示全选复选框。仅多选模式下生效。',
      },
      {
        name: 'valueType',
        type: "'string' | 'array'",
        default: "'string'",
        required: false,
        description:
          "值的提交格式。'string'：多选值时拼接为字符串（如 '1,2,3'）；'array'：保持数组格式。单选时不影响。",
      },
      {
        name: 'valueSeparator',
        type: 'string',
        default: "','",
        required: false,
        description: "valueType 为 'string' 时的分隔符。",
      },
      {
        name: 'separator',
        type: 'string',
        default: "', '（逗号+空格）",
        required: false,
        description: '多选模式下显示文本的分隔符。',
      },
      {
        name: 'maxTagCount',
        type: 'number',
        default: '-',
        required: false,
        description:
          "多选模式下最多显示的标签数，超出部分以 '+N' 省略显示，hover 展示完整内容。",
      },
      {
        name: 'optionRender',
        type: '(item: OptionType) => React.ReactNode',
        default: '-',
        required: false,
        description: '自定义选项渲染函数。',
      },
      {
        name: 'dropdownRender',
        type: '(menu: React.ReactElement) => React.ReactElement',
        default: '-',
        required: false,
        description: '自定义下拉面板渲染。',
      },
    ],
    examples: [
      {
        title: '基础单选',
        code: `import { PopoverSelect } from 'hi-talent-design';

const options = [
  { label: '选项一', value: 1 },
  { label: '选项二', value: 2 },
  { label: '选项三', value: 3 },
];

<PopoverSelect
  options={options}
  placeholder="请选择"
  onChange={(value) => console.log(value)}
/>`,
      },
      {
        title: '多选 + 确认模式',
        code: `import { PopoverSelect } from 'hi-talent-design';

<PopoverSelect
  mode="multiple"
  options={[
    { label: '技术部', value: 'tech' },
    { label: '产品部', value: 'product' },
    { label: '设计部', value: 'design' },
  ]}
  showSelectAll
  showConfirm
  onChange={(value) => console.log('选中:', value)}
  placeholder="请选择部门"
/>`,
      },
      {
        title: '带搜索 + 虚拟滚动',
        code: `import { PopoverSelect } from 'hi-talent-design';

// 大量数据场景
const bigData = Array.from({ length: 10000 }, (_, i) => ({
  label: \`选项 \${i + 1}\`,
  value: i + 1,
}));

<PopoverSelect
  mode="multiple"
  options={bigData}
  showSearch
  virtual
  listHeight={200}
  placeholder="搜索并选择"
/>`,
      },
      {
        title: '自定义字段映射',
        code: `import { PopoverSelect } from 'hi-talent-design';

// 后端返回非标准字段名
const backendData = [
  { name: '张三', id: 1, status: 'active' },
  { name: '李四', id: 2, status: 'inactive' },
];

<PopoverSelect
  options={backendData}
  fieldNames={{ label: 'name', value: 'id' }}
  onChange={(value) => console.log(value)}
/>`,
      },
      {
        title: '字符串值输出（适合数据库 varchar 字段）',
        code: `import { PopoverSelect } from 'hi-talent-design';

// 输出字符串格式 '1,2,3'，可直接存入数据库 varchar 字段
<PopoverSelect
  mode="multiple"
  options={[
    { label: '标签A', value: 1 },
    { label: '标签B', value: 2 },
    { label: '标签C', value: 3 },
  ]}
  valueType="string"
  valueSeparator=","
  onChange={(value) => {
    // value 类型为 string: "1,2,3"
    console.log(typeof value, value);
  }}
/>`,
      },
    ],
    notes: [
      '组件使用泛型设计，支持自定义 ValueType 和 OptionType',
      '底层使用 rc-virtual-list 实现虚拟滚动，万级数据流畅渲染',
      'useMergeState hook 实现受控/非受控状态管理，支持值类型自动转换',
      '多选确认模式下，选中的值暂存于草稿 state，点击确认后才触发 onChange',
      "valueType='string' 时，支持受控传字符串值，内部自动按分隔符解析为数组处理",
      '通过 attachPropertiesToComponent 附加了 Selector 子组件，底层触发器可单独使用',
    ],
  },

  ConfigProvider: {
    name: 'ConfigProvider',
    description:
      '全局配置提供者组件。为所有子组件提供统一的类名前缀（prefixCls）和国际化语言配置。',
    category: 'configProvider',
    features: ['类名前缀配置', '国际化语言切换', 'Context 传递'],
    imports: "import { ConfigProvider } from 'hi-talent-design';",
    props: [
      {
        name: 'prefixCls',
        type: 'string',
        default: "'htd'",
        required: false,
        description:
          "组件样式类名前缀。默认为 'htd'，所有组件的 CSS class 以此开头（如 htd-modal、htd-btn）。",
      },
      {
        name: 'locale',
        type: 'zh_CN | en_US | DeepPartial<HtdLocale>',
        default: 'zh_CN',
        required: false,
        description:
          "语言包。内置支持 'zh-CN' 和 'en-US'，也可传入自定义的 DeepPartial 语言包来覆盖部分文案。",
      },
      {
        name: 'children',
        type: 'React.ReactNode',
        default: '-',
        required: false,
        description: '子组件。',
      },
    ],
    examples: [
      {
        title: '基础配置',
        code: `import { ConfigProvider } from 'hi-talent-design';

<ConfigProvider prefixCls="my-app" locale={zh_CN}>
  <App />
</ConfigProvider>`,
      },
      {
        title: '自定义语言包',
        code: `import { ConfigProvider } from 'hi-talent-design';

// 仅覆盖部分文案
<ConfigProvider
  locale={{
    PopoverSelect: {
      placeholder: '全部选项',
      confirm: '确认选择',
      cancel: '放弃',
    },
  }}
>
  <App />
</ConfigProvider>`,
      },
    ],
    notes: [
      'ConfigProvider 使用 React Context 传递配置，所有子组件通过 usePrefixCls 和 useLocale 消费',
      'prefixCls 支持自定义，方便与项目现有样式体系整合',
      'locale 支持 DeepPartial，无需提供完整的语言包即可覆盖特定文案',
    ],
  },
};

/**
 * 获取所有组件名称列表
 */
export function getComponentNames(): string[] {
  return Object.keys(componentRegistry);
}

/**
 * 根据名称获取组件文档
 */
export function getComponent(name: string): ComponentDoc | undefined {
  return componentRegistry[name];
}

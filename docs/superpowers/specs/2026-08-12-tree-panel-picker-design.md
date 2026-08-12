# TreePanelPicker 多面板树选择器设计

## 背景

HiTalent Design 当前基于 React 17 和 Ant Design 5，已有 `PopoverSelect` 用于平铺数据的气泡选择，但本次需求具有明显不同的交互与数据模型：

- 默认使用 Ant Design Select 作为触发器，聚焦或点击后打开 Modal；
- Modal 内可以根据业务动态配置一个、两个、三个或更多树选择面板；
- 面板之间通过显式依赖关系联动，后置面板可以根据前置面板的草稿选择发起异步请求；
- 每个面板可以独立使用单选、多选、父子关联 Checkbox 或严格 Checkbox；
- 支持常用选择、本地搜索、远程搜索和展开节点懒加载；
- 用户点击“确定”后才原子提交全部面板值；
- 提交值保持为 ID，`onChange` 同时提供完整节点和层级路径；
- 默认触发器可以隐藏，并通过 `open/onOpenChange` 或 Ref 控制 Modal；
- 单面板需要支持约 10,000 个已加载节点。

由于能力已经超出 Ant Design TreeSelect 的下拉式单树模型，且为避免命名冲突，组件命名为 `TreePanelPicker`。本组件不复用现有 `PopoverSelect` 的 Selector 或 Popover。

## 目标与非目标

### 目标

- 基于 Ant Design `Select + Modal + Tree` 提供完整、统一的业务选择体验。
- 通过动态 `panels` 数组支持任意数量及任意顺序的树面板。
- 每个面板独立配置选择模式、字段映射、搜索方式、懒加载和常用选择。
- 通过 `dependsOn` 构建无环依赖图，并把依赖变化后的数据和值处理权交给业务方。
- 依赖回调使用异步补丁返回模式，由组件处理 Loading、错误、取消和竞态。
- Modal 内维护草稿，只有确认后才触发一次正式 `onChange`。
- 提交 ID 值，并在回调信息中提供原始节点和完整祖先路径。
- 直接使用 Ant Design Tree 的虚拟滚动，支持单面板约 10,000 个已加载节点。
- 支持默认 Select、自定义触发器、无触发器、受控开关和命令式 Ref。
- 提供中英文文档、Demo、Locale 和公开类型导出。

### 非目标

- 不复用或改造 `PopoverSelect`。
- 不实现 Ant Design Tree 或虚拟列表的替代品。
- 不要求所有面板节点值全局唯一；节点值只需在所属面板内唯一。
- 不在组件内部猜测上游变化后应清空、保留还是替换哪些下游值。
- 不自动从只有 ID 的初始值请求节点元数据；编辑回显所需的完整分支必须由业务方放入 `treeData`。
- 不支持远程搜索返回缺少祖先链的扁平结果。
- 不因“展开全部”递归加载所有未加载分支。
- 不提供跨组件实例的全局缓存、持久化缓存或 `localStorage` 缓存。
- 第一版不公开 Headless Controller Hook 或内部 Context。
- 不升级 React、Ant Design 或引入新的运行时依赖。

## 方案比较与选择

### 方案一：配置驱动的分层组件，内部集中编排

`TreePanelPicker` 接收动态 `panels` 配置，内部拆分 Trigger、Modal、Panel、Controller、TreeIndex 和 RequestManager。

优点：

- 最符合动态业务面板场景；
- 单面板和多面板使用同一套 API；
- 草稿、依赖、异步补丁和原子提交可统一管理；
- UI、请求和树模型边界明确，便于测试与扩展。

缺点：顶层 Controller 需要严谨处理面板变更、依赖传播和请求竞态。

### 方案二：Compound Components

由业务方组合 `Root`、`Trigger`、`Modal` 和多个 `Panel`。

优点：布局组合自由度高。

缺点：动态面板仍需业务方手动遍历，依赖和草稿需要复杂 Context 注册，第一版公开 API 面积过大。

### 方案三：Headless Hook

只提供状态引擎，Select、Modal、Tree 和状态界面均由业务方渲染。

优点：控制力最高。

缺点：接入成本高，容易产生多个交互不一致的业务实现，不符合封装一个可直接使用组件的目标。

### 结论

采用方案一。内部按 Headless 思路拆分纯模型和 Controller，但第一版只公开配置驱动组件及有限 Render 扩展点。

## 总体架构

```text
TreePanelPicker
├── TreePanelPickerTrigger
│   └── Ant Design Select / 自定义触发器 / 不渲染
├── TreePanelPickerModal
│   ├── 横向滚动面板容器
│   ├── TreePanelPickerPanel × panels.length
│   │   ├── PanelSearchSelect：草稿 Tag + 搜索输入
│   │   ├── FrequentOptions：常用选择
│   │   ├── Ant Design Tree：虚拟滚动
│   │   └── Loading / Error / Empty / DependencyHint
│   └── Confirm / Cancel
└── 状态与数据层
    ├── useTreePanelPickerController：开关、草稿、提交、面板协调
    ├── usePanelController：单面板搜索、展开、选择和加载状态
    ├── useDependencyManager：依赖图、异步补丁和传播
    ├── TreeDataIndex：节点、父子关系、搜索文本和路径缓存
    └── RequestManager：防抖、去重、取消、竞态和缓存
```

### 文件职责

```text
src/components/TreePanelPicker/
├── index.tsx
├── type.ts
├── index.less
├── index.md
├── index.en-US.md
├── components/
│   ├── TreePanelPickerTrigger.tsx
│   ├── TreePanelPickerModal.tsx
│   ├── TreePanelPickerPanel.tsx
│   ├── PanelSearchSelect.tsx
│   ├── FrequentOptions.tsx
│   └── PanelState.tsx
├── hooks/
│   ├── useTreePanelPickerController.ts
│   ├── usePanelController.ts
│   ├── useDependencyManager.ts
│   ├── usePanelSearch.ts
│   └── useLazyTreeData.ts
├── model/
│   ├── createTreeIndex.ts
│   ├── updateTreeIndex.ts
│   ├── selectionStrategy.ts
│   ├── dependencyGraph.ts
│   └── requestManager.ts
└── demo/
    ├── basic.tsx
    ├── multiple-panels.tsx
    ├── dependency.tsx
    ├── remote-search.tsx
    ├── lazy-load.tsx
    ├── custom-trigger.tsx
    └── large-data.tsx
```

树索引、选择策略、依赖图和补丁合并保持为无 React 依赖的纯函数。

## 核心类型与数据模型

### 基础类型

```ts
export type TreePanelRawValue = string | number;

export interface DefaultTreePanelNode {
  key: TreePanelRawValue;
  title: React.ReactNode;
  children?: DefaultTreePanelNode[];
  disabled?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  [key: string]: any;
}

export type TreePanelPickerValue = Partial<
  Record<string, TreePanelRawValue | TreePanelRawValue[]>
>;
```

运行时根据面板配置约束值类型：

- `selectionMode="single"`：`TreePanelRawValue | undefined`；
- `selectionMode="multiple"`：`TreePanelRawValue[]`；
- `panel.key` 在组件实例内唯一；
- 节点值只需在所属面板内唯一；
- 内部身份统一使用 `panelKey + nodeValue`，不能只用节点值跨面板寻址。

### 字段映射

```ts
export interface TreePanelPickerFieldNames {
  value?: string; // 默认 key
  label?: string; // 默认 title
  children?: string; // 默认 children
  disabled?: string; // 默认 disabled
  selectable?: string; // 默认 selectable
  checkable?: string; // 默认 checkable
  disableCheckbox?: string; // 默认 disableCheckbox
  isLeaf?: string; // 默认 isLeaf
}
```

字段读取支持直接属性名，不在第一版引入字符串路径或字段读取函数。原始节点不会被修改，回调中的 `node` 始终返回业务传入的原始对象。

### 层级记录

```ts
export interface TreePanelPathItem {
  value: TreePanelRawValue;
  label: React.ReactNode;
}

export interface TreePanelSelectionRecord<NodeType> {
  panelKey: string;
  value: TreePanelRawValue;
  label: React.ReactNode;
  path: TreePanelPathItem[];
  node: NodeType;
}

export type TreePanelPickerSelections<NodeType> = Record<
  string,
  TreePanelSelectionRecord<NodeType>[]
>;

export interface TreePanelPickerChangeInfo<NodeType> {
  selections: TreePanelPickerSelections<NodeType>;
}
```

正式值只保存 ID，层级路径和原始节点通过 `onChange` 第二参数提供：

```ts
onChange?.(
  {
    industries: ['ai'],
    jobFunctions: ['frontend'],
    direction: 'product',
  },
  {
    selections: {
      industries: [
        {
          panelKey: 'industries',
          value: 'ai',
          label: 'Artificial Intelligence',
          path: [
            { value: 'technology', label: 'Technology' },
            { value: 'ai', label: 'Artificial Intelligence' },
          ],
          node: originalNode,
        },
      ],
    },
  },
);
```

### 动态面板配置

```ts
export interface TreePanelPickerPanelConfig<NodeType> {
  key: string;
  title: React.ReactNode;
  /** 面板的纯文本名称，用于默认 Tag、依赖提示和无障碍名称 */
  ariaLabel?: string;

  required?: boolean;
  optional?: boolean;
  disabled?: boolean;

  selectionMode?: 'single' | 'multiple';
  checkable?: boolean;
  checkStrategy?: 'cascade' | 'strict';
  showCheckedStrategy?: 'all' | 'parent' | 'child';

  dependsOn?: string[];
  isDependencyReady?: (
    context: TreePanelDependencyContext<NodeType>,
  ) => boolean;
  dependencyPlaceholder?: React.ReactNode;

  treeData: NodeType[];
  dataVersion?: string | number;
  fieldNames?: TreePanelPickerFieldNames;

  search?:
    | false
    | TreePanelLocalSearchConfig<NodeType>
    | TreePanelRemoteSearchConfig<NodeType>;
  loadChildren?: TreePanelLoadChildren<NodeType>;

  frequentOptions?: TreePanelFrequentOption[];
  placeholder?: React.ReactNode;

  virtual?: boolean;
  treeHeight?: number;
  expandAll?: boolean;
  defaultExpandAll?: boolean;
  expandAllThreshold?: number;
}
```

默认值：

```text
required = false
optional = false
selectionMode = multiple
checkable = selectionMode === multiple
checkStrategy = cascade
showCheckedStrategy = child
virtual = true
```

`required=true` 与 `optional=true` 同时出现时视为无效配置，并在开发环境警告。

## 打开控制与触发器

### 公开 Ref

```ts
export interface TreePanelPickerRef {
  open: () => void;
  close: () => void;
  cancel: () => void;
  confirm: () => Promise<boolean>;
}
```

### 开关 API

```ts
open?: boolean;
defaultOpen?: boolean;
onOpenChange?: (
  open: boolean,
  info: {
    source:
      | 'trigger'
      | 'imperative'
      | 'confirm'
      | 'cancel'
      | 'external';
  },
) => void;
```

规则：

1. 提供 `open` 时为受控模式，视觉状态始终由 `open` 决定。
2. 受控模式调用 Ref 只触发 `onOpenChange`，不维护独立视觉状态。
3. 未提供 `open` 时由组件管理 Modal 开关。
4. `close()` 通过 `source='imperative'` 丢弃当前草稿，`cancel()` 通过 `source='cancel'` 执行相同行为。
5. Modal 的关闭图标、遮罩和 Esc 均统一报告 `source='cancel'`，不依赖 DOM 目标推断关闭入口。
6. 受控方直接把 `open` 从 `true` 改为 `false` 时按 `source='external'` 的取消语义清理草稿，但组件不会反向再次触发 `onOpenChange`。
7. 禁用组件时，默认触发器和 `ref.open()` 均不能打开。
8. 确认或异步校验期间重复调用 `confirm()` 复用同一个任务；返回 `true` 表示校验通过且已触发提交，不表示受控方已经关闭 Modal。

### 触发器模式

```ts
trigger?:
  | boolean
  | React.ReactNode
  | ((context: TreePanelPickerTriggerContext<NodeType>) => React.ReactNode);
```

- `true` 或未提供：渲染默认 Ant Design Select；
- `false`：不渲染触发器，只保留 Modal；
- `ReactNode`：由组件为外层点击行为建立触发包装；
- 函数：业务方通过上下文中的 `openModal()` 自行绑定入口。

```ts
export interface TreePanelPickerTriggerContext<NodeType> {
  open: boolean;
  value: TreePanelPickerValue;
  selections: TreePanelPickerSelections<NodeType>;
  selectedCount: number;
  openModal: () => void;
}
```

声明式 `open/onOpenChange` 是首选控制方式，Ref 作为命令式补充。

### 默认 Select

默认触发器使用 Ant Design `Select`：

- 固定 `mode="multiple"`，用于汇总展示所有面板的已确认 Tag；
- Select 自身 Dropdown 始终关闭；
- 点击或聚焦时打开 Modal；
- Tag 默认显示“面板名称 · 节点名称”；面板名称优先使用 `ariaLabel`，当 `title` 是字符串或数字时使用其文本，否则回退到 `panel.key`；
- 同一纯文本名称同时用于默认依赖提示和面板无障碍名称；
- 支持 `maxTagCount`，默认 `responsive`；
- 通过 `triggerProps.tagRender` 自定义 Tag；
- Tag 默认不可直接删除，避免绕过确认提交；
- `allowClear=true` 时，点击清空只会打开 Modal 并清空全部草稿，仍需用户确认。

```ts
export interface TreePanelPickerTriggerProps<NodeType> {
  placeholder?: React.ReactNode;
  maxTagCount?: number | 'responsive';
  size?: 'small' | 'middle' | 'large';
  status?: 'error' | 'warning';
  allowClear?: boolean;
  tagRender?: TreePanelPickerTagRender<NodeType>;
}
```

不直接透传全部 Ant Design Select Props，以免调用方覆盖内部值、Dropdown 和打开逻辑。

## 草稿与提交生命周期

组件区分：

```text
committedValue      当前已确认并对外展示的值
committedMetadata   已确认值对应的节点及路径
draftValue          当前 Modal 会话的草稿值
draftMetadata       当前草稿对应的节点及路径
```

### 打开

每次从关闭切换为打开时：

1. 从当前受控 `value` 或非受控已提交值复制 `draftValue`；
2. 从当前运行时主树索引重建 `draftMetadata`；
3. 清空上次搜索词、搜索错误和临时搜索结果；
4. 根据已确认依赖签名恢复对应的运行时树缓存；
5. 保留可复用的懒加载和请求缓存；
6. 不触发 `onChange`。

### 确认

1. 等待依赖传播进入稳定状态；
2. 执行结构、节点、必填和业务校验；
3. 生成所有面板的完整 `SelectionRecord`；
4. 原子提交全部面板值；
5. 触发一次 `onChange(nextValue, info)`；
6. 关闭 Modal。

无论面板数量多少，都只触发一次正式 `onChange`。

### 取消

点击取消、关闭图标、遮罩、Esc、`ref.close()`、`ref.cancel()`，或受控方在未确认时关闭，都统一视为取消：

- 丢弃草稿及草稿元数据；
- 不触发 `onChange`；
- 不清空可复用数据缓存；
- 恢复与已确认依赖签名对应的运行时面板数据；
- 下次打开重新从当前已确认值初始化。

### 动态面板变化

Modal 打开期间 `panels` 变化时：

- 同 `key`：保留仍有效的草稿、展开状态和搜索词；
- 新增：创建该面板的空草稿，或读取 `value[panelKey]`；
- 删除：从草稿中删除该面板，但确认前不修改已提交值；
- 排序：按新顺序布局；
- `selectionMode` 改变且现值结构不兼容：不自动猜测转换方式，显示配置错误；
- `treeData` 引用、`fieldNames` 或 `dataVersion` 变化：重建该面板索引并校验草稿。

## 树选择语义

### 单选

```ts
selectionMode: 'single';
checkable: false;
```

- 点击可选节点后替换当前面板草稿值；
- 值为标量或 `undefined`；
- 不因单选完成而关闭 Modal。

### 非 Checkbox 多选

```ts
selectionMode: 'multiple';
checkable: false;
```

- 通过 Ant Design Tree `multiple` 与 `selectedKeys` 实现；
- 点击标题独立切换节点；
- 值为节点值数组。

### Checkbox 多选

```ts
selectionMode: 'multiple';
checkable: true;
checkStrategy: 'cascade' | 'strict';
showCheckedStrategy: 'all' | 'parent' | 'child';
```

#### `cascade`

使用 Ant Design Tree 默认父子关联：

- 勾选父节点联动已加载且可操作的后代；
- 部分子节点勾选时父节点半选；
- 未加载后代不会被虚构为已选；
- 如业务希望未完整加载的父节点代表整类，应选择 `showCheckedStrategy="parent"` 保存父节点。

#### `strict`

映射到 Ant Design Tree `checkStrictly`：

- 父子独立；
- 不产生联动；
- `showCheckedStrategy` 不生效，提交全部完整勾选节点。

### 输出投影

仅 `cascade` 模式应用：

- `all`：返回全部完整勾选节点；
- `parent`：完整父节点覆盖其完整勾选后代，半选父节点不覆盖；
- `child`：返回当前已知结构中最深的完整勾选节点，有完整后代时不返回祖先。

“最深节点”不强制 `isLeaf=true`；暂未加载子级的节点可以作为当前已知结构中的末端节点。

### 节点能力

节点级字段优先于面板默认配置：

- `disabled=true`：节点整体禁用；
- `selectable=false`：标题不能选择，但仍可展开；
- `checkable=false`：不显示该节点 Checkbox；
- `disableCheckbox=true`：显示 Checkbox 但不可操作；
- `isLeaf=false`：无当前 children 时仍允许懒加载。

## 常用选择

```ts
export interface TreePanelFrequentOption {
  value: TreePanelRawValue;
  label?: React.ReactNode;
}
```

每个常用项只对应当前面板的一个树节点：

1. 从面板索引定位节点；
2. 检查其选择或勾选能力；
3. 按当前面板的单选、多选和父子策略更新草稿；
4. 同步 Tree 选择状态；
5. 生成与 Tree 操作完全相同的路径元数据。

常用项不维护独立节点数据。自定义 `label` 只影响快捷入口显示，正式 Tag 和元数据仍使用树节点。

如果常用项对应节点不在运行时主树中，该快捷项显示禁用并在开发环境警告；组件不会为它单独请求节点。

## 层级索引与路径追溯

每个面板维护独立索引：

```ts
interface TreeDataIndex<NodeType> {
  nodeByValue: Map<TreePanelRawValue, NormalizedNode<NodeType>>;
  parentByValue: Map<TreePanelRawValue, TreePanelRawValue | null>;
  childrenByValue: Map<TreePanelRawValue, TreePanelRawValue[]>;
  searchTextByValue: Map<TreePanelRawValue, string>;
  pathCache: Map<TreePanelRawValue, TreePanelPathItem[]>;
}
```

路径按需计算：

```text
目标节点
→ 根据 parentByValue 向根回溯
→ 反转为 root → target
→ 写入 pathCache
```

懒加载插入时：

- 只增加新节点和父子边；
- 不重建完整索引；
- 清理受影响子树的路径缓存；
- 未变化节点的缓存继续有效。

初始受控值和 `defaultValue` 对应节点及完整祖先分支必须存在于面板主 `treeData`。缺失值：

- 不生成伪造 Tag 或路径；
- 开发环境警告；
- 对应面板显示配置错误；
- 阻止确认。

## 草稿变更事件

```ts
onDraftChange?: (
  draftValue: TreePanelPickerValue,
  info: {
    panelKey: string;
    source:
      | 'tree'
      | 'frequent'
      | 'tag-remove'
      | 'clear'
      | 'dependency-patch';
    action: 'select' | 'deselect' | 'replace' | 'clear';
    changedValues: TreePanelRawValue[];
    selections: TreePanelPickerSelections<NodeType>;
  },
) => void;
```

`onDraftChange` 只用于观测草稿和业务联动，不代表表单已提交。

## 面板依赖与业务补丁

### 依赖图

```ts
panels: [
  { key: 'industries' },
  { key: 'jobFunctions', dependsOn: ['industries'] },
  {
    key: 'direction',
    dependsOn: ['industries', 'jobFunctions'],
  },
];
```

规则：

- 面板可以依赖零个、一个或多个面板；
- 不要求只能依赖数组中的前一个面板；
- 展示顺序与依赖执行顺序分离；
- 初始化时构建 DAG 并做拓扑排序；
- 循环依赖是阻止确认的配置错误。

### 依赖上下文

```ts
export interface TreePanelDependencyChangeContext<NodeType> {
  changedPanelKey: string;
  previousDraftValue: TreePanelPickerValue;
  draftValue: TreePanelPickerValue;
  changedValues: TreePanelRawValue[];
  selections: TreePanelPickerSelections<NodeType>;
  affectedPanelKeys: string[];
  source: 'tree' | 'frequent' | 'tag-remove' | 'clear' | 'dependency-patch';
  signal: AbortSignal;
}
```

### 异步补丁

```ts
export interface TreePanelDependencyPatch<NodeType> {
  treeData?: NodeType[];
  value?: TreePanelRawValue | TreePanelRawValue[] | undefined;
  disabled?: boolean;
  dependencyHint?: React.ReactNode;
  frequentOptions?: TreePanelFrequentOption[];
}

export interface TreePanelDependencyChangeResult<NodeType> {
  panels?: Record<string, TreePanelDependencyPatch<NodeType>>;
}
```

```ts
onDependencyChange?: (
  context: TreePanelDependencyChangeContext<NodeType>,
) => Promise<TreePanelDependencyChangeResult<NodeType> | void>;
```

补丁规则：

- 组件不自动清空任何下游值；
- 回调只能补丁 `affectedPanelKeys` 中的下游面板，不能修改当前面板、上游或无关面板；
- `treeData` 是替换语义；
- 通过 `Object.prototype.hasOwnProperty.call(patch, 'value')` 区分未提供值与显式清空；
- 单选使用 `value: undefined` 清空，多选使用 `value: []` 清空；
- 未提供字段保持当前运行时状态；
- 补丁中的值必须存在于补丁后的运行时主树；
- 未知或越权面板 Key 产生配置错误；
- 补丁应用触发一次 `onDraftChange`，不触发正式 `onChange`。

### 请求竞态

每次上游草稿变化：

1. 计算直接和间接受影响面板；
2. 取消上一轮依赖请求；
3. 受影响面板进入 Loading；
4. 调用 `onDependencyChange`；
5. 仅最新 `requestId` 可以应用结果；
6. 应用补丁并重建受影响索引；
7. 校验补丁值和路径；
8. 传播结束后恢复确认能力。

同时使用 `AbortController` 和单调递增的 `requestId`。即使业务忽略 `signal`，旧响应也不能覆盖新结果。

依赖请求期间：

- 保留受影响面板现有 Tag；
- Tree 区显示 Loading 并暂停选择、搜索和懒加载；
- 允许继续修改上游，从而取消旧请求；
- 禁用“确定”。

### 连锁传播

若 `industries` 的补丁改变 `jobFunctions.value`，而 `direction` 依赖 `jobFunctions`：

1. 应用第一轮下游补丁；
2. 检测 `jobFunctions` 值是否实际变化；
3. 以 `changedPanelKey='jobFunctions'`、`source='dependency-patch'` 开始下一轮；
4. 更新 `direction`。

传播只允许沿 DAG 的下游方向。每个面板在一次用户操作产生的传播事务中最多成为一次 `changedPanelKey`，因此最大传播轮数不超过面板数；超出即视为配置错误并停止。

### 依赖就绪

默认规则：有 `dependsOn` 时，所有依赖面板至少有一个值才就绪。未就绪时：

- 面板顶部可以保留已有草稿 Tag；
- 搜索和 Tree 不可操作；
- Tree 区显示依赖提示；
- 不自动清空该面板值。

业务方可以通过 `isDependencyReady(context)` 覆盖默认规则。

## 搜索

每个面板独立配置：

```ts
export interface TreePanelLocalSearchConfig<NodeType> {
  mode: 'local';
  debounce?: number;
  filter?: (
    keyword: string,
    node: NodeType,
    path: TreePanelPathItem[],
  ) => boolean;
}

export interface TreePanelRemoteSearchConfig<NodeType> {
  mode: 'remote';
  debounce?: number;
  request: (
    keyword: string,
    context: TreePanelSearchContext<NodeType>,
  ) => Promise<NodeType[]>;
}
```

默认防抖为 `300ms`。`search=false` 时面板顶部 Select 只展示 Tag，不提供文本输入。

### 本地搜索

- 默认仅对字符串或数字 label 的标准化文本做大小写不敏感包含匹配；ReactNode label 无法可靠转换为搜索文本，必须提供 `filter`；
- 可通过 `filter` 实现别名、拼音或编码匹配；
- 预先建立标准化搜索文本索引；
- 搜索结果保留完整祖先分支；
- 自动展开命中路径；
- 清空关键词后恢复搜索前的展开状态；
- 不修改运行时主树。

### 远程搜索

请求上下文包含：

- 当前 `panelKey`；
- 完整 `draftValue` 和草稿层级记录；
- 当前面板依赖值；
- `AbortSignal`。

接口必须返回包含完整祖先链的分支树，不接受只有命中节点的扁平结果。

远程结果：

- 单独保存在 `searchTreeData` 并建立搜索索引；
- 不覆盖调用方的 `treeData`；
- 清空关键词后恢复主树；
- 选择搜索结果时，将该节点的完整祖先分支增量合并到组件实例的 `runtimeTreeData` 和主索引；
- 合并不修改调用方传入对象；
- 当前实例后续退出搜索、取消重开或确认重开时仍可回显；
- 组件卸载或 `dataVersion` 变化后，提升的分支失效；
- 编辑页首次挂载的已有值仍必须由业务方预载完整分支。

### 搜索竞态与缓存

每个面板维护独立关键词、Loading、错误、结果和请求编号：

- 空关键词不发远程请求；
- 新关键词取消旧请求；
- 依赖变化取消当前搜索；
- 依赖未就绪时不搜索；
- 搜索失败保留关键词并提供重试；
- 相同 `panelKey + dependencySignature + keyword` 可以命中实例级会话缓存；
- 每面板最多缓存最近 20 个远程搜索结果，按 LRU 淘汰；
- 关闭 Modal 终止进行中的搜索，但保留已完成缓存。

## 懒加载

```ts
export type TreePanelLoadChildren<NodeType> = (
  node: NodeType,
  context: {
    panelKey: string;
    draftValue: TreePanelPickerValue;
    selections: TreePanelPickerSelections<NodeType>;
    path: TreePanelPathItem[];
    signal: AbortSignal;
  },
) => Promise<NodeType[]>;
```

直接适配 Ant Design Tree `loadData`：

1. 展开未加载且 `isLeaf !== true` 的节点；
2. 按 `panelKey + dependencySignature + nodeValue` 去重；
3. 调用 `loadChildren`；
4. 返回值必须是该节点的直接子节点数组；
5. 增量插入 `runtimeTreeData` 并更新索引；
6. 清理受影响子树的路径缓存；
7. 更新 `loadedKeys`。

规则：

- 同面板重复节点值会拒绝整批返回并展示错误；
- 依赖变化取消相关面板旧请求；
- 失败节点保留可重试能力；
- 搜索结果树默认不触发懒加载，远程搜索应返回完整命中分支；
- “展开全部”不会触发懒加载。

## 运行时数据与缓存

面板数据按以下身份隔离：

```text
panelKey + dependencySignature
```

搜索和懒加载进一步加入关键词或节点值：

```text
panelKey + dependencySignature + keyword
panelKey + dependencySignature + nodeValue
```

`dependencySignature` 使用 `dependsOn` 声明顺序生成对象键；单选值按 `string/number` 类型编码，多选值先去重，再按类型和值稳定排序后编码。选择在业务语义上属于集合，因此不同点击顺序产生的等价多选值必须命中同一签名。

每个依赖签名拥有独立 `runtimeTreeData`、增量分支和懒加载状态。取消时激活已确认值对应签名，避免草稿依赖数据污染已确认会话。缓存规则：

- 每面板最多保留最近 10 个依赖签名数据集；
- 每面板每个签名最多保留 20 个搜索结果；
- 使用 LRU 淘汰；
- `treeData` 引用、`fieldNames` 或 `dataVersion` 变化时清除对应面板缓存；
- 组件卸载清理全部缓存和 AbortController；
- 不使用全局 Store 或持久化缓存。

## Modal 和面板界面

### 总体布局

```text
┌──────────────────────────────────────────────────────────────┐
│                                      Close                   │
│ ┌─ Panel A ──────┐ ┌─ Panel B ──────┐ ┌─ Panel C ──────┐   │
│ │ Tag + Search   │ │ Tag + Search   │ │ Tag + Search   │   │
│ │ Historical     │ │ Historical     │ │ Historical     │   │
│ │ Expand all     │ │ Expand all     │ │ DependencyHint │   │
│ │ Antd Tree      │ │ Antd Tree      │ │ Antd Tree       │   │
│ └────────────────┘ └────────────────┘ └─────────────────┘   │
│                                                Cancel Confirm │
└──────────────────────────────────────────────────────────────┘
```

默认建议值：

```text
modal width = calc(100vw - 64px)
panelWidth = 380px
panelGap = 16px
treeHeight = 480px
```

- 一个面板限制内容最大宽度，不无意义拉伸；
- 两到三个面板在可用区域内等宽；
- 更多面板保持最小宽度并横向滚动；
- Modal Footer 固定，不随横向滚动；
- Modal Body 不承担 Tree 的纵向滚动；
- 窄屏至少完整显示一个面板。

### 单面板结构

```text
Panel
├── title + optional + loading/error
├── PanelSearchSelect
│   ├── 当前面板草稿 Tag
│   └── 搜索输入
├── FrequentOptions
├── Expand all / Collapse all / Clear panel
└── Tree / Loading / Error / Empty / DependencyHint
```

`PanelSearchSelect` 使用 Ant Design Select 外观：

- `open={false}`，不使用其 Dropdown；
- 多选显示多个草稿 Tag；
- 单选最多一个 Tag；
- 搜索词由面板搜索状态控制；
- 删除 Tag 等价于取消对应树节点草稿；
- Tag 过多时折叠；
- Tooltip 展示完整路径，但同时提供完整可读的 `aria-label`。

### Expand All

Ant Design Tree 虚拟滚动只优化 DOM，不降低展开 Key 数量：

- 只展开已加载节点；
- 搜索状态只展开搜索结果树；
- 不递归请求懒加载分支；
- 使用索引收集可展开 Key；
- `expandAllThreshold` 默认 `2000`；
- 超过阈值时禁用全量展开操作并通过 Tooltip 说明，不弹出阻塞式确认框；
- 业务方可通过 `expandAll=false` 隐藏操作。

## 性能设计

目标：单面板约 10,000 个已加载节点。

### 数据层

```ts
interface PanelDataStore<NodeType> {
  sourceTreeData: NodeType[];
  runtimeTreeData: NodeType[];
  nodeByValue: Map<TreePanelRawValue, NormalizedNode<NodeType>>;
  parentByValue: Map<TreePanelRawValue, TreePanelRawValue | null>;
  childrenByValue: Map<TreePanelRawValue, TreePanelRawValue[]>;
  pathCache: Map<TreePanelRawValue, TreePanelPathItem[]>;
  searchTextByValue: Map<TreePanelRawValue, string>;
  selectedValues: Set<TreePanelRawValue>;
}
```

原则：

- 初始树只标准化一次；
- 仅在输入树、字段映射或版本变化时完整重建；
- 懒加载和搜索分支提升采用增量更新；
- 选中判断使用 `Set`；
- 路径按需缓存；
- 不在 Render 中扁平化完整树；
- 不深拷贝原始节点；
- 不因单个选择变化复制完整 10,000 节点结构。

### 渲染层

- 直接使用 Ant Design Tree `virtual` 和固定 `height`；
- `TreePanelPickerPanel`、Tag、常用选择和状态组件分别 Memo；
- 面板只订阅自身状态和稳定 Handler；
- 一个面板搜索不导致其他面板 Tree 重渲染；
- `treeTitleRender` 不执行路径回溯或重计算；
- 长节点标题使用省略和 Tooltip，保持可预测行高。

### 异步层

- 依赖、搜索、懒加载使用独立请求通道；
- 按面板和依赖签名隔离；
- 请求去重、过期响应拦截、卸载取消；
- 缓存具有明确容量上限；
- 不产生跨组件实例污染。

## 扩展点

```ts
trigger?: boolean | React.ReactNode | TreePanelPickerTriggerRender<NodeType>;
tagRender?: TreePanelPickerTagRender<NodeType>;
panelRender?: TreePanelPickerPanelRender<NodeType>;
treeTitleRender?: TreePanelPickerTreeTitleRender<NodeType>;
frequentOptionRender?: TreePanelFrequentOptionRender<NodeType>;
footerRender?: TreePanelPickerFooterRender<NodeType>;
emptyRender?: TreePanelPickerStateRender;
errorRender?: TreePanelPickerErrorRender;
dependencyRender?: TreePanelPickerStateRender;
```

约束：

- Render 扩展只接管展示，不获得内部 Store 的任意写权限；
- `panelRender` 可以包装默认面板；
- `footerRender` 获得确认、取消、Loading 和校验上下文；
- `treeTitleRender` 只渲染标题；
- 不透传全部 Ant Design Tree Props；
- `treeProps` 只开放不会覆盖内部 `treeData`、`checkedKeys`、`selectedKeys`、`loadData` 和事件 Handler 的视觉及可访问性白名单。

### Modal 和样式

```ts
modalProps?: Omit<
  ModalProps,
  'open' | 'onOk' | 'onCancel' | 'children' | 'confirmLoading'
>;

classNames?: {
  root?: string;
  trigger?: string;
  modal?: string;
  body?: string;
  panels?: string;
  panel?: string;
  panelHeader?: string;
  panelTree?: string;
  footer?: string;
};

styles?: {
  root?: React.CSSProperties;
  trigger?: React.CSSProperties;
  panels?: React.CSSProperties;
  panel?: React.CSSProperties;
  panelTree?: React.CSSProperties;
};
```

内部关键状态不能被 `modalProps` 覆盖。

## 校验与错误处理

### 确认前校验

顺序：

1. 依赖请求和传播是否稳定；
2. 值结构是否符合单选或多选；
3. 必填面板是否有值；
4. 所有值是否存在于运行时主索引；
5. 节点当前是否仍可选择或勾选；
6. 是否存在循环依赖、重复值等配置错误；
7. 执行业务自定义校验。

```ts
validate?: (
  draftValue: TreePanelPickerValue,
  context: {
    selections: TreePanelPickerSelections<NodeType>;
    signal: AbortSignal;
  },
) =>
  | void
  | string
  | TreePanelPickerValidationResult
  | Promise<void | string | TreePanelPickerValidationResult>;

export interface TreePanelPickerValidationResult {
  valid: boolean;
  message?: React.ReactNode;
  panelErrors?: Record<string, React.ReactNode>;
}
```

- 校验中确认按钮 Loading；
- 失败不关闭、不提交；
- 草稿再次变化后清理旧校验错误；
- 顶层错误显示在 Footer 上方，面板错误显示在对应面板。

### 错误隔离

| 类型           | 影响范围       | 阻止确认         |
| -------------- | -------------- | ---------------- |
| 远程搜索失败   | 当前搜索结果   | 清空搜索后不阻止 |
| 子节点加载失败 | 当前节点       | 草稿有效时不阻止 |
| 依赖请求失败   | 受影响面板     | 是               |
| 缺失已选节点   | 当前面板       | 是               |
| 重复节点值     | 当前面板       | 是               |
| 循环依赖       | 整个组件       | 是               |
| 必填为空       | 当前面板       | 是               |
| 自定义校验失败 | 顶层或指定面板 | 是               |

```ts
onError?: (
  error: unknown,
  context: {
    type:
      | 'dependency'
      | 'search'
      | 'loadChildren'
      | 'validation'
      | 'configuration';
    panelKey?: string;
    nodeValue?: TreePanelRawValue;
    keyword?: string;
  },
) => void;
```

`onError` 用于观测，不替代组件自身错误状态。每个可恢复异步错误提供重试操作。

## 可访问性

### 触发器

- 默认 Select 提供 `aria-haspopup="dialog"` 和 `aria-expanded`；
- 支持明确 `aria-label`；
- 禁用时鼠标、键盘和 Ref 都不能打开。

### Modal

- 使用 Ant Design Modal 的焦点锁定和 Esc 行为；
- 打开后聚焦第一个可操作面板的搜索框或 Tree；
- 关闭后恢复到触发元素；
- 无默认触发器时允许业务方提供焦点恢复目标 Ref。

### 面板和 Tree

- 每面板关联可读标题；
- 保留 Ant Design Tree 的方向键、Enter 和 Space 语义；
- 不拦截 Tree 键盘导航；
- 常用选择可键盘聚焦；
- Loading、错误和依赖提示使用适当 Live Region；
- Tag 的 `aria-label` 包含面板名和完整路径。

## 国际化

新增 `TreePanelPickerLocale`：

```ts
export interface TreePanelPickerLocale {
  confirm: string;
  cancel: string;
  clear: string;
  clearPanel: string;
  expandAll: string;
  collapseAll: string;
  historicalChoice: string;
  optional: string;
  searchPlaceholder: string;
  noData: string;
  noSearchResults: string;
  loading: string;
  retry: string;
  dependencyPlaceholder: (titles: string[]) => string;
  unknownValue: string;
  loadFailed: string;
  searchFailed: string;
}
```

接入现有 `ConfigProvider/useLocale`，提供中文和英文默认文案。

## 公开 Props 汇总

```ts
export interface TreePanelPickerProps<
  NodeType extends Record<string, any> = DefaultTreePanelNode,
> extends NativeProps {
  panels: TreePanelPickerPanelConfig<NodeType>[];

  value?: TreePanelPickerValue;
  defaultValue?: TreePanelPickerValue;
  onChange?: (
    value: TreePanelPickerValue,
    info: TreePanelPickerChangeInfo<NodeType>,
  ) => void;
  onDraftChange?: TreePanelPickerDraftChangeHandler<NodeType>;
  onDependencyChange?: TreePanelDependencyChangeHandler<NodeType>;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: TreePanelPickerOpenChangeHandler;

  disabled?: boolean;
  trigger?: boolean | React.ReactNode | TreePanelPickerTriggerRender<NodeType>;
  triggerProps?: TreePanelPickerTriggerProps<NodeType>;

  validate?: TreePanelPickerValidator<NodeType>;
  onError?: TreePanelPickerErrorHandler;

  panelWidth?: number;
  panelGap?: number;
  treeHeight?: number;
  virtual?: boolean;

  modalProps?: TreePanelPickerModalProps;

  tagRender?: TreePanelPickerTagRender<NodeType>;
  panelRender?: TreePanelPickerPanelRender<NodeType>;
  treeTitleRender?: TreePanelPickerTreeTitleRender<NodeType>;
  frequentOptionRender?: TreePanelFrequentOptionRender<NodeType>;
  footerRender?: TreePanelPickerFooterRender<NodeType>;
  emptyRender?: TreePanelPickerStateRender;
  errorRender?: TreePanelPickerErrorRender;
  dependencyRender?: TreePanelPickerStateRender;

  classNames?: TreePanelPickerClassNames;
  styles?: TreePanelPickerStyles;
}
```

面板级配置覆盖顶层 `treeHeight` 和 `virtual`。

## 配置校验

开发环境检查：

- 重复 `panel.key`；
- `dependsOn` 指向不存在的面板；
- 依赖图成环；
- 同面板节点值重复；
- 值引用不存在节点；
- 单选收到数组或多选收到标量；
- `checkStrategy` 配置在非 Checkbox 模式；
- `required` 与 `optional` 同时为真；
- `title` 不是字符串或数字且未提供 `ariaLabel`；
- 依赖补丁修改非下游面板；
- 常用项引用不存在节点；
- 懒加载返回重复值；
- 远程搜索分支内值冲突。

生产环境不只依赖警告：会导致错误提交的配置同时进入面板或顶层错误状态并阻止确认。

## 公开导出

从 `src/components/index.ts` 和 `src/index.ts` 导出：

```ts
export { default as TreePanelPicker } from './TreePanelPicker';
export type {
  TreePanelPickerProps,
  TreePanelPickerRef,
  TreePanelPickerPanelConfig,
  TreePanelPickerValue,
  TreePanelPickerChangeInfo,
  TreePanelSelectionRecord,
  TreePanelPickerFieldNames,
} from './TreePanelPicker/type';
```

Locale 相关入口额外导出 `TreePanelPickerLocale`。

当前空目录 `src/components/TreeSelect/` 不提供兼容别名，也不导出任何内容，避免与 Ant Design TreeSelect 混淆。实现阶段删除该空目录不会形成 Git 变更。

## 文档与 Demo

新增：

- `src/components/TreePanelPicker/index.md`
- `src/components/TreePanelPicker/index.en-US.md`
- 基础单面板 Demo；
- 动态双面板 Demo；
- Industries、Job Functions、Direction 三面板 Demo；
- `dependsOn` 和异步补丁 Demo；
- 本地和远程搜索 Demo；
- 展开懒加载 Demo；
- 父子关联与严格选择 Demo；
- 常用选择 Demo；
- `trigger=false` + Ref Demo；
- `open/onOpenChange` 受控打开 Demo；
- 四个以上面板横向滚动 Demo；
- 10,000 节点性能 Demo；
- 字段映射和节点能力 Demo；
- 自定义触发器、Tag、标题与 Footer Demo。

## 测试与验证

### 纯函数测试

- 建立 10,000 节点索引；
- 字段映射和重复值检测；
- 路径回溯及缓存失效；
- 懒加载增量插入；
- 搜索分支提升；
- `cascade/strict` 选择策略；
- `all/parent/child` 输出投影；
- 依赖拓扑排序和循环检测；
- 稳定依赖签名；
- 补丁权限和合并语义；
- LRU 缓存淘汰。

### 组件交互测试

- 默认 Select 点击和聚焦打开 Modal；
- `trigger=false` 时受控属性和 Ref 打开；
- 自定义触发器打开；
- 取消不提交；
- 确认只触发一次 `onChange`；
- 外部 Tag、面板、值和路径一致；
- 单选、多选和 Checkbox 面板并存；
- 常用选择与 Tree 同步；
- 本地搜索保留祖先；
- 删除面板 Tag 只更新草稿；
- 必填为空阻止确认；
- 动态增删和排序面板；
- 超过可用宽度时横向滚动。

### 异步测试

使用可控 Promise 验证：

- 搜索防抖；
- 旧搜索结果不能覆盖新结果；
- 依赖请求取消和过期响应拦截；
- 补丁按 DAG 传播；
- 未提供 `value` 时保留草稿；
- 懒加载去重、失败和重试；
- 关闭或卸载后异步结果不回写；
- 确认期间不重复提交；
- 取消后恢复已确认依赖签名数据；
- 搜索分支提升后当前实例可回显。

### 性能验证

10,000 节点 Demo 验证：

- DOM 中仅渲染可视 Tree 节点；
- 打开、搜索、展开和滚动保持可交互；
- 单面板输入不触发其他面板 Tree 重渲染；
- 选择节点不重建完整索引；
- 展开全部只作用于已加载节点；
- 缓存数量不超过上限。

### 仓库命令

```text
npm run lint:es
npm run lint:css
npm run build
npm run docs:build
```

若仓库缺少测试脚本，实施计划应先评估现有测试基础设施，再决定添加最小测试配置或以纯函数测试、类型检查、构建和 Demo 交互矩阵组合验证。任何既有问题导致的失败都需如实记录。

## 预计改动范围

- 新增 `src/components/TreePanelPicker/` 组件、模型、Hooks、样式、文档和 Demo；
- 修改 `src/components/index.ts` 导出组件和公开类型；
- 修改 `src/locales/type.ts`、`zh_CN.ts`、`en_US.ts` 和相关导出；
- 修改 `src/index.ts` 导出 Locale 类型；
- 视仓库测试基础设施新增 TreePanelPicker 测试文件和最小配置。

不修改 `PopoverSelect`，不进行无关组件重构，不升级依赖。

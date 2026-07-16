# HiTalent Design MCP Server

为 [HiTalent Design](https://github.com/Biyu20/HiTalent-Desgin) 组件库提供 AI 驱动的代码生成能力的 MCP 服务。

## 功能

通过 Model Context Protocol 暴露 3 个工具，让 AI 助手（如 Claude Code）能够：

| 工具              | 功能                               | 场景                               |
| ----------------- | ---------------------------------- | ---------------------------------- |
| `list_components` | 列出所有可用组件及功能标签         | "有哪些组件可用？"                 |
| `get_component`   | 获取单个组件的完整 API 文档        | "Button 支持哪些 props？"          |
| `generate_code`   | 根据需求自动匹配组件并生成代码指引 | "帮我写一个带防重复提交的保存按钮" |

## 安装

```bash
cd mcp
npm install
npm run build
```

## 配置 Claude Code

### 方式 1：项目级配置

在项目根目录创建或编辑 `.mcp.json`：

```json
{
  "mcpServers": {
    "hi-talent-design": {
      "command": "node",
      "args": ["path/to/hi-talent-design/mcp/dist/index.js"]
    }
  }
}
```

### 方式 2：全局用户配置

在 `~/.claude/.mcp.json` 中添加（推荐）：

```json
{
  "mcpServers": {
    "hi-talent-design": {
      "command": "node",
      "args": ["D:/2025_project/HiTalent-Desgin/mcp/dist/index.js"]
    }
  }
}
```

### 方式 3：Claude Desktop

在 Claude Desktop 的配置中添加：

```json
{
  "mcpServers": {
    "hi-talent-design": {
      "command": "node",
      "args": ["D:/2025_project/HiTalent-Desgin/mcp/dist/index.js"]
    }
  }
}
```

## 使用示例

配置完成后，在 AI 对话中：

### 示例 1：探索组件库

> **你**: 列出 HiTalent Design 的所有组件

> **AI**: 调用 `list_components` → 返回 Button、Modal、PopoverSelect、ConfigProvider 的摘要

### 示例 2：了解组件 API

> **你**: Modal 组件支持哪些高级功能？

> **AI**: 调用 `get_component({ componentName: "Modal" })` → 返回完整 props 文档、示例、ref API

### 示例 3：生成代码

> **你**: 我需要一个提交按钮，点击后自动 loading，1 秒内防止重复点击

> **AI**: 调用 `generate_code({ requirement: "提交按钮，自动loading，防重复点击" })` → 返回匹配到 Button 组件，提供代码骨架和相关示例，然后生成完整代码

## 组件覆盖

| 组件               | 增强特性                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **Button**         | `autoLoading`、`throttle`、`tooltip`                                                           |
| **Modal**          | `draggable`、`minimizable`（8 方位悬浮窗）、`maximizable`、命令式 `ModalRef`                   |
| **PopoverSelect**  | `showSearch`、`virtual`（虚拟滚动）、`showConfirm`、`showSelectAll`、`fieldNames`、`valueType` |
| **ConfigProvider** | `prefixCls`、`locale`                                                                          |

## 开发

```bash
cd mcp

npm install        # 安装依赖
npm run dev        # watch 模式构建
npm run build      # 一次性构建

# 使用 MCP Inspector 调试
npx @modelcontextprotocol/inspector node dist/index.js
```

## 架构

```
mcp/
├── src/
│   ├── index.ts                      # 服务入口 + 工具注册
│   ├── data/
│   │   └── component-registry.ts     # 组件元数据注册表
│   └── tools/
│       ├── types.ts                  # 共享类型
│       ├── list-components.ts        # 列出所有组件
│       ├── get-component.ts          # 获取组件详情
│       └── generate-code.ts          # 需求匹配 + 代码生成指引
├── package.json
├── tsconfig.json
└── README.md
```

## 扩展

添加新组件时，只需在 `component-registry.ts` 中新增条目即可。所有 3 个工具会自动适配新组件。

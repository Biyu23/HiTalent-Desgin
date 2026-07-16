#!/usr/bin/env node

/**
 * HiTalent Design MCP Server
 *
 * 为 HiTalent Design 组件库提供 AI 驱动的代码生成能力。
 * 通过 MCP 协议（Model Context Protocol）暴露 3 个工具：
 *
 *   1. list_components  — 列出所有可用组件及功能标签
 *   2. get_component     — 获取单个组件的完整 API 文档
 *   3. generate_code     — 根据需求描述自动匹配组件并生成代码指引
 *
 * 使用方式（stdio transport）：
 *   在 Claude Code 的 .mcp.json 中配置后，AI 助手可自动调用这些工具。
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { handleGenerateCode } from './tools/generate-code.js';
import { handleGetComponent } from './tools/get-component.js';
import { handleListComponents } from './tools/list-components.js';

// ==================== Server 初始化 ====================

const server = new McpServer({
  name: 'hi-talent-design-mcp',
  version: '0.0.1',
});

// ==================== Tool 1: list_components ====================

server.tool(
  'list_components',
  '列出所有可用的 HiTalent Design 组件。返回每个组件的名称、描述、分类和功能特性标签。用于了解组件库全貌，选择适合的组件。',
  {},
  async () => {
    const result = handleListComponents();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ==================== Tool 2: get_component ====================

server.tool(
  'get_component',
  '获取指定组件的完整 API 文档。返回组件的所有 Props 定义（含类型、默认值、说明）、使用示例代码、注意事项、以及命令式 API（如有）。用于深入了解某个组件的具体用法。',
  {
    componentName: z
      .string()
      .describe(
        "组件名称，如 'Button'、'Modal'、'PopoverSelect'、'ConfigProvider'",
      ),
  },
  async ({ componentName }) => {
    const result = handleGetComponent({ componentName });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ==================== Tool 3: generate_code ====================

server.tool(
  'generate_code',
  `根据需求描述，自动匹配最合适的 HiTalent Design 组件，并生成代码指引。

系统会根据你描述的功能场景，从组件库中匹配最佳组件，返回：
1. 匹配到的组件及其完整 API 文档
2. 与你需求最相关的 Props 说明
3. 最接近的使用示例
4. 推荐的代码骨架模板

你只需要用自然语言描述需求，比如：
- "我需要一个提交按钮，点击后自动 loading，还要防重复点击"
- "需要一个可拖拽、可最大化的弹窗，里面有表单"
- "需要一个多选下拉框，支持搜索，数据量很大"

支持中文和英文需求描述。`,
  {
    requirement: z
      .string()
      .describe(
        '需求描述。用自然语言描述你需要的 UI 功能和场景，支持中文和英文。',
      ),
    componentName: z
      .string()
      .optional()
      .describe(
        '可选。如果你明确知道要用哪个组件，直接指定名称（Button/Modal/PopoverSelect/ConfigProvider）。如果不指定，系统会根据需求自动匹配。',
      ),
  },
  async ({ requirement, componentName }) => {
    const result = handleGenerateCode({
      requirement,
      componentName,
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ==================== 启动 Server ====================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('HiTalent Design MCP Server 已启动 (stdio transport)');
}

main().catch((error) => {
  console.error('MCP Server 启动失败:', error);
  process.exit(1);
});

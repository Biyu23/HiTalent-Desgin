---
title: 安装
toc: content
---

# 安装

## 使用包管理器

HiTalent Design 将 React、React DOM 和 Ant Design 作为 peer dependencies。请在应用中一起安装：

```bash
npm install hi-talent-design antd
```

也可以使用 Yarn：

```bash
yarn add hi-talent-design antd
```

## 环境要求

| 依赖       | 支持范围  |
| ---------- | --------- |
| React      | >= 16.9.0 |
| React DOM  | >= 16.9.0 |
| Ant Design | >= 5 < 6  |
| TypeScript | 建议 4.7+ |

组件库以 ES Module 和 TypeScript 声明文件发布。使用前请确保构建工具能够处理应用中的 Ant Design 样式。

## 按需引入

直接从包入口引入需要的组件：

```tsx | pure
import { Button, Modal, PopoverSelect, Table } from 'hi-talent-design';
```

构建工具会根据实际引用进行 tree shaking。不要从 `src`、`dist` 或组件内部目录导入实现文件。

## 验证安装

创建一个最小按钮确认依赖和样式加载正常：

```tsx | pure
import { Button } from 'hi-talent-design';

export default () => <Button type="primary">开始使用</Button>;
```

下一步阅读[快速开始](/guide/quick-start)。

# HiTalent Design

基于 Ant Design 5 的企业级高级业务组件库。

---

## 🛠️ 环境要求

| 依赖环境       | 版本范围                     | 说明             |
| :------------- | :--------------------------- | :--------------- |
| **React**      | `>= 16.9.0` (推荐 React 17+) | Peer Dependency  |
| **React DOM**  | `>= 16.9.0` (推荐 React 17+) | Peer Dependency  |
| **Ant Design** | `>= 5.0.0 < 6.0.0`           | Peer Dependency  |
| **TypeScript** | `>= 4.7.0`                   | 建议开启严格模式 |

---

## 💻 本地开发与调试

本项目基于 [dumi 2](https://d.umijs.org/) 搭建组件文档站点，基于 [father 4](https://github.com/umijs/father) 进行组件库产物构建。

### 脚本说明

```bash
# 1. 安装依赖
npm install

# 2. 启动本地文档与组件调试服务（http://localhost:8000）
npm start
# 或
npm run dev

# 3. 构建组件库产物（生成 dist 与 lib 目录及 TypeScript 类型声明）
npm run build

# 4. 监听模式构建组件源码
npm run build:watch

# 5. 构建静态文档站点
npm run docs:build

# 6. 本地预览构建后的文档产物
npm run docs:preview

# 7. 执行代码规范与语法检查
npm run lint

# 8. 诊断项目配置与依赖环境
npm run doctor
```

---

## 📁 目录结构

```text
HiTalent-Design/
├── .dumirc.ts           # Dumi 2 文档站配置文件
├── docs/                # 指南文档与通用说明 (zh-CN & en-US)
│   ├── guide/           # 介绍、安装、快速上手与全局配置指南
│   └── hooks/           # Hooks 文档
├── src/
│   ├── components/      # 业务组件源码
│   │   ├── Button/                 # 增强按钮（自动 Loading / 节流 / Tooltip）
│   │   ├── Drawer/                 # 增强抽屉（自适应边缘缩放 / 全局 Dock 最小化）
│   │   ├── Modal/                  # 增强弹窗（拖拽 / 缩放 / 最大化 / 最小化 Dock）
│   │   ├── PopoverSelect/          # 气泡选择器（虚拟滚动 / 字段映射 / 字符串格式转换）
│   │   ├── ResponsiveButtonGroup/  # 响应式自适应操作按钮组
│   │   ├── Table/                  # 增强表格（列配置 / 列宽缩放 / 行列拖拽排序）
│   │   └── SvgIcon/                # 图标组件
│   ├── configProvider/  # ConfigProvider 全局配置上下文与命名空间 hook
│   ├── hooks/           # 通用 Hooks (useMergeState, useDragBounds, useFieldNames)
│   ├── locales/         # 双语语言包定义 (zh_CN, en_US)
│   ├── styles/          # 全局 token、Less 样式与 CSS-in-JS 规范
│   └── index.ts         # 统一对外导出入口
├── package.json         # 项目依赖与 Scripts 配置
└── tsconfig.json        # TypeScript 编译配置
```

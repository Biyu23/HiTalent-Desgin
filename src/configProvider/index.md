---
category: Components
title: ConfigProvider 全局配置
toc: content
---

# ConfigProvider 全局配置

通过 React Context 为 HiTalent Design 组件提供统一的样式前缀、Ant Design 前缀协同、语言包、局部文案和文字方向。

## 何时使用

- 应用需要统一切换组件库语言。
- 默认 `htd` 前缀与现有样式体系冲突，或在微前端（qiankun / Module Federation）中需要做样式命名空间隔离。
- 需要同步控制底层依赖的 Ant Design 组件类名前缀与图标前缀。
- 部分业务区域需要覆盖文案或切换 RTL。
- 多层业务模块需要继承外层配置并局部调整。

## 核心能力

- `prefixCls` 统一改变 HiTalent Design 自研组件 CSS class 前缀。
- `antdPrefixCls` 与 `iconPrefixCls` 自动透传并同步控制底层 Ant Design 组件和图标 class 前缀。
- 提供 `usePrefixCls` 与 `useNamespace`（统一命名空间构造器）供自研组件规范生成类名。
- `locale` 接收完整的 `zh_CN`、`en_US` 或自定义语言包。
- `localeOverrides` 只覆盖指定组件文案。
- 嵌套 Provider 自动合并外层配置。
- `direction` 支持 `ltr` 和 `rtl`。

## 代码演示

<code src="./demo/basic.tsx" title="基础配置与前缀协同" description="设置 prefixCls 和 antdPrefixCls，观察子组件与底层 Antd 组件读取统一配置。"></code>

<code src="./demo/custom-locale.tsx" title="语言、局部覆盖与 RTL" description="传入完整语言包，嵌套 Provider 继承配置，并分别覆盖文案或切换文字方向。"></code>

## API

| 属性              | 说明                                         | 类型              | 默认值         |
| ----------------- | -------------------------------------------- | ----------------- | -------------- |
| `prefixCls`       | HiTalent Design 组件 class 前缀              | `string`          | `htd`          |
| `antdPrefixCls`   | 底层 Ant Design 组件 class 前缀，透传给 antd | `string`          | `ant`          |
| `iconPrefixCls`   | 图标 class 前缀，透传给 antd                 | `string`          | `anticon`      |
| `locale`          | 完整组件语言包                               | `HtdLocale`       | `zh_CN`        |
| `localeOverrides` | 基于当前语言包的局部组件文案覆盖             | `LocaleOverrides` | -              |
| `direction`       | 文字与布局方向                               | `ltr \| rtl`      | 继承语言包方向 |
| `children`        | 使用当前配置的子节点                         | `ReactNode`       | -              |

## 钩子函数 (Hooks)

- `usePrefixCls(suffixCls?: string, customPrefix?: string): string`：获取拼接后的完整类名前缀。
- `useNamespace(suffixCls?: string, customPrefix?: string): UseNamespaceResult`：获取命名空间类名构造器（提供 `b()`, `e()`, `m()`, `em()`, `cls()`）。

## 注意事项

- 修改 `prefixCls` 时，若使用 Less 样式，建议在构建工具中同步配置 Less 变量 `@custom-prefix` 以确保编译期样式匹配。
- `antdPrefixCls` 会直接作用于 Ant Design 5 的底层组件及动态 CSS-in-JS 样式生成。
- `localeOverrides` 会在完整语言包之上合并，未覆盖字段继续继承。

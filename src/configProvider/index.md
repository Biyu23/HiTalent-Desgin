---
category: Components
title: ConfigProvider 全局配置
toc: content
---

# ConfigProvider 全局配置

通过 React Context 为 HiTalent Design 组件提供统一的样式前缀、语言包、局部文案和文字方向。

## 何时使用

- 应用需要统一切换组件库语言。
- 默认 `htd` 前缀与现有样式体系冲突。
- 部分业务区域需要覆盖文案或切换 RTL。
- 多层业务模块需要继承外层配置并局部调整。

## 核心能力

- `prefixCls` 统一改变组件 CSS class 前缀。
- `locale` 接收完整的 `zh_CN`、`en_US` 或自定义语言包。
- `localeOverrides` 只覆盖指定组件文案。
- 嵌套 Provider 自动合并外层配置。
- `direction` 支持 `ltr` 和 `rtl`。

## 代码演示

<code src="./demo/basic.tsx" title="基础配置" description="设置 prefixCls，并观察子组件读取统一配置。"></code>

<code src="./demo/custom-locale.tsx" title="语言、局部覆盖与 RTL" description="传入完整语言包，嵌套 Provider 继承配置，并分别覆盖文案或切换文字方向。"></code>

## API

| 属性              | 说明                             | 类型              | 默认值         |
| ----------------- | -------------------------------- | ----------------- | -------------- |
| `prefixCls`       | HiTalent Design 组件 class 前缀  | `string`          | `htd`          |
| `locale`          | 完整组件语言包                   | `HtdLocale`       | `zh_CN`        |
| `localeOverrides` | 基于当前语言包的局部组件文案覆盖 | `LocaleOverrides` | -              |
| `direction`       | 文字与布局方向                   | `ltr \| rtl`      | 继承语言包方向 |
| `children`        | 使用当前配置的子节点             | `ReactNode`       | -              |

## 注意事项

- HiTalent Design ConfigProvider 不替代 Ant Design ConfigProvider，两者可以嵌套使用。
- `localeOverrides` 会在完整语言包之上合并，未覆盖字段继续继承。
- 修改 `prefixCls` 时应保证组件样式使用相同前缀。

---
category: Components
title: ConfigProvider 全局配置
---

# ConfigProvider 全局配置

为 HiTalent Design 组件提供统一的样式前缀（`prefixCls`）与国际化（`locale`）支持。基于 React Context 实现，对包裹的子组件零侵入。

## 为什么需要这个组件

在使用 HiTalent Design 时，如果默认的 `htd` 样式前缀与项目中其他 UI 库冲突，或者需要全局切换语言包和文字方向，ConfigProvider 是统一入口。传入完整语言包进行切换，使用 `localeOverrides` 局部覆盖组件文案；嵌套 Provider 会自动继承外层配置。

## 代码演示

### 基础用法

<code src="./demo/basic.tsx"></code>

### 语言包、局部覆盖与 RTL

<code src="./demo/custom-locale.tsx"></code>

## API

<API src="./index.tsx" identifier="ConfigProviderProps" hideTitle></API>

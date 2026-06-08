---
category: Components
title: ConfigProvider 全局配置
---

# ConfigProvider 全局配置

为 MyUI 组件提供统一的样式前缀（`prefixCls`）与国际化（`locale`）支持。基于 React Context 实现，对包裹的子组件零侵入。

## 为什么需要这个组件

在使用 MyUI 时，如果默认的 `my-ui` 样式前缀与项目中其他 UI 库冲突，或者需要全局切换中英文语言包，ConfigProvider 是唯一入口。无需在每个组件上单独配置，只需在根组件外层包裹即可。

## 代码演示

### 基础用法

<code src="./demo/basic.tsx"></code>

### 自定义语言包

<code src="./demo/custom-locale.tsx"></code>

## API

<API src="./index.tsx" identifier="ConfigProviderProps" hideTitle></API>

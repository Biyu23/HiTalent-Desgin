---
category: Components
title: ConfigProvider
---

# ConfigProvider

Provides unified CSS class prefix (`prefixCls`) and internationalization (`locale`) support for all MyUI components. Built on React Context with zero intrusion to wrapped child components.

## Why this component

When the default `my-ui` class prefix conflicts with other UI libraries in your project, or you need to globally switch between Chinese and English language packs, ConfigProvider is the single entry point. No per-component configuration needed — simply wrap your root component.

## Demos

### Basic Usage

<code src="./demo/basic.tsx" title="Basic Usage" description="Use `prefixCls` to customize the CSS class prefix for components, avoiding style conflicts with other UI libraries in your project."></code>

### Custom Locale

<code src="./demo/custom-locale.tsx" title="Custom Locale" description="The `locale` prop supports built-in locale strings (`zh-CN` / `en-US`) or a custom locale object for flexible internationalization text overrides. Also shows ConfigProvider nesting for scoped locale switching."></code>

## API

<API src="./index.tsx" identifier="ConfigProviderProps" hideTitle></API>

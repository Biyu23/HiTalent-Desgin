---
category: Components
title: ConfigProvider
---

# ConfigProvider

Provides unified CSS class prefix (`prefixCls`) and internationalization (`locale`) support for all HiTalent Design components. Built on React Context with zero intrusion to wrapped child components.

## Why this component

When the default `htd` class prefix conflicts with another UI library, or when the application needs to switch language packs and text direction globally, ConfigProvider is the unified entry point. Pass a complete locale to switch languages, use `localeOverrides` for scoped copy changes, and nest providers to inherit the surrounding configuration.

## Demos

### Basic Usage

<code src="./demo/basic.tsx" title="Basic Usage" description="Use `prefixCls` to customize the CSS class prefix for components, avoiding style conflicts with other UI libraries in your project."></code>

### Locale, Overrides, and RTL

<code src="./demo/custom-locale.tsx" title="Locale, Overrides, and RTL" description="Pass a complete locale object to switch languages, use `localeOverrides` for scoped copy changes, and nest ConfigProvider to inherit configuration or switch text direction independently."></code>

## API

<API src="./index.tsx" identifier="ConfigProviderProps" hideTitle></API>

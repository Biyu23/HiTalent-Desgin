---
category: Components
title: ConfigProvider
toc: content
---

# ConfigProvider

Uses React Context to provide a shared CSS prefix, Ant Design prefix coordination, theme customization (Theme Token), locale package, scoped messages, and text direction to HiTalent Design components.

## When to use

- The application needs to switch the component locale from one place, including underlying Ant Design components.
- Need to customize Ant Design 5 primary color, border radius, dark algorithm, or Design Tokens.
- The default `htd` prefix conflicts with an existing style system, or microfrontend style isolation (qiankun / Module Federation) is needed.
- Need to coordinate class prefixes for both custom components and underlying Ant Design components.
- A workflow region needs scoped copy or RTL.
- Nested modules should inherit surrounding settings and adjust only selected values.

## Core capabilities

- `prefixCls` changes the shared HiTalent Design component class prefix.
- `antdPrefixCls` and `iconPrefixCls` forward to Ant Design ConfigProvider for underlying component prefix isolation.
- `theme` natively supports Ant Design 5 Design Tokens and theme algorithms (Dark mode, Compact mode, etc.).
- `usePrefixCls`, `useAntdPrefixCls`, and `useConfig` provide simple and robust access to prefixes and configuration.
- `locale` accepts `zh_CN`, `en_US`, or a complete custom locale.
- `antdLocale` forwards to underlying Ant Design components for synced i18n.
- `localeOverrides` replaces messages only for selected components (with deep merge and default fallback).
- Nested providers merge with surrounding configuration (follows native `theme.inherit: false` semantics).
- `direction` supports `ltr` and `rtl`.

## Demos

<code src="./demo/basic.tsx" title="Basic Configuration & Prefix Coordination" description="Set prefixCls and antdPrefixCls to coordinate prefixes across custom and Ant Design components."></code>

<code src="./demo/theme.tsx" title="Theme & Token Customization" description="Configure Design Tokens via the theme prop; custom components and underlying Antd components react dynamically."></code>

<code src="./demo/custom-locale.tsx" title="Locale, Overrides, and RTL" description="Pass a complete locale, inherit it through nested providers, then override selected copy or change direction."></code>

<code src="./demo/semantic-prefixes.tsx" title="Custom Prefixes and Portals" description="Verify that custom components, Ant Design children, and portal content inherit the configured namespaces."></code>

## API

| Property          | Description                                                                             | Type              | Default             |
| ----------------- | --------------------------------------------------------------------------------------- | ----------------- | ------------------- |
| `prefixCls`       | Class prefix for HiTalent Design components                                             | `string`          | `htd`               |
| `antdPrefixCls`   | Class prefix for underlying Ant Design components                                       | `string`          | `ant`               |
| `iconPrefixCls`   | Class prefix for icons                                                                  | `string`          | `anticon`           |
| `theme`           | Ant Design 5 theme config (Tokens, algorithms and component tokens; native inheritance) | `ThemeConfig`     | -                   |
| `locale`          | Complete component locale package                                                       | `HtdLocale`       | `zh_CN`             |
| `antdLocale`      | Underlying Ant Design locale package                                                    | `Locale`          | -                   |
| `localeOverrides` | Component-level copy merged onto the locale                                             | `LocaleOverrides` | -                   |
| `direction`       | Text and layout direction                                                               | `ltr \| rtl`      | inherited from Antd |
| `children`        | Descendants that consume this configuration                                             | `ReactNode`       | -                   |

> `ConfigProvider` also inherits all configuration properties from Ant Design 5's native `ConfigProvider` (such as `componentSize`, `getPopupContainer`, `wave`, etc.) and forwards them directly to child components.

## Hooks

- `useConfig(): ConfigContextValue`: Returns the full active global configuration object.
- `usePrefixCls(suffixCls?: string, customPrefix?: string): string`: Returns the resolved HiTalent Design class prefix string.
- `useAntdPrefixCls(customAntdPrefix?: string): string`: Returns the resolved underlying Ant Design class prefix string.
- `useLocale(componentName: keyof LocaleComponentMap, customLocale?: Partial<ComponentLocale>)`: Returns the current locale copy object for the specified component (with automatic Chinese fallback and instance-level override support).

## How to Customize Prefix and Theme

Because HiTalent Design deeply integrates **Ant Design 5 CSS-in-JS**, **no pre-compiled Less variable configuration is required in Webpack / Vite**. All class prefixes and Design Tokens are dynamically generated at runtime:

```tsx | pure
import { ConfigProvider, zh_CN } from 'hi-talent-design';
import antdZhCN from 'antd/locale/zh_CN';
import App from './App';

export default () => (
  <ConfigProvider
    prefixCls="myApp"
    antdPrefixCls="myAnt"
    locale={zh_CN}
    antdLocale={antdZhCN}
    theme={{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 6,
      },
    }}
  >
    <App />
  </ConfigProvider>
);
```

---

## Notes

- `antdPrefixCls` forwards directly to the underlying Ant Design 5 `<ConfigProvider>` to synchronously control Ant Design class names and CSS-in-JS style rendering.
- `theme` is forwarded directly to Ant Design, which owns token, component, algorithm, and CSS variable inheritance. `inherit: false` follows native Antd isolation rules.
- `localeOverrides` merges deeply on top of the complete locale, so untouched fields continue to inherit.
- Locale precedence is the current explicit `locale`, an inherited explicit locale, the nearest Antd language (English maps to `en_US`), then `zh_CN`. Setting `locale` does not automatically set `antdLocale`.
- While following the host language, `localeOverrides` is reapplied after language changes. A new complete `locale` replaces the inherited language and inherited copy overrides.
- Direction precedence is the current `direction`, the current explicit `locale.direction`, the nearest Antd direction, then the locale default. Empty nested providers preserve host RTL.
- `useConfig` and `useAntdPrefixCls` read native settings from the nearest Antd Context, including mixed provider nesting. Direct `ConfigContext` reads return the nearest HiTalent provider snapshot; use the hooks to observe native providers nested below it.

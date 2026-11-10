---
category: Components
title: ConfigProvider
toc: content
---

# ConfigProvider

Uses React Context to provide a shared CSS prefix, Ant Design prefix coordination, theme customization (Theme Token), locale package, scoped messages, and text direction to HiTalent Design components.

## Getting started

- Use HiTalent Design's `ConfigProvider` as the application entry point to configure both libraries. Native props such as `theme` and `componentSize` are forwarded to Antd.
- If the application already has an Antd `ConfigProvider`, components can reuse its theme, native prefix, and language directly. Without an explicit HiTalent locale, the nearest Antd English locale maps to `en_US`; other languages fall back to `zh_CN`.
- Add a HiTalent `ConfigProvider` when you need a shared HiTalent `prefixCls`, a complete `locale`, or `localeOverrides`. Nested providers can override settings for a specific region.

When no explicit HiTalent `locale` is set or inherited, setting only `antdLocale` lets HiTalent follow Chinese and English automatically. When setting `locale` explicitly, also set `antdLocale` to switch messages in both libraries.

## Demos

<code src="./demo/basic.tsx" title="Basic Configuration & Prefix Coordination" description="Set prefixCls and antdPrefixCls to coordinate prefixes across custom and Ant Design components."></code>

<code src="./demo/theme.tsx" title="Theme & Token Customization" description="Configure Design Tokens via the theme prop; custom components and underlying Antd components react dynamically."></code>

<code src="./demo/custom-locale.tsx" title="Locale, Overrides, and RTL" description="Pass a complete locale, inherit it through nested providers, then override selected copy or change direction."></code>

<code src="./demo/semantic-prefixes.tsx" title="Custom Prefixes and Portals" description="Verify that custom components, Ant Design children, and portal content inherit the configured namespaces."></code>

## API

| Property          | Description                                                                             | Type              | Default                                              |
| ----------------- | --------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------- |
| `prefixCls`       | Class prefix for HiTalent Design components                                             | `string`          | `htd`                                                |
| `antdPrefixCls`   | Class prefix for underlying Ant Design components                                       | `string`          | `ant`                                                |
| `iconPrefixCls`   | Class prefix for icons                                                                  | `string`          | `anticon`                                            |
| `theme`           | Ant Design 5 theme config (Tokens, algorithms and component tokens; native inheritance) | `ThemeConfig`     | -                                                    |
| `locale`          | Complete component locale package                                                       | `HtdLocale`       | inherited or mapped from Antd; falls back to `zh_CN` |
| `antdLocale`      | Underlying Ant Design locale package                                                    | `Locale`          | -                                                    |
| `localeOverrides` | Component-level copy merged onto the locale                                             | `LocaleOverrides` | -                                                    |
| `direction`       | Text and layout direction                                                               | `ltr \| rtl`      | inherited from Antd                                  |
| `children`        | Descendants that consume this configuration                                             | `ReactNode`       | -                                                    |

> `prefixCls` and `locale` configure HiTalent Design. Other Ant Design 5 props, such as `componentSize`, `getPopupContainer`, and `wave`, are forwarded directly. Use `antdPrefixCls` and `antdLocale` for the native prefix and locale.

## Hooks

- `useConfig(): ConfigContextValue`: Reads the HiTalent prefix, merged locale, direction, and Antd prefix, icon prefix, locale, and theme. Read `componentDisabled` and `componentSize` through Antd's `ConfigProvider.useConfig()`.
- `usePrefixCls(suffixCls?: string, customPrefix?: string): string`: Returns the resolved HiTalent Design class prefix string.
- `useAntdPrefixCls(customAntdPrefix?: string): string`: Returns the resolved underlying Ant Design class prefix string.
- `useLocale(componentName: keyof LocaleComponentMap, customLocale?: Partial<ComponentLocale>)`: Returns the current locale copy object for the specified component (with automatic Chinese fallback and instance-level override support).

## How to Customize Prefix and Theme

Component styles use CSS-in-JS. Custom prefixes and themes require no additional stylesheet or Less variable configuration:

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

## Notes

- `theme` is forwarded directly to Ant Design, which owns token, component, algorithm, and CSS variable inheritance. `inherit: false` follows native Antd isolation rules.
- `localeOverrides` merges message fields by component. Missing fields, `undefined`, and blank strings preserve existing messages; function-valued messages are replaced directly.
- Locale precedence is the current explicit `locale`, an inherited explicit locale, the nearest Antd language (English maps to `en_US`), then `zh_CN`. Setting `locale` does not automatically set `antdLocale`.
- While following the host language, `localeOverrides` is reapplied after language changes. A new complete `locale` replaces the inherited language and inherited copy overrides.
- Direction precedence is the current `direction`, the current explicit `locale.direction`, the nearest Antd direction, then the locale default. Empty nested providers preserve host RTL.
- Set language through `ConfigProvider.locale` and `ConfigProvider.localeOverrides`. `ConfigContext` exposes the nearest HiTalent provider snapshot. `useConfig`, `useLocale`, and `useAntdPrefixCls` read the nearest Antd Context and observe native providers nested below it.

---
category: Components
title: ConfigProvider
toc: content
---

# ConfigProvider

Uses React Context to provide a shared CSS prefix, Ant Design prefix coordination, locale package, scoped messages, and text direction to HiTalent Design components.

## When to use

- The application needs to switch the component locale from one place.
- The default `htd` prefix conflicts with an existing style system, or microfrontend style isolation (qiankun / Module Federation) is needed.
- Need to coordinate class prefixes for both custom components and underlying Ant Design components.
- A workflow region needs scoped copy or RTL.
- Nested modules should inherit surrounding settings and adjust only selected values.

## Core capabilities

- `prefixCls` changes the shared HiTalent Design component class prefix.
- `antdPrefixCls` and `iconPrefixCls` forward to Ant Design ConfigProvider for underlying component prefix isolation.
- `usePrefixCls` and `useNamespace` provide structured class generators (`b()`, `e()`, `m()`, `em()`, `cls()`).
- `locale` accepts `zh_CN`, `en_US`, or a complete custom locale.
- `localeOverrides` replaces messages only for selected components.
- Nested providers merge with surrounding configuration.
- `direction` supports `ltr` and `rtl`.

## Demos

<code src="./demo/basic.tsx" title="Basic Configuration & Prefix Coordination" description="Set prefixCls and antdPrefixCls to coordinate prefixes across custom and Ant Design components."></code>

<code src="./demo/custom-locale.tsx" title="Locale, Overrides, and RTL" description="Pass a complete locale, inherit it through nested providers, then override selected copy or change direction."></code>

## API

| Property          | Description                                       | Type              | Default                 |
| ----------------- | ------------------------------------------------- | ----------------- | ----------------------- |
| `prefixCls`       | Class prefix for HiTalent Design components       | `string`          | `htd`                   |
| `antdPrefixCls`   | Class prefix for underlying Ant Design components | `string`          | `ant`                   |
| `iconPrefixCls`   | Class prefix for icons                            | `string`          | `anticon`               |
| `locale`          | Complete component locale package                 | `HtdLocale`       | `zh_CN`                 |
| `localeOverrides` | Component-level copy merged onto the locale       | `LocaleOverrides` | -                       |
| `direction`       | Text and layout direction                         | `ltr \| rtl`      | inherited from `locale` |
| `children`        | Descendants that consume this configuration       | `ReactNode`       | -                       |

## Hooks

- `usePrefixCls(suffixCls?: string, customPrefix?: string): string`: Returns the resolved class prefix string.
- `useNamespace(suffixCls?: string, customPrefix?: string): UseNamespaceResult`: Returns a namespace generator object (`b()`, `e()`, `m()`, `em()`, `cls()`).

## Notes

- When changing `prefixCls`, ensure build-time Less variables (`@custom-prefix`) match if using Less styles.
- `antdPrefixCls` applies directly to Ant Design 5 CSS-in-JS style rendering.
- `localeOverrides` merges on top of the complete locale, so untouched fields continue to inherit.

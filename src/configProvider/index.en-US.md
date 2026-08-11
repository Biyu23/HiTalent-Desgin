---
category: Components
title: ConfigProvider
toc: content
---

# ConfigProvider

Uses React Context to provide a shared CSS prefix, locale package, scoped messages, and text direction to HiTalent Design components.

## When to use

- The application needs to switch the component locale from one place.
- The default `htd` prefix conflicts with an existing style system.
- A workflow region needs scoped copy or RTL.
- Nested modules should inherit surrounding settings and adjust only selected values.

## Core capabilities

- `prefixCls` changes the shared component class prefix.
- `locale` accepts `zh_CN`, `en_US`, or a complete custom locale.
- `localeOverrides` replaces messages only for selected components.
- Nested providers merge with surrounding configuration.
- `direction` supports `ltr` and `rtl`.

## Demos

<code src="./demo/basic.tsx" title="Basic Configuration" description="Set prefixCls and see child components read the shared configuration."></code>

<code src="./demo/custom-locale.tsx" title="Locale, Overrides, and RTL" description="Pass a complete locale, inherit it through nested providers, then override selected copy or change direction."></code>

## API

| Property          | Description                                 | Type              | Default                 |
| ----------------- | ------------------------------------------- | ----------------- | ----------------------- |
| `prefixCls`       | Class prefix for HiTalent Design components | `string`          | `htd`                   |
| `locale`          | Complete component locale package           | `HtdLocale`       | `zh_CN`                 |
| `localeOverrides` | Component-level copy merged onto the locale | `LocaleOverrides` | -                       |
| `direction`       | Text and layout direction                   | `ltr \| rtl`      | inherited from `locale` |
| `children`        | Descendants that consume this configuration | `ReactNode`       | -                       |

## Notes

- HiTalent Design ConfigProvider does not replace Ant Design ConfigProvider; compose both when the application needs them.
- `localeOverrides` merges on top of the complete locale, so untouched fields continue to inherit.
- When changing `prefixCls`, make sure component styles use the same prefix.

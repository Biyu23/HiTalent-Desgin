---
title: Global Configuration
toc: content
---

# Global Configuration

ConfigProvider is the shared runtime configuration entry for HiTalent Design. It controls the CSS prefix, locale package, scoped message overrides, and text direction. See the complete [ConfigProvider API](/en-US/components/config-provider).

Use this provider alone at the application root; Antd props such as `theme` and `componentSize` are forwarded directly. An existing Antd provider can also supply the theme, native prefix, and language. Add a HiTalent provider when you need a shared HiTalent prefix or scoped messages.

## Set the CSS prefix and locale

```tsx | pure
import { ConfigProvider } from 'hi-talent-design';
import antdEnUS from 'antd/locale/en_US';

export default () => (
  <ConfigProvider prefixCls="my-app" antdLocale={antdEnUS}>
    <App />
  </ConfigProvider>
);
```

`prefixCls` sets the HiTalent component class prefix. In this example, `antdLocale` switches messages in both libraries.

Without an explicit HiTalent locale, components follow the nearest Antd language: English maps to `en_US`, while other languages fall back to `zh_CN`. Chinese and English applications can therefore set only `antdLocale`. An explicit `locale` changes HiTalent messages only; also set `antdLocale` to switch Antd messages.

## Override selected messages

Override only the copy your workflow needs without cloning a complete locale:

```tsx | pure
import { ConfigProvider, en_US } from 'hi-talent-design';

export default () => (
  <ConfigProvider
    locale={en_US}
    localeOverrides={{
      PopoverSelect: {
        placeholder: 'Choose reviewers',
        confirm: 'Apply selection',
      },
    }}
  >
    <App />
  </ConfigProvider>
);
```

A nested ConfigProvider merges `localeOverrides` by message field. Passing a new complete `locale` resets the inherited language and its message overrides.

## Follow application locale state

The application owns i18n initialization, language changes, and translation resource loading. The component library keeps its default messages, receives the active package through `locale`, and accepts application `t()` results through `localeOverrides`.

This Chinese and English example uses the application's initialized react-i18next instance to switch both HiTalent Design and Ant Design locales:

```tsx | pure
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import antdEnUS from 'antd/locale/en_US';
import antdZhCN from 'antd/locale/zh_CN';
import { ConfigProvider, en_US, zh_CN } from 'hi-talent-design';
import App from './App';

export default () => {
  const { t, i18n } = useTranslation('common');
  const isZh = i18n.language.startsWith('zh');
  const localeOverrides = useMemo(
    () => ({ EditableField: { save: t('save') } }),
    [t],
  );

  return (
    <ConfigProvider
      locale={isZh ? zh_CN : en_US}
      antdLocale={isZh ? antdZhCN : antdEnUS}
      localeOverrides={localeOverrides}
    >
      <App />
    </ConfigProvider>
  );
};
```

Replace `common` and `save` with the application's existing namespace and translation key. The example uses `i18n.language` for compatibility with i18next 20. The component library does not depend on, create, or initialize an i18next instance.

## Change text direction

```tsx | pure
<ConfigProvider locale={en_US} direction="rtl">
  <App />
</ConfigProvider>
```

A nested provider can configure RTL for a specific region. `direction` is forwarded to Antd and exposed through HiTalent's `useConfig()`. Set `dir="rtl"` on a container to control the direction of application HTML.

## Notes

- `theme` and `antdLocale` are forwarded to the internal Ant Design ConfigProvider and can be set together at the application root.
- Use `localeOverrides` for a small set of workflow messages, not as a replacement for a complete locale package.
- Component styles are generated through CSS-in-JS, so a custom `prefixCls` requires no additional stylesheet. Update any application CSS selectors that reference the prefix.

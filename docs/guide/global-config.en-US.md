---
title: Global Configuration
toc: content
---

# Global Configuration

ConfigProvider is the shared runtime configuration entry for HiTalent Design. It controls the CSS prefix, locale package, scoped message overrides, and text direction. See the complete [ConfigProvider API](/en-US/components/config-provider).

## Set the CSS prefix and locale

```tsx | pure
import { ConfigProvider, en_US } from 'hi-talent-design';

export default () => (
  <ConfigProvider prefixCls="my-app" locale={en_US} direction="ltr">
    <App />
  </ConfigProvider>
);
```

`prefixCls` isolates component class names, `locale` accepts a complete locale package, and `direction` supports `ltr` or `rtl`.

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

A nested ConfigProvider inherits the surrounding configuration and replaces only values provided at the current level.

## Follow application locale state

The library does not require a specific internationalization framework. This example selects a package from react-i18next state:

```tsx | pure
import { useTranslation } from 'react-i18next';
import { ConfigProvider, en_US, zh_CN } from 'hi-talent-design';

export default () => {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage?.startsWith('en') ? en_US : zh_CN;

  return (
    <ConfigProvider locale={locale}>
      <App />
    </ConfigProvider>
  );
};
```

## Change text direction

```tsx | pure
<ConfigProvider locale={en_US} direction="rtl">
  <App />
</ConfigProvider>
```

A nested provider can switch only the region that needs RTL. Components read direction from the nearest provider.

## Notes

- Ant Design theme and locale remain the responsibility of Ant Design ConfigProvider; the two providers can be composed at the application root.
- Use `localeOverrides` for a small set of workflow messages, not as a replacement for a complete locale package.
- When changing `prefixCls`, ensure the application loads component styles that use the same prefix.

---
nav:
  title: Guide
  order: 0
group:
  title: Getting Started
  order: 0
---

# Getting Started

HiTalent Design is an advanced business component library built on Ant Design, designed to simplify UI development in complex scenarios.

## Features

- **Out of the Box**: Components come with common business logic built-in — no repeated wrapping needed
- **Type Safe**: Complete TypeScript type support with robust generics
- **Theme Customization**: Easily configure global themes via ConfigProvider
- **Internationalization**: Built-in Chinese and English support

## Quick Start

```bash
npm install hi-talent-design antd
```

## Usage Example

```tsx | pure
import { Button, PopoverSelect, Modal } from 'hi-talent-design';

export default () => {
  return (
    <div>
      <Button iconPosition="right">Advanced Button</Button>
      <PopoverSelect options={[]} placeholder="Please select" />
      <Modal title="Modal Title">Content</Modal>
    </div>
  );
};
```

## Global Configuration

```tsx | pure
import { ConfigProvider } from 'hi-talent-design';

// Option 1: Pass a built-in locale string
export default () => (
  <ConfigProvider prefixCls="my-app" locale="en-US">
    <App />
  </ConfigProvider>
);

// Option 2: Pass a custom locale object
export default () => (
  <ConfigProvider
    prefixCls="my-app"
    locale={{ PopoverSelect: { placeholder: 'Choose' } }}
  >
    <App />
  </ConfigProvider>
);

// Option 3: Bridge with react-i18next
import { useTranslation } from 'react-i18next';
import { createHiTalent DesignLocale } from 'hi-talent-design';

export default () => {
  const { t } = useTranslation();
  const locale = useMemo(() => createHiTalent DesignLocale(t, { keyPrefix: 'hi-talent-design' }), [t]);

  return (
    <ConfigProvider locale={locale}>
      <App />
    </ConfigProvider>
  );
};
```

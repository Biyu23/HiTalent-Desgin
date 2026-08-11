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
import { ConfigProvider, en_US } from 'hi-talent-design';

// Option 1: Pass a complete locale and optionally set text direction
export default () => (
  <ConfigProvider prefixCls="my-app" locale={en_US} direction="ltr">
    <App />
  </ConfigProvider>
);

// Option 2: Override selected messages on top of a complete locale
export default () => (
  <ConfigProvider
    locale={en_US}
    localeOverrides={{
      PopoverSelect: { placeholder: 'Choose a document' },
    }}
  >
    <App />
  </ConfigProvider>
);

// Option 3: Select the component locale from react-i18next state
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

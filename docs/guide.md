# HiTalent Design 使用指南

HiTalent Design 是一套基于 Ant Design 深度封装的高级业务组件库，旨在简化复杂场景下的 UI 开发。

## 特性

- **开箱即用**：组件内置常见业务逻辑，无需重复封装
- **类型安全**：完整的 TypeScript 类型支持
- **主题定制**：通过 ConfigProvider 轻松实现全局主题配置
- **国际化**：内置中英文支持

## 快速开始

```bash
npm install hi-talent-design antd
```

## 使用示例

```tsx | pure
import { Button, PopoverSelect, Modal } from 'hi-talent-design';

export default () => {
  return (
    <div>
      <Button iconPosition="right">高级按钮</Button>
      <PopoverSelect options={[]} placeholder="请选择" />
      <Modal title="弹窗标题">内容</Modal>
    </div>
  );
};
```

## 全局配置

```tsx | pure
import { ConfigProvider, en_US } from 'hi-talent-design';

// 方式一：传入完整语言包，并可显式设置文字方向
export default () => (
  <ConfigProvider prefixCls="my-app" locale={en_US} direction="ltr">
    <App />
  </ConfigProvider>
);

// 方式二：在完整语言包上局部覆盖文案
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

// 方式三：使用 react-i18next 的当前语言选择组件库语言包
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

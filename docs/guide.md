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
import { ConfigProvider } from 'hi-talent-design';

// 方式一：直接传入语言包字符串
export default () => (
  <ConfigProvider prefixCls="my-app" locale="en-US">
    <App />
  </ConfigProvider>
);

// 方式二：传入自定义语言包对象
export default () => (
  <ConfigProvider
    prefixCls="my-app"
    locale={{ PopoverSelect: { placeholder: 'Choose' } }}
  >
    <App />
  </ConfigProvider>
);

// 方式三：与 react-i18next 桥接
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

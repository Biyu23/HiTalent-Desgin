---
title: 全局配置
toc: content
---

# 全局配置

ConfigProvider 是 HiTalent Design 的统一运行时配置入口，用于管理样式前缀、语言包、局部文案覆盖和文字方向。完整属性见 [ConfigProvider API](/components/config-provider)。

## 设置样式前缀和语言

```tsx | pure
import { ConfigProvider, zh_CN } from 'hi-talent-design';

export default () => (
  <ConfigProvider prefixCls="my-app" locale={zh_CN} direction="ltr">
    <App />
  </ConfigProvider>
);
```

`prefixCls` 用于隔离组件 CSS class；`locale` 接收完整语言包；`direction` 支持 `ltr` 和 `rtl`。

## 局部覆盖文案

无需复制完整语言包，只覆盖业务需要调整的组件文案：

```tsx | pure
import { ConfigProvider, zh_CN } from 'hi-talent-design';

export default () => (
  <ConfigProvider
    locale={zh_CN}
    localeOverrides={{
      PopoverSelect: {
        placeholder: '选择参与评审的成员',
        confirm: '应用选择',
      },
    }}
  >
    <App />
  </ConfigProvider>
);
```

嵌套 ConfigProvider 会继承外层配置，只覆盖当前层显式提供的值。

## 与应用国际化状态联动

组件库不绑定具体国际化框架。下面使用 react-i18next 的当前语言选择对应语言包：

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

## 切换文字方向

```tsx | pure
<ConfigProvider locale={en_US} direction="rtl">
  <App />
</ConfigProvider>
```

只有需要 RTL 的区域也可以使用嵌套 Provider 单独切换。组件自身的布局和交互会读取当前 direction。

## 注意事项

- Ant Design 自身的主题和语言仍由 Ant Design ConfigProvider 管理；两者可以在应用入口组合使用。
- `localeOverrides` 适合少量业务文案，不应替代完整语言包。
- 自定义 `prefixCls` 时，请确认应用同时加载了与前缀匹配的组件样式。

---
title: 全局配置
toc: content
---

# 全局配置

ConfigProvider 是 HiTalent Design 的统一运行时配置入口，用于管理样式前缀、语言包、局部文案覆盖和文字方向。完整属性见 [ConfigProvider API](/components/config-provider)。

应用入口可以只使用这个 Provider，Antd 的 `theme`、`componentSize` 等属性会直接透传。已有 Antd Provider 时，组件也可直接复用它的主题、原生前缀和语言；需要统一配置 HiTalent 前缀或局部文案时再添加 HiTalent Provider。

## 设置样式前缀和语言

```tsx | pure
import { ConfigProvider } from 'hi-talent-design';
import antdZhCN from 'antd/locale/zh_CN';

export default () => (
  <ConfigProvider prefixCls="my-app" antdLocale={antdZhCN}>
    <App />
  </ConfigProvider>
);
```

`prefixCls` 设置 HiTalent 组件 CSS class 前缀；`antdLocale` 在这个示例中同时切换两套组件文案。

未显式设置 HiTalent 语言时，组件跟随最近的 Antd 语言：英文使用 `en_US`，其他情况使用 `zh_CN`。因此中英文应用可只设置 `antdLocale`；显式指定 `locale` 时，它只影响 HiTalent 文案，需要同步切换 Antd 时还应设置 `antdLocale`。

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

嵌套 ConfigProvider 会按字段合并 `localeOverrides`。传入新的完整 `locale` 时，会重置父级语言及其文案覆盖。

## 与应用国际化状态联动

业务项目负责 i18n 初始化、语言切换和翻译资源加载；组件库保留默认文案，通过 `locale` 接收当前语言包，通过 `localeOverrides` 接收业务 `t()` 的翻译结果。

下面的中英文示例使用业务项目已初始化的 react-i18next，同时切换 HiTalent Design 和 Ant Design 的语言：

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

示例中的 `common` 和 `save` 请替换为业务项目已有的命名空间和翻译 key。这里使用 `i18n.language`，兼容 i18next 20；组件库不依赖、创建或初始化 i18next 实例。

## 切换文字方向

```tsx | pure
<ConfigProvider locale={en_US} direction="rtl">
  <App />
</ConfigProvider>
```

嵌套 Provider 可为局部区域设置 RTL。`direction` 会透传给 Antd，并可通过 HiTalent 的 `useConfig()` 读取；业务 HTML 的文字方向可通过容器的 `dir="rtl"` 设置。

## 注意事项

- `theme` 和 `antdLocale` 会透传给内部 Ant Design ConfigProvider，可以在应用入口统一设置。
- `localeOverrides` 适合少量业务文案，不应替代完整语言包。
- 组件样式由 CSS-in-JS 生成，自定义 `prefixCls` 无需另行加载样式文件；业务中自行编写的选择器需同步更新。

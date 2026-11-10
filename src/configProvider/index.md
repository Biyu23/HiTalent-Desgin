---
category: Components
title: ConfigProvider 全局配置
toc: content
---

# ConfigProvider 全局配置

通过 React Context 为 HiTalent Design 组件提供统一的样式前缀、Ant Design 前缀协同、主题定制（Theme Token）、语言包、局部文案和文字方向。

## 如何接入

- 应用入口可以只使用 HiTalent Design 的 `ConfigProvider`，同时配置自研组件和 Ant Design；`theme`、`componentSize` 等原生属性会透传给 Antd。
- 已有 Antd `ConfigProvider` 时，组件可直接复用其主题、原生前缀和语言。没有显式 HiTalent 语言时，最近的 Antd 英文语言映射为 `en_US`，其他情况使用 `zh_CN`。
- 需要统一设置自研组件 `prefixCls`、完整 `locale` 或 `localeOverrides` 时，再使用 HiTalent `ConfigProvider`；嵌套 Provider 可局部覆盖配置。

未继承或设置显式 HiTalent `locale` 时，中英文场景可以只设置 `antdLocale`，让 HiTalent 自动跟随；显式设置 `locale` 时，请同时设置 `antdLocale` 以切换两套组件文案。

## 代码演示

<code src="./demo/basic.tsx" title="基础配置与前缀协同" description="设置 prefixCls 和 antdPrefixCls，观察子组件与底层 Antd 组件读取统一配置。"></code>

<code src="./demo/theme.tsx" title="主题与 Token 定制" description="通过 theme 属性配置 Design Token，自研组件与底层 Antd 组件实时响应主题动态切换。"></code>

<code src="./demo/custom-locale.tsx" title="语言、局部覆盖与 RTL" description="传入完整语言包，嵌套 Provider 继承配置，并分别覆盖文案或切换文字方向。"></code>

<code src="./demo/semantic-prefixes.tsx" title="自定义前缀与 Portal" description="验证自研组件、Ant Design 子组件及 Portal 内容统一继承自定义命名空间。"></code>

## API

| 属性              | 说明                                                                  | 类型              | 默认值                            |
| ----------------- | --------------------------------------------------------------------- | ----------------- | --------------------------------- |
| `prefixCls`       | HiTalent Design 组件 class 前缀                                       | `string`          | `htd`                             |
| `antdPrefixCls`   | 底层 Ant Design 组件 class 前缀，透传给 antd                          | `string`          | `ant`                             |
| `iconPrefixCls`   | 图标 class 前缀，透传给 antd                                          | `string`          | `anticon`                         |
| `theme`           | Ant Design 5 主题配置（Token、算法、组件 Token 等，由 Antd 处理继承） | `ThemeConfig`     | -                                 |
| `locale`          | HiTalent Design 完整组件语言包                                        | `HtdLocale`       | 继承父级或跟随 Antd，回退 `zh_CN` |
| `antdLocale`      | 底层 Ant Design 语言包，透传给 antd                                   | `Locale`          | -                                 |
| `localeOverrides` | 基于当前语言包的局部组件文案覆盖                                      | `LocaleOverrides` | -                                 |
| `direction`       | 文字与布局方向                                                        | `ltr \| rtl`      | 继承 Antd 方向                    |
| `children`        | 使用当前配置的子节点                                                  | `ReactNode`       | -                                 |

> 除 `prefixCls` 和 `locale` 用于 HiTalent Design 外，其余 Ant Design 5 原生配置属性（如 `componentSize`、`getPopupContainer`、`wave` 等）直接透传。原生前缀和语言分别使用 `antdPrefixCls`、`antdLocale`。

## Hooks

- `useConfig(): ConfigContextValue`：读取 HiTalent 前缀、合并后的语言包、方向及 Antd 前缀、图标前缀、语言和主题。`componentDisabled`、`componentSize` 请通过 Antd 的 `ConfigProvider.useConfig()` 读取。
- `usePrefixCls(suffixCls?: string, customPrefix?: string): string`：获取拼接后的完整自研组件类名前缀。
- `useAntdPrefixCls(customAntdPrefix?: string): string`：获取当前生效的底层 Ant Design 类名前缀。
- `useLocale(componentName: keyof LocaleComponentMap, customLocale?: Partial<ComponentLocale>)`：获取指定组件当前的国际化文案对象，支持中文兜底、嵌套 Provider 继承和实例文案覆盖。

## 如何自定义前缀与主题

组件样式使用 CSS-in-JS，自定义前缀和主题无需额外加载样式文件或配置 Less 变量：

```tsx | pure
import { ConfigProvider, zh_CN } from 'hi-talent-design';
import antdZhCN from 'antd/locale/zh_CN';
import App from './App';

export default () => (
  <ConfigProvider
    prefixCls="myApp"
    antdPrefixCls="myAnt"
    locale={zh_CN}
    antdLocale={antdZhCN}
    theme={{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 6,
      },
    }}
  >
    <App />
  </ConfigProvider>
);
```

## 注意事项

- `theme` 直接透传给 Ant Design，由 Antd 处理 Token、组件主题、算法和 CSS 变量的继承；`inherit: false` 遵循 Antd 的原生隔离规则。
- `localeOverrides` 按组件合并文案字段；未提供、`undefined` 和空白字符串继续继承已有文案，函数型文案直接替换。
- 语言优先级为本层显式 `locale`、父级显式语言、最近的 Antd 语言（英文映射到 `en_US`），最后回退 `zh_CN`。`locale` 不会自动设置 `antdLocale`。
- 自动跟随宿主语言时，`localeOverrides` 会随语言切换重新应用；本层传入新的完整 `locale` 会替换父级语言和父级文案覆盖。
- 方向优先级为本层 `direction`、本层显式 `locale.direction`、最近的 Antd 方向，最后回退语言包方向。空的嵌套 Provider 不会覆盖宿主 RTL。
- 语言通过 `ConfigProvider` 的 `locale` 和 `localeOverrides` 设置，`ConfigContext` 用于读取最近一个 HiTalent Provider 的配置快照。`useConfig`、`useLocale` 与 `useAntdPrefixCls` 会读取最近的 Antd Context，支持感知其下层原生 Provider 的配置。

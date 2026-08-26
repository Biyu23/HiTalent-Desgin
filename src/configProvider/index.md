---
category: Components
title: ConfigProvider 全局配置
toc: content
---

# ConfigProvider 全局配置

通过 React Context 为 HiTalent Design 组件提供统一的样式前缀、Ant Design 前缀协同、主题定制（Theme Token）、语言包、局部文案和文字方向。

## 何时使用

- 应用需要统一切换组件库语言或底层 Ant Design 组件语言。
- 需要定制 Ant Design 5 的主题色、圆角、暗黑模式（Algorithm）或 Design Token。
- 默认 `htd` 前缀与现有样式体系冲突，或在微前端（qiankun / Module Federation）中需要做样式命名空间隔离。
- 需要同步控制底层依赖的 Ant Design 组件类名前缀与图标前缀。
- 部分业务区域需要局部覆盖文案或切换 RTL。
- 多层业务模块需要继承外层配置并局部微调。

## 核心能力

- `prefixCls` 统一改变 HiTalent Design 自研组件 CSS class 前缀。
- `antdPrefixCls` 与 `iconPrefixCls` 自动透传并同步控制底层 Ant Design 组件和图标 class 前缀。
- 提供 `usePrefixCls`、`useAntdPrefixCls` 与 `useConfig` 供业务组件读取并接入全局配置与类名前缀。
- `antdLocale` 支持同步透传底层 Ant Design 语言包。
- `localeOverrides` 支持只覆盖指定组件文案（具备深度合并与中文兜底）。
- 嵌套 Provider 自动合并并继承外层配置（支持 `theme.inherit: false` 独立隔离）。
- `direction` 支持 `ltr` 和 `rtl`。

## 代码演示

<code src="./demo/basic.tsx" title="基础配置与前缀协同" description="设置 prefixCls 和 antdPrefixCls，观察子组件与底层 Antd 组件读取统一配置。"></code>

<code src="./demo/theme.tsx" title="主题与 Token 定制" description="通过 theme 属性配置 Design Token，自研组件与底层 Antd 组件实时响应主题动态切换。"></code>

<code src="./demo/custom-locale.tsx" title="语言、局部覆盖与 RTL" description="传入完整语言包，嵌套 Provider 继承配置，并分别覆盖文案或切换文字方向。"></code>

<code src="./demo/semantic-prefixes.tsx" title="自定义前缀与 Portal" description="验证自研组件、Ant Design 子组件及 Portal 内容统一继承自定义命名空间。"></code>

## API

| 属性              | 说明                                                              | 类型              | 默认值         |
| ----------------- | ----------------------------------------------------------------- | ----------------- | -------------- |
| `prefixCls`       | HiTalent Design 组件 class 前缀                                   | `string`          | `htd`          |
| `antdPrefixCls`   | 底层 Ant Design 组件 class 前缀，透传给 antd                      | `string`          | `ant`          |
| `iconPrefixCls`   | 图标 class 前缀，透传给 antd                                      | `string`          | `anticon`      |
| `theme`           | Ant Design 5 主题配置（Token、算法、组件 Token 等，自动深度合并） | `ThemeConfig`     | -              |
| `locale`          | HiTalent Design 完整组件语言包                                    | `HtdLocale`       | `zh_CN`        |
| `antdLocale`      | 底层 Ant Design 语言包，透传给 antd                               | `Locale`          | -              |
| `localeOverrides` | 基于当前语言包的局部组件文案覆盖                                  | `LocaleOverrides` | -              |
| `direction`       | 文字与布局方向                                                    | `ltr \| rtl`      | 继承语言包方向 |
| `children`        | 使用当前配置的子节点                                              | `ReactNode`       | -              |

> 此外，`ConfigProvider` 继承了 Ant Design 5 原生 `ConfigProvider` 的全量配置属性（如 `componentSize`、`getPopupContainer`、`wave` 等），会完整透传至底层组件。

- `useConfig(): ConfigContextValue`：获取当前完整全局配置对象（包含 `prefixCls`, `theme`, `locale` 等）。
- `usePrefixCls(suffixCls?: string, customPrefix?: string): string`：获取拼接后的完整自研组件类名前缀。
- `useAntdPrefixCls(customAntdPrefix?: string): string`：获取当前生效的底层 Ant Design 类名前缀。
- `useLocale(componentName: keyof LocaleComponentMap, customLocale?: Partial<ComponentLocale>)`：获取指定组件当前的国际化文案对象（具备自动中文兜底与多级深层覆盖能力）。

## 如何自定义前缀与主题

由于 HiTalent Design 深度集成 **Ant Design 5 CSS-in-JS** 样式系统，**无需在 Webpack / Vite 中配置任何 Less 预编译变量**，所有类名前缀与主题 Token 均在运行时由 CSS-in-JS 引擎动态生成：

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

---

## 注意事项

- `antdPrefixCls` 会直接透传给 Ant Design 5 的底层 `<ConfigProvider>`，同步控制 antd 组件的类名前缀与动态 CSS-in-JS 生成。
- `theme` 会与外层 Theme 深度合并，支持动态切换主题色与暗黑模式；设置 `inherit: false` 可实现独立局部主题。
- `localeOverrides` 会在完整语言包之上深度合并，未覆盖字段继续继承默认 fallback。

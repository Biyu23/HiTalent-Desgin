---
category: Components
title: SvgIcon 自定义图标
toc: content
---

# SvgIcon 自定义图标

专门用于接管并渲染 UI 设计师提供的任意 SVG 图标，解决 SVG 尺寸不一、缺少 viewBox、颜色写死以及无法像 Ant Design 图标那样通过 `fontSize` 自由缩放的问题。

## 何时使用

- UI 设计师提供了各种尺寸（如 `24x24`、`37x19`、`1024x1024`）的 SVG，需要在 Antd 体系下统一等比缩放。
- 需要将一段 SVG 当作 Antd 图标使用，并支持 `size`、`color`、`spin`（加载旋转）、`rotate`（角度翻转）等特性。
- 需要将外部 SVG 无缝传入 Antd `Button` 的 `icon` 属性或导航菜单中。

## 核心特性

- **尺寸智能抹平**：自动将 SVG 根节点的硬编码宽高覆写为 `1em`，通过 `fontSize` 或 `size` 进行像素级精准控制。
- **viewBox 自动补全**：若 SVG 缺失 `viewBox`，自动根据原有尺寸推导生成，杜绝显示残缺与变形。
- **Ant Design 规范对齐**：底层基于 `@ant-design/icons` 的 `Icon` 组件包装，支持 `spin`、`rotate`、无障碍属性及 Native Props 穿透。
- **双模态支持**：既支持通过 `<SvgIcon><svg>...</svg></SvgIcon>` 行内直接使用，也支持通过 `createSvgIcon` 批量导出为独立图标组件。

## 代码演示

<code src="./demo/basic.tsx" title="直接包裹 SVG 渲染" description="直接将 UI 导出的带有固定宽高的 SVG 包裹在 SvgIcon 中，尺寸会自动抹平为 1em 并跟随 size 缩放。"></code>

<code src="./demo/create-icon.tsx" title="工厂函数批量封装" description="使用 createSvgIcon 工厂函数将一段 SVG 定义为可复用的独立图标组件。"></code>

<code src="./demo/size-color.tsx" title="尺寸、颜色与动画" description="支持通过 size 与 color 快速指定样式，并支持 spin 旋转动画与 rotate 角度旋转。"></code>

<code src="./demo/button-usage.tsx" title="配合 Button 与 Space 使用" description="与 Ant Design 的 Button、Space 等组件无缝搭配。"></code>

## API

### SvgIcon

| 属性      | 说明                                                                                  | 类型                                                 | 默认值  |
| --------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------- |
| children  | 自定义 SVG 元素节点（`<svg>...</svg>`）                                               | `ReactNode`                                          | -       |
| component | 自定义 SVG 组件函数                                                                   | `ComponentType<CustomIconComponentProps>`            | -       |
| size      | 图标尺寸，支持预设（`'small'` / `'middle'` / `'large'`）、数字（px）或 CSS 尺寸字符串 | `'small' \| 'middle' \| 'large' \| number \| string` | -       |
| color     | 图标颜色（配合 SVG 的 `currentColor`）                                                | `string`                                             | -       |
| spin      | 是否有旋转加载动画                                                                    | `boolean`                                            | `false` |
| rotate    | 图标旋转角度 (deg)                                                                    | `number`                                             | -       |
| className | 自定义 CSS 类名                                                                       | `string`                                             | -       |
| style     | 自定义样式对象                                                                        | `CSSProperties`                                      | -       |
| onClick   | 点击事件回调（支持键盘 Enter/Space 无障碍触发）                                       | `MouseEventHandler<HTMLSpanElement>`                 | -       |

### createSvgIcon(SvgChild, defaultProps?, displayName?)

| 参数         | 说明                            | 类型                            | 默认值            |
| ------------ | ------------------------------- | ------------------------------- | ----------------- |
| SvgChild     | 需要封装的 SVG React 元素或组件 | `ReactElement \| ComponentType` | -                 |
| defaultProps | 默认注入给 SvgIcon 的属性       | `Partial<SvgIconProps>`         | -                 |
| displayName  | 组件的 displayName              | `string`                        | `'CustomSvgIcon'` |

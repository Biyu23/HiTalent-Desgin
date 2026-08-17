import AntdIcon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import clsx from 'clsx';
import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  memo,
  useMemo,
} from 'react';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import { withNativeProps } from '../../util';
import type { SvgIconProps } from './type';

/**
 * 提取数字或去除单位 (如 '24px' -> 24)
 */
function parseDimension(val: unknown): number | null {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * 递归/深度清洗 SVG 根节点属性，接管其尺寸与坐标系
 */
function normalizeSvgElement(
  svgChild: React.ReactElement<React.SVGProps<SVGSVGElement>>,
  extraProps: CustomIconComponentProps | React.SVGProps<SVGSVGElement>,
): React.ReactElement {
  if (!isValidElement(svgChild)) return svgChild;

  const {
    width: originalWidth,
    height: originalHeight,
    viewBox: originalViewBox,
    style: childStyle,
    children: svgChildren,
    ...restChildProps
  } = (svgChild.props || {}) as React.SVGProps<SVGSVGElement>;

  // 1. 智能推导 viewBox：若未提供 viewBox，则利用原本的 width/height 自动推算
  let finalViewBox = originalViewBox;
  if (!finalViewBox) {
    const w = parseDimension(originalWidth);
    const h = parseDimension(originalHeight);
    if (w !== null && h !== null) {
      finalViewBox = `0 0 ${w} ${h}`;
    }
  }

  const {
    width: _extraW,
    height: _extraH,
    fill: extraFill,
    style: extraStyle,
    children: _extraChildren, // 忽略 @ant-design/icons 注入的 children: undefined，防止覆盖 SVG 内部子节点
    ...restExtraProps
  } = (extraProps || {}) as Record<string, any>;

  // 2. 强制覆盖 width/height 为 1em，以继承字体尺寸与响应式缩放
  return cloneElement(
    svgChild,
    {
      ...restChildProps,
      ...restExtraProps,
      viewBox: finalViewBox,
      width: '1em',
      height: '1em',
      fill:
        restChildProps.fill !== undefined
          ? restChildProps.fill
          : extraFill || 'currentColor',
      style: {
        ...childStyle,
        ...extraStyle,
      },
    },
    svgChildren,
  );
}

const SvgIcon = forwardRef<HTMLSpanElement, SvgIconProps>((props, ref) => {
  const {
    children,
    component: CustomComponent,
    size,
    color,
    spin,
    rotate,
    prefixCls: customPrefixCls,
    style,
    className,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('svg-icon', customPrefixCls);

  // 聚合尺寸与颜色样式
  const mergedStyle = useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = { ...style };
    if (size !== undefined) {
      s.fontSize = typeof size === 'number' ? `${size}px` : size;
    }
    if (color !== undefined) {
      s.color = color;
    }
    return s;
  }, [size, color, style]);

  const RenderSvg = useMemo(() => {
    if (CustomComponent) {
      return CustomComponent;
    }
    if (isValidElement<React.SVGProps<SVGSVGElement>>(children)) {
      const ComponentFromChild: React.FC<
        CustomIconComponentProps | React.SVGProps<SVGSVGElement>
      > = (svgProps) => normalizeSvgElement(children, svgProps);
      return ComponentFromChild;
    }
    return undefined;
  }, [CustomComponent, children]);

  if (!RenderSvg) {
    return null;
  }

  const iconElement = (
    <AntdIcon
      ref={ref}
      component={RenderSvg}
      spin={spin}
      rotate={rotate}
      className={clsx(prefixCls, className)}
      style={mergedStyle}
      {...restProps}
    />
  );

  return withNativeProps(props, iconElement);
});

SvgIcon.displayName = 'SvgIcon';

/**
 * 工厂函数：将一段 SVG 节点快速封装为符合 Antd 规范的独立 Icon 组件
 */
export function createSvgIcon(
  SvgChild: React.ReactElement<React.SVGProps<SVGSVGElement>>,
  defaultProps?: Partial<SvgIconProps>,
  displayName?: string,
) {
  const Component = forwardRef<HTMLSpanElement, SvgIconProps>((props, ref) => (
    <SvgIcon ref={ref} {...defaultProps} {...props}>
      {SvgChild}
    </SvgIcon>
  ));

  Component.displayName = displayName || 'CustomSvgIcon';
  return memo(Component);
}

export default memo(SvgIcon);

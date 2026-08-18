import AntdIcon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import clsx from 'clsx';
import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  memo,
  useCallback,
  useMemo,
} from 'react';
import { usePrefixCls } from '../../configProvider';
import { withNativeProps } from '../../util';
import type { SvgIconProps } from './type';

const PRESET_SIZES: Record<string, number> = {
  small: 14,
  middle: 16,
  large: 24,
};

function parseAbsoluteDimension(val: unknown): number | null {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^\d+(\.\d+)?(px)?$/.test(trimmed)) {
      const num = parseFloat(trimmed);
      return isNaN(num) ? null : num;
    }
  }
  return null;
}

function normalizeSvgElement(
  svgChild: React.ReactElement<React.SVGProps<SVGSVGElement>>,
  extraProps: CustomIconComponentProps | React.SVGProps<SVGSVGElement>,
  overrideProps?: { fill?: string; stroke?: string },
): React.ReactElement {
  if (!isValidElement(svgChild)) return svgChild;

  const {
    width: originalWidth,
    height: originalHeight,
    viewBox: originalViewBox,
    fill: originalFill,
    stroke: originalStroke,
    style: childStyle,
    children: svgChildren,
    ...restChildProps
  } = (svgChild.props || {}) as React.SVGProps<SVGSVGElement>;

  let finalViewBox = originalViewBox;
  if (!finalViewBox) {
    const w = parseAbsoluteDimension(originalWidth);
    const h = parseAbsoluteDimension(originalHeight);
    if (w !== null && h !== null) {
      finalViewBox = `0 0 ${w} ${h}`;
    }
  }

  const restExtraProps = { ...(extraProps || {}) } as Record<string, any>;
  const extraFill = restExtraProps.fill;
  const extraStyle = restExtraProps.style;
  delete restExtraProps.width;
  delete restExtraProps.height;
  delete restExtraProps.fill;
  delete restExtraProps.style;
  delete restExtraProps.children;

  let finalFill: string | undefined;

  if (overrideProps?.fill !== undefined) {
    finalFill = overrideProps.fill;
  } else if (originalFill !== undefined) {
    finalFill = originalFill;
  } else if (!originalStroke && !overrideProps?.stroke) {
    finalFill = extraFill || 'currentColor';
  } else {
    finalFill = undefined;
  }

  const finalStroke =
    overrideProps?.stroke !== undefined ? overrideProps.stroke : originalStroke;

  if (svgChild.type !== 'svg') {
    return (
      <svg
        {...restChildProps}
        {...restExtraProps}
        viewBox={finalViewBox || '0 0 1024 1024'}
        width="1em"
        height="1em"
        {...(finalFill !== undefined ? { fill: finalFill } : {})}
        {...(finalStroke !== undefined ? { stroke: finalStroke } : {})}
        style={{
          ...childStyle,
          ...extraStyle,
        }}
      >
        {svgChild}
      </svg>
    );
  }

  return cloneElement(
    svgChild,
    {
      ...restChildProps,
      ...restExtraProps,
      viewBox: finalViewBox,
      width: '1em',
      height: '1em',
      ...(finalFill !== undefined ? { fill: finalFill } : {}),
      ...(finalStroke !== undefined ? { stroke: finalStroke } : {}),
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
    fill,
    stroke,
    spin,
    rotate,
    prefixCls: customPrefixCls,
    style,
    tabIndex,
    onClick,
    onKeyDown,
    'aria-label': ariaLabel,
    title,
    ...restProps
  } = props;

  delete (restProps as Record<string, any>).className;

  const prefixCls = usePrefixCls('svg-icon', customPrefixCls);

  const isClickable = Boolean(onClick);
  const mergedStyle = useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = { ...style };
    if (size !== undefined) {
      const resolvedSize =
        typeof size === 'string' && PRESET_SIZES[size]
          ? `${PRESET_SIZES[size]}px`
          : size;
      s.fontSize =
        typeof resolvedSize === 'number' ? `${resolvedSize}px` : resolvedSize;
    }
    if (color !== undefined) {
      s.color = color;
    }
    if (isClickable && !s.cursor) {
      s.cursor = 'pointer';
    }
    return s;
  }, [size, color, style, isClickable]);

  const isDecorative = !ariaLabel && !title && !isClickable;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLSpanElement>);
      }
      onKeyDown?.(e);
    },
    [isClickable, onClick, onKeyDown],
  );

  const RenderSvg = useMemo(() => {
    if (CustomComponent) {
      return CustomComponent;
    }
    if (isValidElement<React.SVGProps<SVGSVGElement>>(children)) {
      const ComponentFromChild: React.FC<
        CustomIconComponentProps | React.SVGProps<SVGSVGElement>
      > = (svgProps) =>
        normalizeSvgElement(children, svgProps, { fill, stroke });
      return ComponentFromChild;
    }
    return undefined;
  }, [CustomComponent, children, fill, stroke]);

  if (!RenderSvg) {
    return null;
  }

  const iconElement = (
    <AntdIcon
      ref={ref}
      component={RenderSvg}
      spin={spin}
      rotate={rotate}
      className={prefixCls}
      style={mergedStyle}
      role={isClickable ? 'button' : isDecorative ? undefined : 'img'}
      tabIndex={isClickable ? tabIndex ?? 0 : tabIndex}
      aria-hidden={isDecorative ? true : undefined}
      aria-label={ariaLabel}
      title={title}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...restProps}
    />
  );

  return withNativeProps(props, iconElement);
});

SvgIcon.displayName = 'SvgIcon';

export function createSvgIcon(
  SvgChild:
    | React.ReactElement<React.SVGProps<SVGSVGElement>>
    | React.ComponentType<any>,
  defaultProps?: Partial<SvgIconProps>,
  displayName?: string,
) {
  const isComponent = typeof SvgChild === 'function';

  const Component = forwardRef<HTMLSpanElement, SvgIconProps>((props, ref) => {
    const { className, style, ...rest } = props;
    const mergedClassName = clsx(defaultProps?.className, className);
    const mergedStyle =
      defaultProps?.style || style
        ? { ...defaultProps?.style, ...style }
        : undefined;

    return (
      <SvgIcon
        ref={ref}
        component={
          isComponent ? (SvgChild as React.ComponentType<any>) : undefined
        }
        {...defaultProps}
        {...rest}
        className={mergedClassName || undefined}
        style={mergedStyle}
      >
        {!isComponent ? (SvgChild as React.ReactElement) : undefined}
      </SvgIcon>
    );
  });

  Component.displayName =
    displayName ||
    (typeof SvgChild === 'function' ? SvgChild.displayName : undefined) ||
    'CustomSvgIcon';

  return memo(Component);
}

export default memo(SvgIcon);

import { Drawer as AntdDrawer } from 'antd';
import clsx from 'clsx';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import DrawerResizeHandle from './components/DrawerResizeHandle';
import { useDrawerResize } from './hooks/useDrawerResize';
import './index.less';
import type { DrawerProps, DrawerResizableConfig } from './type';
import { getDrawerAxis } from './utils/placement';
import { DEFAULT_DRAWER_SIZE, resolveDrawerSize } from './utils/resize';

interface ManualSizes {
  horizontal?: number;
  vertical?: number;
}

const setRef = <T,>(ref: React.Ref<T> | undefined, value: T | null) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    (ref as { current: T | null }).current = value;
  }
};

/** 在 Ant Design 5 Drawer 基础上增加方向感知的拖动调整尺寸能力。 */
const Drawer: React.FC<DrawerProps> = (props) => {
  const {
    placement = 'right',
    size,
    defaultSize,
    maxSize,
    resizable = false,
    width,
    height,
    open,
    rootClassName,
    classNames,
    styles,
    panelRef: forwardedPanelRef,
    drawerRender: userDrawerRender,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('drawer');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [manualSizes, setManualSizes] = useState<ManualSizes>({});
  const axis = getDrawerAxis(placement);
  const legacySize = axis === 'horizontal' ? width : height;
  const controlledSize = size !== undefined ? size : legacySize;
  const isControlled = controlledSize !== undefined;
  const currentSize = resolveDrawerSize(
    isControlled
      ? controlledSize
      : manualSizes[axis] ?? defaultSize ?? DEFAULT_DRAWER_SIZE,
  );
  const resizeConfig: DrawerResizableConfig =
    typeof resizable === 'object' ? resizable : {};

  const handlePanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      setRef(forwardedPanelRef, node);
    },
    [forwardedPanelRef],
  );

  const handleSizeChange = useCallback(
    (nextSize: number) => {
      if (isControlled) return;
      setManualSizes((current) =>
        current[axis] === nextSize ? current : { ...current, [axis]: nextSize },
      );
    },
    [axis, isControlled],
  );

  const { isResizing, handlePointerDown } = useDrawerResize({
    placement,
    maxSize,
    active: !!open && !!resizable,
    config: resizeConfig,
    onSizeChange: handleSizeChange,
  });

  const {
    dragger: draggerClassName,
    wrapper: userWrapperClassName,
    ...antdClassNames
  } = classNames || {};
  const {
    dragger: draggerStyle,
    wrapper: userWrapperStyle,
    ...antdStyles
  } = styles || {};

  const mergedClassNames = useMemo(
    () => ({
      ...antdClassNames,
      wrapper: clsx(userWrapperClassName, `${prefixCls}-wrapper`, {
        [`${prefixCls}-wrapper-resizing`]: isResizing,
        [`${prefixCls}-wrapper-horizontal`]: axis === 'horizontal',
        [`${prefixCls}-wrapper-vertical`]: axis === 'vertical',
      }),
    }),
    [antdClassNames, axis, isResizing, prefixCls, userWrapperClassName],
  );

  const mergedStyles = useMemo(
    () => ({
      ...antdStyles,
      wrapper: {
        ...userWrapperStyle,
        ...(axis === 'horizontal'
          ? { maxWidth: '100%' }
          : { maxHeight: '100%' }),
      },
    }),
    [antdStyles, axis, userWrapperStyle],
  );

  const finalDrawerRender = useCallback(
    (drawerNode: React.ReactNode) => (
      <>
        {!!resizable && !!open && (
          <DrawerResizeHandle
            prefixCls={prefixCls}
            placement={placement}
            className={draggerClassName}
            style={draggerStyle}
            resizing={isResizing}
            onPointerDown={handlePointerDown}
          />
        )}
        {userDrawerRender ? userDrawerRender(drawerNode) : drawerNode}
      </>
    ),
    [
      draggerClassName,
      draggerStyle,
      handlePointerDown,
      isResizing,
      open,
      placement,
      prefixCls,
      resizable,
      userDrawerRender,
    ],
  );

  return (
    <AntdDrawer
      {...restProps}
      open={open}
      placement={placement}
      width={axis === 'horizontal' ? currentSize : undefined}
      height={axis === 'vertical' ? currentSize : undefined}
      rootClassName={clsx(prefixCls, rootClassName)}
      classNames={mergedClassNames}
      styles={mergedStyles}
      panelRef={handlePanelRef}
      drawerRender={finalDrawerRender}
    />
  );
};

export default memo(Drawer);

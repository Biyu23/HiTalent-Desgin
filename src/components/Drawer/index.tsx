import { MinusOutlined } from '@ant-design/icons';
import { Drawer as AntdDrawer, Button, Flex } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocale } from '../../configProvider/useLocale';
import { useNamespace, usePrefixCls } from '../../configProvider/usePrefixCls';
import MinimizedDock from '../_util/minimize/MinimizedDock';
import { useMinimizeState } from '../_util/minimize/useMinimizeState';
import DrawerResizeHandle from './components/DrawerResizeHandle';
import { useDrawerResize } from './hooks/useDrawerResize';
import './index.less';
import type { DrawerProps, DrawerRef, DrawerResizableConfig } from './type';
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

const resolveMinimizableClosable = (
  closable: DrawerProps['closable'],
  closeIcon: DrawerProps['closeIcon'],
): DrawerProps['closable'] => {
  if (closable === false || closeIcon === false || closeIcon === null) {
    return false;
  }
  if (typeof closable === 'object') {
    return { ...closable, placement: 'end' };
  }
  return { placement: 'end' };
};

/** 在 Ant Design 5 Drawer 基础上增加尺寸调整和最小化能力。 */
const Drawer = forwardRef<DrawerRef, DrawerProps>((props, ref) => {
  const {
    prefixCls: customPrefixCls,
    placement = 'right',
    size,
    defaultSize,
    maxSize,
    resizable = false,
    minimizable = false,
    minimized: controlledMinimized,
    minimizePosition = 'bottom-right',
    onMinimizeChange,
    width,
    height,
    open,
    title,
    extra,
    closable,
    closeIcon,
    destroyOnHidden,
    onClose,
    rootClassName,
    classNames,
    styles,
    panelRef: forwardedPanelRef,
    drawerRender: userDrawerRender,
    ...restProps
  } = props;

  const { prefixCls, e, em } = useNamespace('drawer', customPrefixCls);
  const dockPrefixCls = usePrefixCls('minimize');
  const drawerLocale = useLocale('Drawer');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [manualSizes, setManualSizes] = useState<ManualSizes>({});
  const { isMinimized, minimize, restore, reset } = useMinimizeState({
    minimized: controlledMinimized,
    onMinimizeChange,
  });
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

  const handleClose = useCallback(
    (event?: React.MouseEvent<Element> | React.KeyboardEvent<Element>) => {
      if (isMinimized) restore();
      reset();
      onClose?.(event);
    },
    [isMinimized, onClose, reset, restore],
  );

  useImperativeHandle(ref, () => ({ minimize, restore }), [minimize, restore]);

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
    active: !!open && !isMinimized && !!resizable,
    config: resizeConfig,
    onSizeChange: handleSizeChange,
  });

  const {
    dragger: draggerClassName,
    minimizeButton: minimizeButtonClassName,
    minimizedDock: minimizedDockClassName,
    wrapper: userWrapperClassName,
    ...antdClassNames
  } = classNames || {};
  const {
    dragger: draggerStyle,
    minimizeButton: minimizeButtonStyle,
    minimizedDock: minimizedDockStyle,
    wrapper: userWrapperStyle,
    ...antdStyles
  } = styles || {};

  const mergedClassNames = useMemo(
    () => ({
      ...antdClassNames,
      wrapper: clsx(userWrapperClassName, e('wrapper'), {
        [em('wrapper', 'resizing')]: isResizing,
        [em('wrapper', 'horizontal')]: axis === 'horizontal',
        [em('wrapper', 'vertical')]: axis === 'vertical',
      }),
    }),
    [antdClassNames, axis, e, em, isResizing, userWrapperClassName],
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

  const mergedExtra = useMemo(
    () =>
      minimizable ? (
        <Flex gap={8} align="center" className={e('header-actions')}>
          {extra}
          <Button
            size="small"
            type="text"
            className={minimizeButtonClassName}
            style={minimizeButtonStyle}
            onClick={minimize}
            icon={<MinusOutlined />}
            aria-label={drawerLocale.minimize}
          />
        </Flex>
      ) : (
        extra
      ),
    [
      drawerLocale.minimize,
      e,
      extra,
      minimizable,
      minimize,
      minimizeButtonClassName,
      minimizeButtonStyle,
    ],
  );

  const mergedClosable = useMemo(
    () =>
      minimizable ? resolveMinimizableClosable(closable, closeIcon) : closable,
    [closable, closeIcon, minimizable],
  );

  const mergedTitle = useMemo(
    () =>
      minimizable && !title ? (
        <span className={e('empty-title')} aria-hidden />
      ) : (
        title
      ),
    [e, minimizable, title],
  );

  const finalDrawerRender = useCallback(
    (drawerNode: React.ReactNode) => (
      <>
        {!!resizable && !!open && !isMinimized && (
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
      isMinimized,
      isResizing,
      open,
      placement,
      prefixCls,
      resizable,
      userDrawerRender,
    ],
  );

  return (
    <>
      <AntdDrawer
        {...restProps}
        open={open && !isMinimized}
        placement={placement}
        width={axis === 'horizontal' ? currentSize : undefined}
        height={axis === 'vertical' ? currentSize : undefined}
        title={mergedTitle}
        extra={mergedExtra}
        closable={mergedClosable}
        closeIcon={closeIcon}
        destroyOnHidden={minimizable ? false : destroyOnHidden}
        onClose={handleClose}
        rootClassName={clsx(prefixCls, rootClassName)}
        classNames={mergedClassNames}
        styles={mergedStyles}
        panelRef={handlePanelRef}
        drawerRender={finalDrawerRender}
      />
      <MinimizedDock
        open={open}
        minimized={isMinimized}
        title={title}
        position={minimizePosition}
        dockPrefixCls={dockPrefixCls}
        sourcePrefixCls={prefixCls}
        className={minimizedDockClassName}
        style={minimizedDockStyle}
        locale={drawerLocale}
        onRestore={restore}
        onClose={handleClose}
      />
    </>
  );
});

export default memo(Drawer);

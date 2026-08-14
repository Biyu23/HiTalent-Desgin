import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import clsx from 'clsx';
import React, { memo, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactDraggable from 'react-draggable';
import useDragBounds from '../../../hooks/useDragBounds';
import {
  decrementRefCount,
  ensureScrollWrapper,
  getExistingScrollWrapper,
  getMinimizeContainerId,
  incrementRefCount,
} from './dockContainer';
import './index.less';
import type { MinimizedDockProps } from './type';

const Draggable = ReactDraggable as any;

const MinimizedDockInner = memo<MinimizedDockProps>(
  ({
    title,
    position,
    dockPrefixCls,
    sourcePrefixCls,
    className,
    style,
    locale,
    onRestore,
    onClose,
  }) => {
    const { dragRef, bounds, onStart } = useDragBounds();
    const [scrollWrapperEl, setScrollWrapperEl] = useState<HTMLElement | null>(
      () => getExistingScrollWrapper(position, dockPrefixCls),
    );

    useLayoutEffect(() => {
      const containerId = getMinimizeContainerId(position, dockPrefixCls);
      const element = ensureScrollWrapper(position, dockPrefixCls);
      setScrollWrapperEl(element);
      incrementRefCount(containerId);

      return () => {
        if (decrementRefCount(containerId) <= 0) {
          document.getElementById(containerId)?.remove();
        }
      };
    }, [dockPrefixCls, position]);

    if (!scrollWrapperEl) return null;

    return createPortal(
      <Draggable
        key={`${dockPrefixCls}-${position}`}
        nodeRef={dragRef}
        bounds={bounds}
        onStart={onStart}
        handle={`.${dockPrefixCls}-header`}
      >
        <div
          ref={dragRef}
          className={clsx(
            `${dockPrefixCls}-dock`,
            sourcePrefixCls && `${sourcePrefixCls}-minimized-dock`,
            className,
          )}
          style={style}
          role="group"
          aria-label={locale.minimizedDockLabel}
        >
          <div
            className={clsx(
              `${dockPrefixCls}-header`,
              sourcePrefixCls && `${sourcePrefixCls}-minimized-header`,
            )}
            role="group"
            aria-label={locale.minimizedDockDragHandle}
          >
            <div
              className={clsx(
                `${dockPrefixCls}-title`,
                sourcePrefixCls && `${sourcePrefixCls}-title-text`,
              )}
            >
              {title}
            </div>
            <Flex
              gap={8}
              align="center"
              className={clsx(
                `${dockPrefixCls}-actions`,
                sourcePrefixCls && `${sourcePrefixCls}-minimized-actions`,
              )}
            >
              <Button
                size="small"
                type="text"
                onClick={() => onRestore()}
                icon={<ExpandOutlined />}
                aria-label={locale.restore}
              />
              <Button
                size="small"
                type="text"
                onClick={() => onClose()}
                icon={<CloseOutlined />}
                aria-label={locale.close}
              />
            </Flex>
          </div>
        </div>
      </Draggable>,
      scrollWrapperEl,
    );
  },
);

const MinimizedDock = memo<MinimizedDockProps>((props) => {
  if (!props.open || !props.minimized) return null;
  return <MinimizedDockInner {...props} />;
});

export default MinimizedDock;

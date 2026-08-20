import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import clsx from 'clsx';
import React, { memo, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactDraggable from 'react-draggable';
import {
  useNamespace,
  usePrefixCls,
} from '../../../configProvider/usePrefixCls';
import useDragBounds from '../../../hooks/useDragBounds';
import {
  decrementRefCount,
  ensureScrollWrapper,
  getExistingScrollWrapper,
  getMinimizeContainerId,
  incrementRefCount,
} from './dockContainer';
import { useStyle } from './style';
import type { MinimizedDockProps } from './type';

const Draggable = ReactDraggable as any;

const MinimizedDockInner = memo<MinimizedDockProps>(
  ({ title, position, className, style, locale, onRestore, onClose }) => {
    const dockPrefixCls = usePrefixCls('minimize');
    const { e } = useNamespace('minimize', dockPrefixCls);
    const { wrapSSR, hashId } = useStyle(dockPrefixCls);
    const { dragRef, bounds, onStart } = useDragBounds();
    const [scrollWrapperEl, setScrollWrapperEl] = useState<HTMLElement | null>(
      () => getExistingScrollWrapper(position, dockPrefixCls),
    );

    useLayoutEffect(() => {
      const containerId = getMinimizeContainerId(position, dockPrefixCls);
      const element = ensureScrollWrapper(position, dockPrefixCls, hashId);
      setScrollWrapperEl(element);
      incrementRefCount(containerId);

      return () => {
        if (decrementRefCount(containerId) <= 0) {
          document.getElementById(containerId)?.remove();
        }
      };
    }, [dockPrefixCls, hashId, position]);

    if (!scrollWrapperEl) return null;

    return wrapSSR(
      createPortal(
        <Draggable
          key={`${dockPrefixCls}-${position}`}
          nodeRef={dragRef}
          bounds={bounds}
          onStart={onStart}
          handle={`.${e('header')}`}
        >
          <div
            ref={dragRef}
            className={clsx(e('dock'), hashId, className)}
            style={style}
            role="group"
            aria-label={locale.minimizedDockLabel}
          >
            <div
              className={e('header')}
              role="group"
              aria-label={locale.minimizedDockDragHandle}
            >
              <div className={e('title')}>{title}</div>
              <Flex gap={8} align="center" className={e('actions')}>
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
      ),
    );
  },
);

const MinimizedDock = memo<MinimizedDockProps>((props) => {
  if (!props.open || !props.minimized) return null;
  return <MinimizedDockInner {...props} />;
});

export default MinimizedDock;

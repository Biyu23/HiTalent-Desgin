import { Button, Popover } from 'antd';
import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import { usePrefixCls } from '../../../configProvider';
import { useMergeState } from '../../../hooks';
import { setRef } from '../../../utils';
import { useTriggerWidth } from '../hooks/useTriggerWidth';
import { useStyles } from '../style';
import type { SelectorProps } from '../type';
import SelectorTrigger from './SelectorTrigger';

export const Selector = forwardRef<
  React.ComponentRef<typeof Button>,
  SelectorProps
>((props, ref) => {
  const prefixCls = usePrefixCls('popover-select', props.prefixCls);
  const { styles, cx } = useStyles();
  const [requestedOpen, { set: setOpen }] = useMergeState<boolean>({
    defaultValue: props.defaultOpen ?? false,
    value: props.open,
    onChange: props.onOpenChange,
  });
  const open = requestedOpen && !props.disabled;
  const triggerRef = useRef<React.ComponentRef<typeof Button> | null>(null);
  const handleRef = useCallback(
    (node: React.ComponentRef<typeof Button> | null) => {
      triggerRef.current = node;
      setRef(ref, node);
    },
    [ref],
  );
  const triggerWidth = useTriggerWidth(triggerRef, open);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useEffect(() => {
    if (props.disabled && requestedOpen) setOpen(false);
  }, [props.disabled, requestedOpen, setOpen]);
  return (
    <Popover
      fresh
      trigger="click"
      placement={props.placement ?? 'bottomLeft'}
      getPopupContainer={props.getPopupContainer}
      destroyTooltipOnHide={props.destroyTooltipOnHide}
      autoAdjustOverflow={props.autoAdjustOverflow ?? true}
      rootClassName={cx(styles.popover, props.classNames?.popup)}
      styles={{
        root: {
          minWidth: triggerWidth,
          maxWidth: 'calc(100vw - 16px)',
          ...props.styles?.popup,
        },
      }}
      afterOpenChange={props.afterOpenChange}
      open={open}
      content={
        props.disabled
          ? null
          : typeof props.content === 'function'
          ? props.content({ open, close })
          : props.content
      }
      onOpenChange={props.disabled ? undefined : setOpen}
    >
      <SelectorTrigger
        ref={handleRef}
        prefixCls={prefixCls}
        open={open}
        disabled={props.disabled}
        allowClear={props.allowClear}
        hasValue={props.hasValue}
        onClear={props.onClear}
        showArrow={props.showArrow}
        ellipsis={props.ellipsis}
        className={props.className}
        style={props.style}
        classNames={props.classNames}
        styles={props.styles}
      >
        {props.children}
      </SelectorTrigger>
    </Popover>
  );
});
Selector.displayName = 'PopoverSelect.Selector';
export default Selector;

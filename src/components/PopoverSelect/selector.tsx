import { CloseCircleOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useNamespace } from '../../configProvider/usePrefixCls';
import { useMergeState } from '../../hooks';
import { withNativeProps } from '../../util';
import { useStyle } from './style';
import type { SelectorProps } from './type';

const Selector = React.forwardRef<HTMLElement, SelectorProps>((props, ref) => {
  const {
    prefixCls: customPrefixCls,
    content,
    autoAdjustOverflow = true,
    rootClassName,
    afterOpenChange,
    placement = 'bottomLeft',
    getPopupContainer,
    destroyTooltipOnHide,
    children,
    open: openProp,
    onOpenChange: onOpenChangeProp,
    allowClear = true,
    hasValue,
    showArrow = true,
    disabled = false,
    onClear,
  } = props;
  const { prefixCls, e, em } = useNamespace('popover-select', customPrefixCls);
  const { wrapSSR, hashId } = useStyle(prefixCls);
  const [open, { set: onOpenChange }] = useMergeState<boolean>({
    defaultValue: false,
    value: openProp,
    onChange: onOpenChangeProp,
  });

  const hasClear = Boolean(allowClear && hasValue && !disabled);

  const renderChildren = () => {
    return <span className={clsx(e('selector-text'), hashId)}>{children}</span>;
  };

  const renderClearIcon = () => {
    if (!hasClear) return null;
    return (
      <CloseCircleOutlined
        className={clsx(e('selector-clear'), hashId, {
          [em('selector-clear', 'overlay')]: showArrow,
        })}
        onClick={(e) => {
          e.stopPropagation();
          onClear?.(e);
        }}
      />
    );
  };

  const renderArrow = () => {
    if (!showArrow) return null;
    return (
      <DownOutlined
        className={clsx(e('selector-arrow'), hashId, {
          [em('selector-arrow', 'has-clear')]: hasClear,
        })}
      />
    );
  };

  const renderActions = () => {
    const clearIcon = renderClearIcon();
    const arrowIcon = renderArrow();
    if (!clearIcon && !arrowIcon) return null;
    return (
      <span className={clsx(e('selector-actions'), hashId)}>
        {clearIcon}
        {arrowIcon}
      </span>
    );
  };

  const triggerButton = withNativeProps(
    props,
    <Button
      ref={ref as any}
      type="text"
      disabled={disabled}
      className={clsx(e('selector-btn'), hashId, {
        [em('selector-btn', 'active')]: hasValue,
        [em('selector-btn', 'open')]: open,
        [em('selector-btn', 'empty')]: !hasValue,
        [em('selector-btn', 'disabled')]: disabled,
      })}
    >
      {renderChildren()}
      {renderActions()}
    </Button>,
  );

  return wrapSSR(
    <Popover
      trigger="click"
      placement={placement}
      getPopupContainer={getPopupContainer}
      destroyTooltipOnHide={destroyTooltipOnHide}
      autoAdjustOverflow={autoAdjustOverflow}
      rootClassName={clsx(e('selector'), hashId, rootClassName)}
      afterOpenChange={afterOpenChange}
      open={disabled ? false : open}
      content={
        disabled ? null : typeof content === 'function' ? content() : content
      }
      onOpenChange={disabled ? undefined : onOpenChange}
    >
      {triggerButton}
    </Popover>,
  );
});

export default memo(Selector);

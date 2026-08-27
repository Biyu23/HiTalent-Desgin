import { CloseCircleOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import React, { forwardRef } from 'react';
import { usePrefixCls } from '../../../configProvider';
import { useMergeState } from '../../../hooks';
import { useStyles } from '../style';
import type { SelectorProps } from '../type';

/**
 * PopoverSelect.Selector 独立气泡触发器组件
 */
export const Selector = forwardRef<
  React.ComponentRef<typeof Button>,
  SelectorProps
>((props, ref) => {
  const prefixCls = usePrefixCls('popover-select', props.prefixCls);
  const { styles: selectStyles, cx } = useStyles(prefixCls);
  const {
    content,
    autoAdjustOverflow = true,
    afterOpenChange,
    placement = 'bottomLeft',
    getPopupContainer,
    destroyTooltipOnHide,
    children,
    open: openProp,
    onOpenChange: onOpenChangeProp,
    allowClear = false,
    hasValue = false,
    onClear,
    showArrow = true,
    disabled = false,
    className,
    style,
    rootClassName,
    classNames,
    styles,
  } = props;

  const [open, { set: setOpen }] = useMergeState<boolean>({
    defaultValue: false,
    value: openProp,
    onChange: onOpenChangeProp,
  });

  const hasClear = Boolean(allowClear && hasValue && !disabled);

  const trigger = (
    <Button
      ref={ref}
      type="text"
      disabled={disabled}
      className={cx(
        selectStyles.selectorBtn,
        hasValue && selectStyles.selectorBtnActive,
        open && selectStyles.selectorBtnOpen,
        disabled && selectStyles.selectorBtnDisabled,
        className,
        classNames?.trigger,
      )}
      style={{ ...styles?.trigger, ...style }}
    >
      <span className={cx(selectStyles.selectorText, classNames?.triggerText)}>
        {children}
      </span>
      {(hasClear || showArrow) && (
        <span className={cx(selectStyles.selectorActions, classNames?.actions)}>
          {hasClear && (
            <CloseCircleOutlined
              className={selectStyles.selectorClear}
              onClick={(event) => {
                event.stopPropagation();
                onClear?.(event);
              }}
            />
          )}
          {showArrow && <DownOutlined className={selectStyles.selectorArrow} />}
        </span>
      )}
    </Button>
  );

  return (
    <Popover
      trigger="click"
      placement={placement}
      getPopupContainer={getPopupContainer}
      {...(destroyTooltipOnHide !== undefined
        ? { destroyTooltipOnHide }
        : undefined)}
      autoAdjustOverflow={autoAdjustOverflow}
      rootClassName={cx(selectStyles.popover, rootClassName, classNames?.popup)}
      styles={{ root: styles?.popup }}
      afterOpenChange={afterOpenChange}
      open={disabled ? false : open}
      content={
        disabled ? null : typeof content === 'function' ? content() : content
      }
      onOpenChange={disabled ? undefined : setOpen}
    >
      {trigger}
    </Popover>
  );
});

Selector.displayName = 'PopoverSelect.Selector';
export default Selector;

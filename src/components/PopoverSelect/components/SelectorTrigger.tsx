import { CloseCircleOutlined, DownOutlined } from '@ant-design/icons';
import type { ButtonProps } from 'antd';
import { Button } from 'antd';
import React, { forwardRef } from 'react';
import { useStyles } from '../style';
import type { SelectorProps } from '../type';

type SelectorTriggerProps = Pick<
  SelectorProps,
  | 'allowClear'
  | 'hasValue'
  | 'onClear'
  | 'showArrow'
  | 'ellipsis'
  | 'classNames'
  | 'styles'
> &
  Omit<ButtonProps, 'styles' | 'classNames'> & {
    prefixCls: string;
    open: boolean;
  };

/** 纯触发器视图；转发 Popover 注入的事件和 ref。 */
const SelectorTrigger = forwardRef<
  React.ComponentRef<typeof Button>,
  SelectorTriggerProps
>(
  (
    {
      prefixCls,
      open,
      allowClear,
      hasValue,
      onClear,
      showArrow = true,
      ellipsis = true,
      disabled,
      className,
      style,
      classNames,
      styles,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { styles: triggerStyles, cx } = useStyles();
    const hasClear = !!(allowClear && hasValue && !disabled);
    return (
      <Button
        {...buttonProps}
        ref={ref}
        type="text"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cx(
          `${prefixCls}-selector`,
          triggerStyles.selectorBtn,
          hasValue && triggerStyles.selectorBtnActive,
          open && triggerStyles.selectorBtnOpen,
          disabled && triggerStyles.selectorBtnDisabled,
          className,
          classNames?.trigger,
        )}
        style={{ ...styles?.trigger, ...style }}
      >
        <span
          className={cx(
            triggerStyles.selectorText,
            ellipsis && triggerStyles.selectorTextEllipsis,
            classNames?.triggerText,
          )}
        >
          {children}
        </span>
        {(hasClear || showArrow) && (
          <span
            className={cx(triggerStyles.selectorActions, classNames?.actions)}
          >
            {hasClear && (
              <CloseCircleOutlined
                className={triggerStyles.selectorClear}
                onClick={(event) => {
                  event.stopPropagation();
                  onClear?.(event);
                }}
              />
            )}
            {showArrow && (
              <DownOutlined
                className={cx(
                  triggerStyles.selectorArrow,
                  open && triggerStyles.selectorArrowOpen,
                )}
              />
            )}
          </span>
        )}
      </Button>
    );
  },
);
SelectorTrigger.displayName = 'PopoverSelect.SelectorTrigger';
export default SelectorTrigger;

import { Button as AntdButton, Tooltip } from 'antd';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useActionRunner } from '../_util/useActionRunner';
import type { ButtonProps, ButtonRef, CompoundedButton } from './type';
import { parseTooltipConfig } from './utils/tooltip';

const Button = React.forwardRef<ButtonRef, ButtonProps>((props, ref) => {
  const {
    autoLoading = true,
    throttle = 0,
    onClick,
    children,
    disabled,
    tooltip,
    loading: propsLoading,
    block,
    className,
    style,
    rootClassName,
    classNames,
    styles,
    ...restProps
  } = props;
  const { pending, run } = useActionRunner<
    [React.MouseEvent<HTMLElement, MouseEvent>]
  >({ throttle, trackPending: autoLoading });
  const combinedLoading = pending ? true : propsLoading;
  const { needTooltip, tooltipTitle, tooltipProps } =
    parseTooltipConfig(tooltip);

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const isBusy = Boolean(pending || propsLoading);
    if (isBusy || disabled) return;
    if (onClick) run(onClick, e);
  };

  const buttonElement = (
    <AntdButton
      ref={ref}
      block={block}
      disabled={disabled}
      loading={combinedLoading}
      onClick={handleClick}
      className={clsx(rootClassName, classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      {...restProps}
    >
      <span className={classNames?.content} style={styles?.content}>
        {children}
      </span>
    </AntdButton>
  );

  if (!needTooltip) {
    return buttonElement;
  }

  return (
    <Tooltip title={tooltipTitle} {...tooltipProps}>
      {buttonElement}
    </Tooltip>
  );
});

const ExportedButton = memo(Button) as CompoundedButton;
ExportedButton.Group = AntdButton.Group;
ExportedButton.__ANT_BUTTON = true;

export default ExportedButton;

import { Button as AntdButton, Tooltip } from 'antd';
import React, { memo } from 'react';
import { useActionRunner } from '../_util/useActionRunner';
import type { ButtonProps, ButtonRef } from './type';
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
      {...restProps}
    >
      {children}
    </AntdButton>
  );

  if (!needTooltip) {
    return buttonElement;
  }

  // 当按钮处于禁用态时，由于原生 button 禁用会阻止鼠标事件，需外层包裹容器以触发 Tooltip
  const wrappedElement = disabled ? (
    <span
      style={{
        display: block ? 'block' : 'inline-block',
        width: block ? '100%' : undefined,
        cursor: 'not-allowed',
      }}
    >
      {buttonElement}
    </span>
  ) : (
    buttonElement
  );

  return (
    <Tooltip title={tooltipTitle} {...tooltipProps}>
      {wrappedElement}
    </Tooltip>
  );
});

type CompoundedComponent = React.MemoExoticComponent<
  React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<ButtonRef>>
> & {
  Group: typeof AntdButton.Group;
  __ANT_BUTTON?: boolean;
};

const ExportedButton = memo(Button) as CompoundedComponent;
ExportedButton.Group = AntdButton.Group;
ExportedButton.__ANT_BUTTON = true;

export default ExportedButton;

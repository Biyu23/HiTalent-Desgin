import { Button as AntdButton, Tooltip } from 'antd';
import React, { memo, useEffect, useRef, useState } from 'react';
import { isThenable } from '../../util';
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
    ...restProps
  } = props;
  const [innerLoading, setInnerLoading] = useState(false);
  const isUnmounted = useRef(false);
  const isThrottling = useRef(false);
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    isUnmounted.current = false;
    return () => {
      isUnmounted.current = true;
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      isThrottling.current = false;
    };
  }, []);

  const combinedLoading = innerLoading ? true : propsLoading;
  const { needTooltip, tooltipTitle, tooltipProps } =
    parseTooltipConfig(tooltip);

  const executeClick = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!onClick || disabled) return;
    const ret = onClick(e);
    if (autoLoading && isThenable(ret)) {
      setInnerLoading(true);
      try {
        await ret;
      } finally {
        if (!isUnmounted.current) {
          setInnerLoading(false);
        }
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const isBusy = Boolean(innerLoading || propsLoading);
    if (isBusy || disabled) return;

    if (Number.isFinite(throttle) && throttle > 0) {
      if (isThrottling.current) return;
      isThrottling.current = true;
      throttleTimerRef.current = setTimeout(() => {
        isThrottling.current = false;
      }, throttle);
    }

    executeClick(e);
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

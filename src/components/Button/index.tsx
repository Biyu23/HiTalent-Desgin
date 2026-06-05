import { Button as AntdButton } from 'antd';
import clsx from 'clsx';
import React, { memo, useEffect, useRef, useState } from 'react';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import { withNativeProps } from '../../util';
import './index.less';
import { ButtonProps } from './type';
const Button: React.FC<ButtonProps> = (props) => {
  const {
    iconPosition = 'left',
    autoLoading = true,
    debounce = 0,
    onClick,
    icon,
    children,
    loading: propsLoading,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('btn');
  const [innerLoading, setInnerLoading] = useState(false);
  const isUnmounted = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const combinedLoading = propsLoading || innerLoading;

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (combinedLoading) return;

    const executeClick = async () => {
      if (!onClick) return;
      const ret = onClick(e);
      if (autoLoading && ret && typeof ret.then === 'function') {
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
    if (debounce > 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        executeClick();
      }, debounce);
    } else {
      executeClick();
    }
  };

  const renderChildren = () => {
    if (!icon || iconPosition === 'left') {
      return children;
    }
    const placementStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      flexDirection:
        iconPosition === 'top'
          ? 'column'
          : iconPosition === 'bottom'
          ? 'column-reverse'
          : iconPosition === 'right'
          ? 'row-reverse'
          : 'row',
    };

    return (
      <span className={`${prefixCls}-content-wrapper`} style={placementStyles}>
        {!combinedLoading && (
          <span className={`${prefixCls}-icon`}>{icon}</span>
        )}
        {children !== null && <span>{children}</span>}
      </span>
    );
  };

  const nativeButtonIcon = iconPosition === 'left' ? icon : undefined;

  return withNativeProps(
    props,
    <AntdButton
      {...restProps}
      icon={nativeButtonIcon}
      loading={combinedLoading}
      onClick={handleClick}
      className={clsx(prefixCls, {
        [`${prefixCls}-placement-${iconPosition}`]:
          icon && iconPosition !== 'left',
      })}
    >
      {renderChildren()}
    </AntdButton>,
  );
};

export default memo(Button);

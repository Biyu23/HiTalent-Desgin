import { CloseCircleOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Popover, Typography } from 'antd';
import clsx from 'clsx';
import React, { memo } from 'react';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import { useMergeState } from '../../hooks';
import { withNativeProps } from '../../util';
import './index.less';
import { SelectorProps } from './type';
const Selector: React.FC<SelectorProps> = (props) => {
  const {
    content,
    autoAdjustOverflow,
    rootClassName,
    openClassName,
    afterOpenChange,
    children,
    open: openProp,
    onOpenChange: onOpenChangeProp,
    ellipsis,
    allowClear = true,
    hasValue,
    showArrow = true,
    onClear,
  } = props;
  const prefixCls = usePrefixCls('popover-selector');
  const [open, { set: onOpenChange }] = useMergeState<boolean>({
    defaultValue: false,
    value: openProp,
    onChange: onOpenChangeProp,
  });

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children();
    }
    return (
      <Typography.Paragraph className={`${prefixCls}-text`} ellipsis={ellipsis}>
        {children}
      </Typography.Paragraph>
    );
  };

  const renderClearIcon = () => {
    if (!allowClear || !hasValue) return null;
    return (
      <CloseCircleOutlined
        className={`${prefixCls}-clear`}
        onClick={(e) => {
          e.stopPropagation();
          onClear?.(e);
        }}
      />
    );
  };

  const renderArrow = () => {
    if (!showArrow) return null;
    return <DownOutlined className={`${prefixCls}-arrow`} />;
  };

  return withNativeProps(
    props,
    <Popover
      trigger="click"
      className={clsx({
        [`${prefixCls}-popover`]: true,
        [`${prefixCls}-open`]: open,
      })}
      autoAdjustOverflow={autoAdjustOverflow}
      rootClassName={rootClassName}
      openClassName={openClassName}
      afterOpenChange={afterOpenChange}
      open={open}
      content={content}
      onOpenChange={onOpenChange}
    >
      <Button
        type="text"
        className={clsx({
          [`${prefixCls}-btn`]: true,
          [`${prefixCls}-active-btn`]: hasValue,
        })}
      >
        {renderChildren()}
        {renderClearIcon()}
        {renderArrow()}
      </Button>
    </Popover>,
  );
};

export default memo(Selector);

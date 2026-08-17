import { CloseCircleOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Popover, Typography } from 'antd';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useNamespace } from '../../configProvider/usePrefixCls';
import { useMergeState } from '../../hooks';
import { withNativeProps } from '../../util';
import './index.less';
import type { SelectorProps } from './type';

const Selector: React.FC<SelectorProps> = (props) => {
  const {
    prefixCls: customPrefixCls,
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
  const { e, em } = useNamespace('popover-select', customPrefixCls);
  const [open, { set: onOpenChange }] = useMergeState<boolean>({
    defaultValue: false,
    value: openProp,
    onChange: onOpenChangeProp,
  });

  const renderChildren = () => {
    return (
      <Typography.Paragraph className={e('selector-text')} ellipsis={ellipsis}>
        {children}
      </Typography.Paragraph>
    );
  };

  const renderClearIcon = () => {
    if (!allowClear || !hasValue) return null;
    return (
      <CloseCircleOutlined
        className={e('selector-clear')}
        onClick={(e) => {
          e.stopPropagation();
          onClear?.(e);
        }}
      />
    );
  };

  const renderArrow = () => {
    if (!showArrow) return null;
    return <DownOutlined className={e('selector-arrow')} />;
  };

  return withNativeProps(
    props,
    <Popover
      trigger="click"
      autoAdjustOverflow={autoAdjustOverflow}
      rootClassName={clsx(e('selector'), rootClassName)}
      openClassName={clsx(openClassName, em('selector-btn', 'open'))}
      afterOpenChange={afterOpenChange}
      open={open}
      content={content()}
      onOpenChange={onOpenChange}
    >
      <Button
        type="text"
        className={clsx(e('selector-btn'), {
          [em('selector-btn', 'active')]: hasValue,
          [em('selector-btn', 'open')]: open,
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

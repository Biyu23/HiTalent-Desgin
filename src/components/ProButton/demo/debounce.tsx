/**
 * title: 防抖
 * description: 默认不开启 `debounce`等于0
 */
import { Space, message } from 'antd';
import { ProButton } from 'myui';
import React from 'react';

export default () => {
  const handleClick = () => {
    message.info('触发了点击事件！');
  };
  return (
    <Space>
      <ProButton type="primary" onClick={handleClick} debounce={1000}>
        防抖测试 (停顿 1s 后触发)
      </ProButton>
      <ProButton onClick={handleClick} debounce={0}>
        无防抖 (狂点测试)
      </ProButton>
    </Space>
  );
};

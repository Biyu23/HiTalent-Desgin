/**
 * title: 自动loading
 * description: 默认开启 `autoLoading`。当 `onClick` 返回一个 `Promise` 时，按钮会自动进入 `loading` 状态，并拦截点击操作，直到 Promise 决议后恢复。解决手动维护 `loading` 的烦恼。
 */
import { Space, message } from 'antd';
import { ProButton } from 'myui';
import React from 'react';

export default () => {
  const wait = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));
  const handleSubmit = async () => {
    await wait(2000);
    message.success('提交成功');
  };

  return (
    <Space>
      <ProButton type="primary" onClick={handleSubmit}>
        异步提交 (等待2秒)
      </ProButton>
      <ProButton onClick={handleSubmit} autoLoading={false}>
        关闭自动 Loading
      </ProButton>
    </Space>
  );
};

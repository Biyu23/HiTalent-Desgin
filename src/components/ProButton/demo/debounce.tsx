/**
 * title: 防抖
 * description: 默认不开启 `debounce`等于0
 */
import { Space, message } from 'antd';
import { ProButton } from 'myui';
import React, { useState } from 'react';

export default () => {
  const [count, setCount] = useState(0);

  const handleSyncClick = () => {
    setCount((c) => c + 1);
    message.info('点击生效！');
  };

  return (
    <Space direction="vertical">
      <div style={{ color: '#666' }}>当前数值: {count}</div>
      <Space>
        <ProButton
          type="primary"
          debounce={1000} // 点击后锁定 1000 毫秒
          onClick={handleSyncClick}
        >
          疯狂点击我测试 (防抖 1000ms)
        </ProButton>
      </Space>
    </Space>
  );
};

/**
 * title: 受控 Loading
 * description: 关闭 `autoLoading` 后，通过外部 `loading` 属性手动控制加载状态。适用于需要外部条件判断（如表单校验失败时不显示 loading）的场景。
 */
import { message, Space } from 'antd';
import { Button } from 'myui';
import React, { useState } from 'react';

export default () => {
  const [loading, setLoading] = useState(false);

  const handleManualSubmit = () => {
    setLoading(true);
    // 模拟异步操作，3 秒后由外部手动关闭 loading
    setTimeout(() => {
      setLoading(false);
      message.success('操作完成！');
    }, 3000);
  };

  return (
    <Space>
      <Button type="primary" loading={loading} onClick={handleManualSubmit}>
        {loading ? '处理中...' : '手动控制 Loading'}
      </Button>

      <Button
        autoLoading={false}
        onClick={() => {
          message.info('autoLoading 关闭，点击不会自动 loading');
        }}
      >
        关闭自动 Loading
      </Button>
    </Space>
  );
};

/**
 * description: 默认 `throttle` 为 `0`（不开启节流）。设置为正数毫秒值后，第一次点击立即触发，冷却期内后续点击被忽略，有效防止重复提交。
 */
import { Space } from 'antd';
import { Button } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'throttle.current': '当前数值',
    'throttle.label': '点击我测试 (节流 1000ms)',
  },
  'en-US': {
    'throttle.current': 'Current Value',
    'throttle.label': 'Click me (throttle 1000ms)',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((c) => c + 1);
  };

  return (
    <Space direction="vertical">
      <div style={{ color: '#666' }}>
        {t('throttle.current')}: {count}
      </div>
      <Space>
        <Button type="primary" throttle={1000} onClick={handleClick}>
          {t('throttle.label')}
        </Button>
      </Space>
    </Space>
  );
};

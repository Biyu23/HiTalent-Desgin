/**
 * title: 节流
 * description: 默认 `debounce` 为 `0`（不开启节流）。设置为正数毫秒值后，按钮首次点击立即执行，冷却期内忽略后续点击，有效防止重复提交。
 */
import { Space, message } from 'antd';
import { Button } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'debounce.current': '当前数值',
    'debounce.clicked': '点击生效！（节流 1000ms）',
    'debounce.label': '疯狂点击我测试 (节流 1000ms)',
  },
  'en-US': {
    'debounce.current': 'Current Value',
    'debounce.clicked': 'Click registered! (throttle 1000ms)',
    'debounce.label': 'Click me rapidly (throttle 1000ms)',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [count, setCount] = useState(0);

  const handleSyncClick = () => {
    setCount((c) => c + 1);
    message.info(t('debounce.clicked'));
  };

  return (
    <Space direction="vertical">
      <div style={{ color: '#666' }}>
        {t('debounce.current')}: {count}
      </div>
      <Space>
        <Button type="primary" debounce={1000} onClick={handleSyncClick}>
          {t('debounce.label')}
        </Button>
      </Space>
    </Space>
  );
};

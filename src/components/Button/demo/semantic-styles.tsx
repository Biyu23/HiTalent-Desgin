import { PlusOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { Button } from 'hi-talent-design';
import React from 'react';

export default () => (
  <Space>
    <Button
      icon={<PlusOutlined />}
      rootClassName="demo-button-boundary"
      classNames={{ icon: 'demo-button-icon' }}
      styles={{
        root: { borderRadius: 10 },
        icon: { color: '#1677ff' },
      }}
    >
      Semantic button
    </Button>
  </Space>
);

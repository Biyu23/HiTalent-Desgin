import { Space } from 'antd';
import { Button } from 'hi-talent-design';
import React from 'react';

export default () => (
  <Space>
    <Button
      rootClassName="demo-button-boundary"
      classNames={{ content: 'demo-button-content' }}
      styles={{
        root: { borderRadius: 10 },
        content: { letterSpacing: 1 },
      }}
    >
      Semantic button
    </Button>
  </Space>
);
